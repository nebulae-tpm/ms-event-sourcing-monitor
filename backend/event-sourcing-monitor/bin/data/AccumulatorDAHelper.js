"use strict";

const Rx = require("rxjs");
const CollectionName = "CollectionName"; // please change
const { CustomError } = require("../tools/customError");
const GMT_OFFSET = ((parseInt(process.env.GMT_TO_SERVE.replace('GMT', '')) * 60) - new Date().getTimezoneOffset()) * 60000;

class AccumulatorDAHelper {
  /**
   * Converts a timestamp to a desired precision
   * @param {number} timestamp utc millis
   * @param {string} precision MINUTE, HOUR, DAY, MONTH or YAER
   * @returns <Rx.Observable>
   */
  static changeTimeStampPrecision$(timestamp, precision) {
    return Rx.Observable.of(timestamp).map(ts => {      
      const date = new Date(ts + GMT_OFFSET);
      switch (precision) {
        case "MINUTE":
          return date.setSeconds(0, 0) - GMT_OFFSET;
        case "HOUR":
          return date.setMinutes(0, 0, 0) - GMT_OFFSET;
        case "DAY":
          return date.setHours(0, 0, 0, 0) - GMT_OFFSET;
        case "MONTH":
          return new Date(date.getFullYear(), date.getMonth()).setMilliseconds(
            0
          ) - GMT_OFFSET;
        case "YEAR":
          return new Date(date.getFullYear(), 0).setMilliseconds(0) - GMT_OFFSET;
        default:
          throw new Error("precision time given is not supported");
      }
    });
  }

  /**
   *
   * @param {int} currentTime in millis
   * @param {string} precision  MINUTE, HOUR, DAY, MONTH or YEAR
   * @param {int} limit
   */
  static calculateObsoleteThreshold$(currentTime, precision, limit) {
    const now = new Date(currentTime);
    switch (precision) {
      case "MINUTE":
        return AccumulatorDAHelper.changeTimeStampPrecision$(
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes() - limit
          ),
          precision
        );
      case "HOUR":
        return AccumulatorDAHelper.changeTimeStampPrecision$(
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours() - limit,
            0, 0),
          precision
        );
      case "DAY":
        return AccumulatorDAHelper.changeTimeStampPrecision$(
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - limit,
            0, 0, 0 
          ).setMilliseconds(0),
          precision
        );
      case "MONTH":
        return AccumulatorDAHelper.changeTimeStampPrecision$(
          new Date(
            now.getFullYear(),
            now.getMonth() - limit,
            1, 0, 0, 0
          ).setMilliseconds(0),
          precision
        );
      case "YEAR":
        return AccumulatorDAHelper.changeTimeStampPrecision$(
          new Date(
            now.getFullYear() - limit,
            1, 1, 1, 0, 0 
          ).setMilliseconds(0),
          precision
        );
      default:
        throw new Error("precision time given is not supported");
    }
  }
}
module.exports = AccumulatorDAHelper;