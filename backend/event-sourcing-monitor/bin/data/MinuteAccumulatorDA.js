'use strict'

let mongoDB = undefined;
const AccumulatorDAHelper = require('./AccumulatorDAHelper');
const Rx = require('rxjs');
const CollectionName = "CollectionName";//please change
const { CustomError } = require('../tools/customError');


class MinuteAccumulatorDA {

  static start$(mongoDbInstance) {
    return Rx.Observable.create((observer) => {
      if (mongoDbInstance) {
        mongoDB = mongoDbInstance;
        observer.next('using given mongo instance');
      } else {
        mongoDB = require('./MongoDB').singleton();
        observer.next('using singleton system-wide mongo instance');
      }
      observer.complete();
    });
  }

  /**
   * Comulate event data
   * @param {Event} event 
   * @returns Observable that resolves to given event itself
   */
  static cumulateEvent$(event) {
    const collection = mongoDB.db.collection(CollectionName);
    const updateOps = {
      upsert: true,
    };
    const update = { '$inc': {} };
    update['$inc'][`a.b.c.${event.et}`] = 1;



    return AccumulatorDAHelper.changeTimeStampPrecision$(event.timestamp, 'MINUTE')
      .mergeMap(id =>
        Rx.Observable.defer(() => {
          collection.updateOne({ _id: id }, update, updateOps)
        })
        //TODO: comprobar que el result o modif count haya cambiado 
      );
    ;
  }

  /**
   * retrieves the accomulated data
   * 
   * @param id accomulate ID, The id is the epoch time stamp maped to the exact time frame, E.g: 2018-7-18 19:47:00 = 1531943220000
   * @returns Observable that resolves to the retrieved data
   */
  static getAccumulateData$(id) {
    return Rx.Observable.empty();
  }
}

module.exports = MinuteAccumulatorDA;