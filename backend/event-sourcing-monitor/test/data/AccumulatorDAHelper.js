// TEST LIBS
const assert = require('assert');
const Rx = require('rxjs');
const uuid = require('uuid-v4');

//LIBS FOR TESTING
const AccumulatorDAHelper = require('../../bin/data/AccumulatorDAHelper');
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


    describe('Change UTC Precisions', function () {
        it('change to minute precision', function (done) {

            const millis = 1531943220012;
            const expected = 1531943220000;
            AccumulatorDAHelper.changeTimeStampPrecision$(millis,'MINUTE')
            .subscribe(
                (changed) => {                    
                    assert.equal(changed,expected, 'minutes precision');
                },
                (error) => {
                    console.error(`Error minutes precision: ${error}`);
                    return done(error);
                },
                () => {
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
