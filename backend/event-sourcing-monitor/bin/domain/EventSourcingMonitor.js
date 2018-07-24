"use strict";

const Rx = require("rxjs");
const MinuteAccumulatorDA = require("../data/MinuteAccumulatorDA");
const HourAccumulatorDA = require("../data/HourAccumulatorDA");
const DayAccumulatorDA = require("../data/DayAccumulatorDA");
const MonthAccumulatorDA = require("../data/MonthAccumulatorDA");
const YearAccumulatorDA = require("../data/YearAccumulatorDA");
const broker = require("../tools/broker/BrokerFactory")();
const MATERIALIZED_VIEW_TOPIC = "materialized-view-updates";

/**
 * Singleton instance
 */
let instance;

class EventSourcingMonitor {
  constructor() {
    // this.initHelloWorldEventGenerator();
  }

  /**
   *  HelloWorld Query, please remove
   *  this is a queiry form GraphQL
   */
  getHelloWorld$(request) {
    return MinuteAccumulatorDA.getHelloWorld$()
      .mergeMap(rawResponse => this.buildSuccessResponse$(rawResponse))
      .catch(err => this.errorHandler$(err));
  }

  /**
   * Handle HelloWorld Query, please remove
   * This in an Event HAndler for Event-Sourcing events
   */
  handleHelloWorld$(evt) {
    return Rx.Observable.of('Some process for HelloWorld event');
  }
/**
 * 
 * @param {Event} evt 
 */
  handleEvent$(evt){
    return Rx.Observable.forkJoin(
      MinuteAccumulatorDA.cumulateEvent$(evt),
      HourAccumulatorDA.cumulateEvent$(evt),
      DayAccumulatorDA.cumulateEvent$(evt),
      MonthAccumulatorDA.cumulateEvent$(evt),
      YearAccumulatorDA.cumulateEvent$(evt)
    )
  }


  // initHelloWorldEventGenerator(){
  //   Rx.Observable.interval(1000)
  //   .take(120)
  //   .mergeMap(id =>  MinuteAccumulatorDA.getHelloWorld$())    
  //   .mergeMap(evt => {
  //     return broker.send$(MATERIALIZED_VIEW_TOPIC, 'EventSourcingMonitorHelloWorldEvent',evt);
  //   }).subscribe(
  //     (evt) => console.log('Gateway GraphQL sample event sent, please remove'),
  //     (err) => console.error('Gateway GraphQL sample event sent ERROR, please remove'),
  //     () => console.log('Gateway GraphQL sample event sending STOPPED, please remove'),
  //   );
  // }




  //#region  mappers for API responses
  errorHandler$(err) {
    return Rx.Observable.of(err)
      .map(err => {
        const exception = { data: null, result: {} };
        const isCustomError = err instanceof CustomError;
        if(!isCustomError){
          err = new DefaultError(err)
        }
        exception.result = {
            code: err.code,
            error: {...err.getContent()}
          }
        return exception;
      });
  }

  
  buildSuccessResponse$(rawRespponse) {
    return Rx.Observable.of(rawRespponse)
      .map(resp => {
        return {
          data: resp,
          result: {
            code: 200
          }
        }
      });
  }

  //#endregion


}

module.exports = () => {
  if (!instance) {
    instance = new EventSourcingMonitor();
    console.log(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};
