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

      it("-5 minutes precision", (done) => {
        const expected = 1532026140000;
        AccumulatorDAHelper.calculateObsoleteThreshold$(currentMillis, "MINUTE", 5)
        .subscribe(
          changed => {
            assert.equal(changed, expected, "-5 minutes precisison");
          },
          error => {
            console.error(`Error minute precision: ${error}`);
            return done(error);
          },
          () => {
            return done();
          }
        );
      });

      it("-5 Hour precision", (done) => {
        const expected = 1532005200000;
        AccumulatorDAHelper.calculateObsoleteThreshold$(currentMillis, "HOUR", 5)
        .subscribe(
          changed => {
            assert.equal(changed, expected, "-5 hours precisison");
          },
          error => {
            console.error(`Error hour precision: ${error}`);
            return done(error);
          },
          () => {
            return done();
          }
        );
      });

      it("-5 Days precision", (done) => {
        const expected = 1531544400000;
        AccumulatorDAHelper.calculateObsoleteThreshold$(currentMillis, "DAY", 5)
        .subscribe(
          changed => {
            assert.equal(changed, expected, "-5 days precisison");
          },
          error => {
            console.error(`Error day precision: ${error}`);
            return done(error);
          },
          () => {
            return done();
          }
        );
      });

      it("-5 Months precision", (done) => {
        const expected = 1517461200000;
        AccumulatorDAHelper.calculateObsoleteThreshold$(currentMillis, "MONTH", 5)
        .subscribe(
          changed => {
            assert.equal(changed, expected, "-5 months precisison");
          },
          error => {
            console.error(`Error month precision: ${error}`);
            return done(error);
          },
          () => {
            return done();
          }
        );
      });

      it("-5 YEARS precision", (done) => {
        const expected = 1357016400000;
        AccumulatorDAHelper.calculateObsoleteThreshold$(currentMillis, "YEAR", 5)
        .subscribe(
          changed => {
            assert.equal(changed, expected, "-5 years precisison");
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
