// TEST LIBS
const assert = require('assert');
const Rx = require('rxjs');
const uuid = require('uuid-v4');

//LIBS FOR TESTING
const MinuteAccumulatorDA = require('../../bin/data/MinuteAccumulatorDA');
const MongoDB = require('../../bin/data/MongoDB').MongoDB;

//GLOABAL VARS to use between tests
let mongoDB;


/*
NOTES:
before run please start docker-compose:
  cd deployment/compose/
  docker-compose up
*/

describe('Minute Accumultor Data Access', function () {
    describe('Prepare Environment', function () {
        it('instance MongoDB client', (done) => {
            mongoDB = new MongoDB(
                {
                    url: 'mongodb://localhost:27017',
                    dbName: `TEST_${uuid()}`,
                }
            );
            mongoDB.start$()
                .mergeMap(() => MinuteAccumulatorDA.start$(mongoDB))
                .subscribe(
                    (evt) => console.log(`MongoDB start: ${evt}`),
                    (error) => {
                        console.error(`MongoDB start: ${error}`);
                        return done(error);
                    },
                    () => {
                        console.error(`MongoDB start completed`);
                        return done();
                    }
                );
        });
    });


    describe('event accumulators', function () {
        it('commulate 1 and check', function (done) {

            const event = {"et":"DeviceConnected","etv":1,"at":"Device","data":{},"user":"JOHNDOE","timestamp":1531943220000,"_id":"1"};
            let respCount = 0;

            Rx.Observable.concat(
                MinuteAccumulatorDA.cumulateEvent$(event),
                MinuteAccumulatorDA.getAccumulateData$(event.timestamp)
            ).subscribe(
                ([evt, acc]) => {
                    respCount++;
                    assert.equal(acc.hits,1, 'general hits');
                },
                (error) => {
                    console.error(`Error comulating events: ${error}`);
                    return done(error);
                },
                () => {
                    assert.equal(respCount, 1,'respCount missmatch');
                    return done();
                }
            );
        });
    });


    describe('de-prepare Envrionment', function () {
        it('stop Mongo', function (done) {
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
