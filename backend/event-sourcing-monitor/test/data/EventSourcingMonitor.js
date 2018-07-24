// // TEST LIBS
// const assert = require('assert');
// const Rx = require('rxjs');
// const uuid = require('uuid-v4');

// //LIBS FOR TESTING
// const EventSourcingMonitor = require("../../bin/domain/EventSourcingMonitor")();
// const MongoDB = require('../../bin/data/MongoDB').MongoDB;

// //GLOABAL VARS to use between tests
// let mongoDB;


// /*
// NOTES:
// before run please start docker-compose:
//   cd deployment/compose/
//   docker-compose up
// */

// describe('Event sourcing monitor (domain class)', () => {
//     it('send One event and check', (done) => {
//         const event = { et: "DeviceConnected", etv: "1_4_Beta", at: "Device", data: {}, user: "Felipe Santa", timestamp: 1531943220000, _id: "1" };            
//         Rx.Observable.concat(
//             EventSourcingMonitor.handleEvent$(event),
//         ).toArray()
//         .subscribe(               
//             ([response]) => {
//                 console.log(response);
//             },
//             (error) => {
//                 console.error(`Error comulating events: ${error}`);
//                 return done(error);
//             },
//             () => {
//                 // assert.equal(respCount, 1,'respCount missmatch');
//                 return done();
//             }
//         );
//     });
   


   
// });
