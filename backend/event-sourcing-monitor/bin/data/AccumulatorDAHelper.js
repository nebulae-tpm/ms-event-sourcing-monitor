'use strict'

const Rx = require('rxjs');
const CollectionName = "CollectionName";//please change
const { CustomError } = require('../tools/customError');


class AccumulatorDAHelper {

  /**
   * Converts a timestamp to a desired precision
   * @param {number} timestamp utc millis
   * @param {string} precision MINUTE, HOUR, DAY, MONTH or YAER
   */
  static changeTimeStampPrecision$(timestamp, precision) {
    return Rx.Observable.of(timestamp)
      .map(ts => {
        switch (precision) {
          case 'MINUTE':
            return new Date(ts).setSeconds(0, 0);
          case 'HOUR':
            return new Date(ts).setMinutes(0, 0, 0);
          case 'DAY':
            throw new Error();
          case 'MONTH':
            throw new Error();
          case 'YEAR':
            throw new Error();
          default:
            throw new Error();
        }
      });
  }


}

module.exports = AccumulatorDAHelper 