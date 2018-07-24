"use strict";
// const mongoDB = require("./MongoDB").singleton(); // to prod
let mongoDB = undefined; // to test
const AccumulatorDAHelper = require("./AccumulatorDAHelper");
const Rx = require("rxjs");
const CollectionName = "dayBoxes"; //please change
const { CustomError } = require("../tools/customError");
const TIMERANGE_KEY = "DAY";
const MAXIMUM_DOCUMENT_NUMBER = 60;

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

  static getHelloWorld$(evt) {    
    return Rx.Observable.of( {sn:`Hello World ${Date.now()}`} );
  }

  /**
   * Comulate event data
   * @param {Event} event
   * @returns Observable that resolves to given event itself
   */
  static cumulateEvent$(event) {
    const collection = mongoDB.db.collection(CollectionName);
    const updateOps = {
      upsert: true
    };
    const update = { $inc: {} };
    update["$inc"][`globalHits`] = 1;
    update["$inc"][`eventsHits.${event.et}`] = 1;
    update["$inc"][`userHits.${event.user}`] = 1;
    update["$inc"][`eventTypes.${event.et}.userHits.${event.user}`] = 1;
    update["$inc"][`eventTypes.${event.et}.versionHits.${event.etv}`] = 1;
    update["$inc"][`aggregateTypeHits.${event.at}`] = 1;

    return AccumulatorDAHelper.changeTimeStampPrecision$(
      event.timestamp,
      TIMERANGE_KEY
    )
      .mergeMap(
        id =>
          Rx.Observable.defer(() =>
            collection.updateOne({ id: id }, update, updateOps)
          )
        //TODO: comprobar que el result o modif count haya cambiado
      )
      // .do(r => console.log(r.result))
      .mapTo(event);
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
                new Date(initialTime).getDate() + i,
                new Date(initialTime).getHours(),
                1, 0).setMilliseconds(0),
            TIMERANGE_KEY
          )
          .do(r => console.log(new Date(r).toLocaleString()))
          .mergeMap(idToSearch => collection.findOne({ id: idToSearch })))
        )
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
   * delete all obsoletes documents 
   */
  static clearTrashDocuments() {
    const collection = mongoDB.db.collection(CollectionName);
    return AccumulatorDAHelper.calculateObsoleteThreshold(TIMERANGE_KEY, MAXIMUM_DOCUMENT_NUMBER)
    .mergeMap(obsoleteThreshold => Rx.Observable.defer(() =>
      collection.remove({ id: { $lt: obsoleteThreshold } })
    ))
  }

}

module.exports = MinuteAccumulatorDA;
