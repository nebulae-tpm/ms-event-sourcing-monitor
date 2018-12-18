const withFilter = require("graphql-subscriptions").withFilter;
const PubSub = require("graphql-subscriptions").PubSub;
const pubsub = new PubSub();
const { of } = require("rxjs");
const { mergeMap, catchError, map } = require("rxjs/operators");
const broker = require("../../broker/BrokerFactory")();

function getReponseFromBackEnd$(response) {
    return of(response)
    .pipe(
        map(resp => {
            if (resp.result.code != 200) {
                const err = new Error();
                err.name = 'Error';
                err.message = resp.result.error;
                // this[Symbol()] = resp.result.error;
                Error.captureStackTrace(err, 'Error');
                throw err;
            }
            return resp.data;
        })
    );
}


module.exports = {
    //// QUERY ///////
    Query: {
        getTimeFramesSinceTimestampFromEventSourcingMonitor(root, args, context) {
            return broker
                .forwardAndGetReply$(
                    "EventSourcingSummary",
                    "gateway.graphql.query.getTimeFramesSinceTimestamp",
                    { root, args, jwt: context.encodedToken },
                    2000
                ).pipe(
                    mergeMap(response => getReponseFromBackEnd$(response))
                )
                .toPromise();
        }
    },

    //// MUTATIONS ///////


    // SUBSCRIPTIONS ///////
    Subscription: {
        EventMonitorUpdateAvailable: {
            subscribe: withFilter(
                (payload, variables, context, info) => {
                    return pubsub.asyncIterator("EventMonitorUpdateAvailable");
                },
                (payload, variables, context, info) => {
                    return true;
                }
            )
        }

    }
};



//// SUBSCRIPTIONS SOURCES ////

const eventDescriptors = [
    {
        backendEventName: 'EventMonitorUpdateAvailable',
        gqlSubscriptionName: 'EventMonitorUpdateAvailable',
        //dataExtractor: (evt) => evt.data,// OPTIONAL, only use if needed
        //onError: (error, descriptor) => console.log(`Error processing ${descriptor.backendEventName}`),// OPTIONAL, only use if needed
        //onEvent: (evt, descriptor) => console.log(`Event of type  ${descriptor.backendEventName} arraived: ${JSON.stringify(evt)}`),// OPTIONAL, only use if needed
    },
];


/**
 * Connects every backend event to the right GQL subscription
 */
eventDescriptors.forEach(descriptor => {
    broker
        .getMaterializedViewsUpdates$([descriptor.backendEventName])
        .subscribe(
            evt => {
                if (descriptor.onEvent) {
                    descriptor.onEvent(evt, descriptor);
                }
                const payload = {};
                payload[descriptor.gqlSubscriptionName] = descriptor.dataExtractor ? descriptor.dataExtractor(evt) : evt.data
                pubsub.publish(descriptor.gqlSubscriptionName, payload);
            },
            error => {
                if (descriptor.onError) {
                    descriptor.onError(error, descriptor);
                }
                console.error( `Error listening ${descriptor.gqlSubscriptionName}`, error );
            },
            () => console.log( `${descriptor.gqlSubscriptionName} listener STOPED` )
        );
});


