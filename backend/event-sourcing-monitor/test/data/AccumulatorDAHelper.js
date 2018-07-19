// TEST LIBS
const assert = require("assert");
const Rx = require("rxjs");
const uuid = require("uuid-v4");

//LIBS FOR TESTING
const AccumulatorDAHelper = require("../../bin/data/AccumulatorDAHelper");
const MinuteAccumulatorDA = require("../../bin/data/MinuteAccumulatorDA");
const MongoDB = require("../../bin/data/MongoDB").MongoDB;

//GLOABAL VARS to use between tests
let mongoDB;

/*
NOTES:
before run please start docker-compose:
  cd deployment/compose/
  docker-compose up
*/

describe("prove all result from changeTimeStampPrecision", () => {

    const currentMillis = 1532026449497

  describe("change to each option avaliable for changeTimeStampPrecision$", () => {
    it("change to minute precision", (done) => {
      const expected = 1532026440000;
      AccumulatorDAHelper.changeTimeStampPrecision$(currentMillis, "MINUTE").subscribe(
        changed => {
          assert.equal(changed, expected, "minutes precision");
        },
        error => {
          console.error(`Error minutes precision: ${error}`);
          return done(error);
        },
        () => {
          return done();
        }
      );
    });

    it("change to hour precision", (done) => {
        const expected = 1532023200000;
        AccumulatorDAHelper.changeTimeStampPrecision$(currentMillis, "HOUR").subscribe(
          changed => {
            assert.equal(changed, expected, "Hour precicion");
          },
          error => {
            console.error(`Error Hour precision: ${error}`);
            return done(error);
          },
          () => {
            return done();
          }
        );
      });

      it("change to Day precision", (done) => {
        const expected = 1531976400000;
        AccumulatorDAHelper.changeTimeStampPrecision$(currentMillis, "DAY").subscribe(
          changed => {
            assert.equal(changed, expected, "DAY precicion");
          },
          error => {
            console.error(`Error DAY precision: ${error}`);
            return done(error);
          },
          () => {
            return done();
          }
        );
      });

      it("change to Month precision", (done) => {
        const expected = 1530421200000;
        AccumulatorDAHelper.changeTimeStampPrecision$(currentMillis, "MONTH").subscribe(
          changed => {
            assert.equal(changed, expected, "Month precicion");
          },
          error => {
            console.error(`Error Month precision: ${error}`);
            return done(error);
          },
          () => {
            return done();
          }
        );
      });

      it("change to year precision", (done) => {
        const expected = 1514782800000;
        AccumulatorDAHelper.changeTimeStampPrecision$(currentMillis, "YEAR").subscribe(
          changed => {
            assert.equal(changed, expected, "year precicion");
          },
          error => {
            console.error(`Error year precision: ${error}`);
            return done(error);
          },
          () => {
            return done();
          }
        );
      });


  });

});
