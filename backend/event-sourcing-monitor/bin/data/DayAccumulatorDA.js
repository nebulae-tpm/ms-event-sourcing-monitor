"use strict";
const mongoDB = require("./MongoDB").singleton(); // to prod
// let mongoDB = undefined; // to test
const AccumulatorDAHelper = require("./AccumulatorDAHelper");
const Rx = require("rxjs");
const CollectionName = "dayBoxes"; //please change
const { CustomError } = require("../tools/customError");
const TIMERANGE_KEY = "DAY";

class MinuteAccumulatorDA {
  static start$(mongoDbInstance) {
    return Rx.Observable.create(observer => {
      if (mongoDbInstance) {
        mongoDB = mongoDbInstance;
        observer.next("using given mongo instance");
      } else {
        mongoDB = require("./MongoDB").singleton();
        observer.next("using singleton system-wide mongo instance");
      }
      observer.complete();
    });
  }

  /**
   * Comulate event data
   * @param {Event} event
   * @returns Observable that resolves to given event itself
   */
  static cumulateEvent$(update) {
    const collection = mongoDB.db.collection(CollectionName);
    const updateOps = {
      upsert: true
    };

    return AccumulatorDAHelper.changeTimeStampPrecision$(
      update.timestamp,
      TIMERANGE_KEY
    )
      .mergeMap(
        id =>
          Rx.Observable.defer(() =>
            collection.updateOne({ id: id }, { $inc: update.$inc }, updateOps)
          )
        //TODO: comprobar que el result o modif count haya cambiado
      )
      // .do(r => console.log(r.result))
      .mapTo({});
  }

  /**
   * retrieves the accomulated data
   *
   * @param documentId accomulate ID, The id is the epoch time stamp maped to the exact time frame, E.g: 2018-7-18 19:47:00 = 1531943220000
   * @returns Observable that resolves to the retrieved data
   */
  static getAccumulateData$(documentId) {
    const collection = mongoDB.db.collection(CollectionName);
    return AccumulatorDAHelper.changeTimeStampPrecision$(
      documentId,
      TIMERANGE_KEY
    ).mergeMap(documentId => 
      Rx.Observable.defer(() => collection.findOne({ id: documentId }))
    );
  }
  /**
   *
   * @param {timestamp reference} startflag
   * @param {number of documents to search since the startflag} quantity
   * @returns {Array with the data of each time range}
   */
  static getAccumulateDataInTimeRange$(startflag, quantity) {
    const collection = mongoDB.db.collection(CollectionName);
    return AccumulatorDAHelper.changeTimeStampPrecision$(
      startflag,
      TIMERANGE_KEY
    ).mergeMap(initialTime =>
      Rx.Observable.range(0, quantity + 1)
        .mergeMap(i => 
          Rx.Observable.defer(() =>
          AccumulatorDAHelper.changeTimeStampPrecision$(
            new Date(
                new Date(initialTime).getFullYear(),
                new Date(initialTime).getMonth(),
                new Date(initialTime).getDate() - i,
                new Date(initialTime).getHours(),
                1, 0).setMilliseconds(0),
            TIMERANGE_KEY
          )// .do(r => console.log(new Date(r).toLocaleString()))
          .mergeMap(idToSearch => Rx.Observable.forkJoin(
            collection.findOne({ id: idToSearch }),
            Rx.Observable.of(idToSearch)
          )
        )
      ).map(([result, id]) => {
        if (result == null) {
          return {
            id: id,
            aggregateTypeHits: [],
            eventTypeHits: [],
            eventTypes: [],
            globalHits: 0,
            userHits: []
          }
        }
        return result;
      }))
        .toArray()
    );
  }

  /**
   * 
   * @param {timestamp on the center of the time range wished} timeReference 
   * @param { number of timeframes before and after the timeReference} timeRadio 
   * @returns {Array with the data of each time range} 
   */
  static getAccumulateDataAroundTimestamp$(timeReference, timeRadio) {
    const collection = mongoDB.db.collection(CollectionName);
    return AccumulatorDAHelper.changeTimeStampPrecision$(
      timeReference,
      TIMERANGE_KEY
    )
      .map(referenceDate => new Date(
        new Date(referenceDate).getFullYear(),
        new Date(referenceDate).getMonth(),
        new Date(referenceDate).getDate() - timeRadio,
        new Date(referenceDate).getHours(),
        new Date(referenceDate).getMinutes() 
      ).setMilliseconds(0))
      .mergeMap(initialTime =>
        Rx.Observable.range(0, (timeRadio * 2) + 1).mergeMap(i =>
          Rx.Observable.defer(() =>
            AccumulatorDAHelper.changeTimeStampPrecision$(
              new Date(
                new Date(initialTime).getFullYear(),
                new Date(initialTime).getMonth(),
                new Date(initialTime).getDate() + i,
                new Date(initialTime).getHours(),
                new Date(initialTime).getMinutes(),
                0, 0)
                .setMilliseconds(0),
              TIMERANGE_KEY)
            .do(r => console.log(new Date(r).toLocaleString()))
            .mergeMap(idToSearch => collection.findOne({ id: idToSearch }))
          )
        )
      )
      .toArray();
  }


  /**
   * 
   * @param {number} threshold maximum number of documents that the day collection can store
   */
  static deleteObsoleteDocuments$(threshold) {
    const collection = mongoDB.db.collection(CollectionName);
    return AccumulatorDAHelper.calculateObsoleteThreshold$( Date.now(), TIMERANGE_KEY, threshold)
    .mergeMap(obsoleteThreshold => Rx.Observable.defer(() =>
      collection.remove({ id: { $lt: obsoleteThreshold } })
    ))
  }

}

/**
 * @returns {MinuteAccumulatorDA}
 */
module.exports = MinuteAccumulatorDA;
