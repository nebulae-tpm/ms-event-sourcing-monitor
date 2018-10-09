// // TEST LIBS
// const assert = require('assert');
// const Rx = require('rxjs');
// const uuid = require('uuid-v4');

// //LIBS FOR TESTING
// const MinuteAccumulatorDA = require('../../bin/data/MinuteAccumulatorDA');
// const MongoDB = require('../../bin/data/MongoDB').MongoDB;

// //GLOABAL VARS to use between tests
// let mongoDB;


// /*
// NOTES:
// before run please start docker-compose:
//   cd deployment/compose/
//   docker-compose up
// */

// describe('MongoDB', () => {

//     describe('Prepare Environment', () => {
//         it('instance MongoDB client', (done) => {
//             mongoDB = new MongoDB(
//                 {
//                     url: 'mongodb://localhost:27017',
//                     dbName: `TEST_${uuid()}`,
//                 }
//             );
//             mongoDB.start$()
//             .subscribe(
//                 (evt) => console.log(`MongoDB start: ${evt}`),
//                 (error) => {
//                     console.error(`MongoDB start: ${error}`);
//                     return done(error);
//                 },
//                 () => {
//                     console.error(`MongoDB start completed`);
//                     return done();
//                 }
//             );
//         });
//     });    

//     describe('de-prepare Envrionment', () => {
//         it('stop Mongo', function (done) {
//             mongoDB.stop$()
//             .subscribe(
//                 (evt) => console.log(`MongoDB stop: ${evt}`),
//                 (error) => {
//                     console.error(`MongoDB stop: ${error}`);
//                     return done(false);
//                 },
//                 () => {
//                     console.error(`MongoDB stop completed`);
//                     return done();
//                 }
//             );
//         });
//     });
// });


// TO GENERATE EVENTS
    // Rx.Observable.of({})
    //   .delay(5000)
    //   .mergeMap(() =>
    //     Rx.Observable.interval(300)
    //       .mergeMap(() => {
    //         const eventTypes = ['BasicInfoTagCreated', 'EventA', 'EventB', 'EventC', 'EventD'];
    //         const users = ['Felipe', 'Sebas', 'Camilo', 'Daniel', 'Esteban'];
    //         return  eventSourcing.eventStore
    //         .emitEvent$(
    //           new Event({
    //             eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    //             eventTypeVersion: 1,
    //             aggregateType: "Device",
    //             aggregateId: Date.now(),
    //             data: {},
    //             user: users[Math.floor(Math.random() * users.length)]
    //           })
    //         );
    //         })
    //   )
    //   .subscribe(
    //     ok => { },
    //     e => console.log(e),
    //     () => { }
    //   );