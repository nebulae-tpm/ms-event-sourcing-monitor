// TEST LIBS
const assert = require('assert');
const Rx = require('rxjs');
const uuid = require('uuid-v4');

//LIBS FOR TESTING
const MonthAccumulatorDA = require('../../bin/data/MonthAccumulatorDA');
const MongoDB = require('../../bin/data/MongoDB').MongoDB;

//GLOABAL VARS to use between tests
let mongoDB;


/*
NOTES:
before run please start docker-compose:
  cd deployment/compose/
  docker-compose up
*/

describe('MONTH Accumulator Data Access', () => {
    describe("Prepare Environment", () => {
      it("Create Mongo instance", done => {
        mongoDB = new MongoDB({
          url: "mongodb://localhost:27017",
          dbName: `TEST_001`
        });
        mongoDB
          .start$()
          .mergeMap(() => MonthAccumulatorDA.start$(mongoDB))
          .subscribe(evt => console.log(`MongoDB start: ${evt}`), error => {
              console.error(`MongoDB start: ${error}`);
              return done(error);
            }, () => {
              console.error(`MongoDB start completed`);
              return done();
            });
      });
    });

    describe('event accumulators', () => {
        const users = ["Felipe", "Esteban", "Daniel", "Sebas", "Camilo", "Leon"];
        const agreggateTypes = ["Device", "Cronjob"];
        const versions = ["1_Beta", "2_Beta", "1_alfa"];
        const eventTypes = ["DeviceConnected", "DeviceRamuUsageAlarmActivated"]


       

        it('commulate 1 and check', (done) => {
            const event = { et: "DeviceConnected", etv: "1_4_Beta", at: "Device", data: {}, user: "Felipe_Santa", timestamp: 1531943220000, _id: "1" };            
            Rx.Observable.concat(
                MonthAccumulatorDA.getAccumulateData$(event.timestamp),
                MonthAccumulatorDA.cumulateEvent$(event),
                MonthAccumulatorDA.getAccumulateData$(event.timestamp)
            ).toArray()
            .subscribe(               
                ([prevAcc, evt, acc]) => {
                    if (prevAcc == null) {
                        assert.equal(acc["globalHits"], 1, 'Global hits'  )
                        assert.equal(acc["eventsHits"][evt.et], 1, 'Hits by event');
                        assert.equal(acc["userHits"][evt.user], 1, 'Hits by user')
                        assert.equal(acc["eventTypes"][evt.et]["userHits"][`${evt.user}`], 1, 'Hits by User in a specific event type')
                        assert.equal(acc["eventTypes"][evt.et]["versionHits"][`${evt.etv}`], 1, 'Hits by Version in a specific event type')
                    } else {
                        assert.equal(acc["globalHits"], prevAcc["globalHits"] + 1, 'Global hits'  )
                        assert.equal(acc["eventsHits"][evt.et], prevAcc["eventsHits"][evt.et] + 1, 'Hits by event');
                        assert.equal(acc["userHits"][evt.user], prevAcc["userHits"][evt.user] + 1, 'Hits by user')
                        assert.equal(acc["eventTypes"][evt.et]["userHits"][`${evt.user}`], prevAcc["eventTypes"][evt.et]["userHits"][`${evt.user}`] + 1, 'Hits by User in a specific event type')
                        assert.equal(acc["eventTypes"][evt.et]["versionHits"][`${evt.etv}`], prevAcc["eventTypes"][evt.et]["versionHits"][`${evt.etv}`] + 1, 'Hits by Version in a specific event type')                        
                    }
                },
                (error) => {
                    console.error(`Error comulating events: ${error}`);
                    return done(error);
                },
                () => {
                    return done();
                }
            );
        });


        it('Commulate several events', (done) => {
            Rx.Observable.of({})
                .mergeMap(() => Rx.Observable.range(0, 500)
                    .map((i) => {
                        return {
                            et: eventTypes[Math.floor(Math.random() * 2)],
                            etv: versions[Math.floor(Math.random() * 3)],
                            at: agreggateTypes[Math.floor(Math.random() * 2)],
                            user: users[Math.floor(Math.random() * 6)],
                            timestamp: Date.now() + (i * 10000),
                            _id: "1"
                        }
                    })
                    .mergeMap(evt => MonthAccumulatorDA.cumulateEvent$(evt))
                    .toArray())
                .subscribe(
                    (result) => {
                    },
                    (error) => {
                        console.error(`Error comulating events: ${error}`);
                        return done(error);
                    },
                    () => {
                        return done();
                    }
                )
        });

        it('Event Searcher since a timestamp',  (done) => {
            const timeFalg = 1532029894991;
            MonthAccumulatorDA.getAccumulateDataInTimeRange$(timeFalg, 10)
            .subscribe(
                (result) => {
                },
                (error) => {
                    console.error(`Error getting Accumulated events in range: ${error}`);
                    return done(error);
                },
                () => {
                    return done();
                }
            );
        });

        it('Event Searcher around the timestamp',  (done) => {
            const timeFalg = 1532029894991;
            console.log("########",new Date(timeFalg).toLocaleString(), "########");
            MonthAccumulatorDA.getAccumulateDataAroundTimestamp$(timeFalg, 2)
            .subscribe(
                (result) => {
                },
                (error) => {
                    console.error(`Error getting Accumulated events around the timestamp: ${error}`);
                    return done(error);
                },
                () => {
                    return done();
                }
            );
        });
    });


    describe('de-prepare Envrionment', () => {        
        it('stop Mongo',  (done) => {
            mongoDB.stop$()
                .subscribe(
                    (evt) => console.log(`MongoDB stop: ${evt}`),
                    (error) => {
                        console.error(`MongoDB stop: ${error}`);
                        return done(false);
                    },
                    () => {
                        console.error(`MongoDB stop completed`);
                        return done();
                    }
                );
        });
    });
});
