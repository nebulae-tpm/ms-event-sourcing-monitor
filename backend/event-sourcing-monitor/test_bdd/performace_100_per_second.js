// TEST LIBS
const assert = require("assert");
const Rx = require("rxjs");
const uuidv4 = require("uuid/v4");
const expect = require("chai").expect;

//LIBS FOR TESTING
const MqttBroker = require("../bin/tools/broker/MqttBroker");



let broker = undefined;


describe("E2E - Simple transaction", function() {



  /*
  * PREAPARE
  */
  describe("Prepare test DB and backends", function () {
      it("start MQTT broker", function (done) {
        broker = new MqttBroker({
          mqttServerUrl: process.env.MQTT_SERVER_URL,
          replyTimeout: process.env.REPLY_TIMEOUT || 2000
        });
        done();
      })
  });

  /*
  * SEND 10K EVENTS
  */

 describe("Send 10K events", function () {

  it("Send 10K events", function (done) {
    this.timeout(7200000);

    /**
     * 
     * @param {number} qty quantity of times to send the reload} 
     * @param {number} amount Reload amount
     * @param {string} buId Business unit who create the reload
     * @param {number} delay  delay between each event emition
     */
    const eventsEmitter = function(qty, delay = 0){
      const cardId = uuidv4();
      return Rx.Observable.range(0, qty)
      .concatMap((i) => broker.send$('Events', '', {
        _id: uuidv4(),
        et: "AfccReloadSold",
        etv: 1,
        at: "Afcc",
        aid: cardId,
        data: { },
        user: "juan.santa",
        timestamp: Date.now(),
        av: 1
      })
      .delay(delay)
    )
    }

    const logger = function(qty, delay){
      return Rx.Observable.range(0, qty)
      .concatMap((i) => Rx.Observable.of({})
      .do(() => console.log(`${i} of ${qty}`))
      .delay(delay)
    )
    }

    const timesToSendEvent = 50000;
    const delay = 100;
    Rx.Observable.forkJoin(
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        eventsEmitter(timesToSendEvent, delay),
        logger(timesToSendEvent, delay)
      )
    .subscribe(
      ok => { console.log("##### RELOADS MADE ==> ", ok.length); },
      error => { console.log(error); return done(error); },
      () => { console.log("[[################ 06 ################ Create ten AFCC reloads DONE ]]"); return done(); }
    )
  })

});




 

/*
* DE-PREAPARE
*/
//  describe('de-prepare test DB', function () {
//    it('delete mongoDB', function (done) {
//      this.timeout(8000);
//      Rx.Observable.of({})
//        .delay(5000)
//        .mergeMap(() => mongoDB.dropDB$())
//        .subscribe(
//          (evt) => console.log(`${evt}`),
//          (error) => {
//            console.error(`Mongo DropDB failed: ${error}`);
//            return done(error);
//          },
//          () => { return done(); }
//        );
//    });
//    it('stop mongo', function (done) {
//      this.timeout(4000);
//      Rx.Observable.of({})
//        .delay(1000)
//        .mergeMap(() => mongoDB.stop$())
//        .subscribe(
//          (evt) => console.log(`Mongo Stop: ${evt}`),
//          (error) => {
//            console.error(`Mongo Stop failed: ${error}`);
//            return done(error);
//          },
//          () => { return done(); }
//        );
//    });
// });



});
