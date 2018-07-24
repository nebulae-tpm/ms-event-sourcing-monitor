"use strict";
const Rx = require("rxjs");
const eventSourcing = require("../../tools/EventSourcing")();
const eventSourcingMonitor = require("../../domain/EventSourcingMonitor")();

/**
 * Singleton instance
 */
let instance;
/**
 * Micro-BackEnd key
 */
const mbeKey = "ms-event-sourcing-monitor_mbe_event-sourcing-monitor";

class EventStoreService {
  constructor() {
    this.functionMap = this.generateFunctionMap();
    this.subscriptions = [];
    this.aggregateEventsArray = this.generateAggregateEventsArray();
  }

  /**
   * Starts listening to the EventStore
   * Returns observable that resolves to each subscribe agregate/event
   *    emit value: { aggregateType, eventType, handlerName}
   */
  start$() {

    Rx.Observable.interval(1000).subscribe(() => {

      const users = ["Felipe", "Esteban", "Daniel", "Sebas", "Camilo", "Leon"];
      const agreggateTypes = ["Device", "Cronjob"];
      const versions = ["1_Beta", "2_Beta", "1_alfa"];
      const eventTypes = ["DeviceConnected", "DeviceRamuUsageAlarmActivated"]

      const evt = {
        et: eventTypes[Math.floor(Math.random() * 2)],
        etv: versions[Math.floor(Math.random() * 3)],
        at: agreggateTypes[Math.floor(Math.random() * 2)],
        user: users[Math.floor(Math.random() * 6)],
        timestamp: Date.now(),
        _id: "1"
      };

      eventSourcingMonitor.handleEvent$(evt)
      .subscribe(
        (r) => { console.log(r) },
        (error) => console.log(error),
        () => console.log("Finished")
      );
    })

    //default error handler
    const onErrorHandler = error => {
      console.error("Error handling  EventStore incoming event", error);
      process.exit(1);
    };
    //default onComplete handler
    const onCompleteHandler = () => {
      () => console.log("EventStore incoming event subscription completed");
    };
    console.log("EventStoreService starting ...");

    return Rx.Observable.from(this.aggregateEventsArray)
      .map(aggregateEvent => { return { ...aggregateEvent, onErrorHandler, onCompleteHandler } })
      .map(params => this.subscribeEventHandler(params));
  }

  /**
   * Stops listening to the Event store
   * Returns observable that resolves to each unsubscribed subscription as string
   */
  stop$() {
    return Rx.Observable.from(this.subscriptions).map(subscription => {
      subscription.subscription.unsubscribe();
      return `Unsubscribed: aggregateType=${aggregateType}, eventType=${eventType}, handlerName=${handlerName}`;
    });
  }

  /**
     * Create a subscrition to the event store and returns the subscription info     
     * @param {{aggregateType, eventType, onErrorHandler, onCompleteHandler}} params
     * @return { aggregateType, eventType, handlerName  }
     */
  subscribeEventHandler({ aggregateType, eventType, onErrorHandler, onCompleteHandler }) {
    const handler = this.functionMap[eventType];
    const subscription =
      //MANDATORY:  AVOIDS ACK REGISTRY DUPLICATIONS
      eventSourcing.eventStore.ensureAcknowledgeRegistry$(aggregateType)
        .mergeMap(() => eventSourcing.eventStore.getEventListener$(aggregateType, mbeKey))
        .filter(evt => evt.et === eventType)
        .mergeMap(evt => Rx.Observable.concat(
          handler.fn.call(handler.obj, evt),
          //MANDATORY:  ACKWOWLEDGE THIS EVENT WAS PROCESSED
          eventSourcing.eventStore.acknowledgeEvent$(evt, mbeKey),
        ))
        .subscribe(
          (evt) => {
            // console.log(`EventStoreService: ${eventType} process: ${evt}`);
          },
          onErrorHandler,
          onCompleteHandler
        );
    this.subscriptions.push({ aggregateType, eventType, handlerName: handler.fn.name, subscription });
    return { aggregateType, eventType, handlerName: `${handler.obj.name}.${handler.fn.name}` };
  }

  /**
  * Starts listening to the EventStore
  * Returns observable that resolves to each subscribe agregate/event
  *    emit value: { aggregateType, eventType, handlerName}
  */
  syncState$() {
    return Rx.Observable.from(this.aggregateEventsArray)
      .concatMap(params => this.subscribeEventRetrieval$(params))
  }


  /**
   * Create a subscrition to the event store and returns the subscription info     
   * @param {{aggregateType, eventType, onErrorHandler, onCompleteHandler}} params
   * @return { aggregateType, eventType, handlerName  }
   */
  subscribeEventRetrieval$({ aggregateType, eventType }) {
    const handler = this.functionMap[eventType];
    //MANDATORY:  AVOIDS ACK REGISTRY DUPLICATIONS
    return eventSourcing.eventStore.ensureAcknowledgeRegistry$(aggregateType)
      .switchMap(() => eventSourcing.eventStore.retrieveUnacknowledgedEvents$(aggregateType, mbeKey))
      .filter(evt => evt.et === eventType)
      .concatMap(evt => Rx.Observable.concat(
        handler.fn.call(handler.obj, evt),
        //MANDATORY:  ACKWOWLEDGE THIS EVENT WAS PROCESSED
        eventSourcing.eventStore.acknowledgeEvent$(evt, mbeKey)
      ));
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  /////////////////// CONFIG SECTION, ASSOC EVENTS AND PROCESSORS BELOW     //////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  generateFunctionMap() {
    return {

      //Sample for handling event-sourcing events, please remove
      HelloWorldEvent: {
        fn: eventSourcingMonitor.handleHelloWorld$,
        obj: eventSourcingMonitor
      }
    };
  }

  /**
  * Generates a map that assocs each AggretateType withs its events
  */
  generateAggregateEventsArray() {
    return [

      //Sample for assoc events and aggregates, please remove
      {
        aggregateType: "HelloWorld",
        eventType: "HelloWorldEvent"
      },

    ]
  }
}



module.exports = () => {
  if (!instance) {
    instance = new EventStoreService();
    console.log("NEW  EventStore instance  !!");
  }
  return instance;
};

