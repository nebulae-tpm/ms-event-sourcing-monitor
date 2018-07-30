"use strict";

const Rx = require("rxjs");
const MinuteAccumulatorDA = require("../data/MinuteAccumulatorDA");
const HourAccumulatorDA = require("../data/HourAccumulatorDA");
const DayAccumulatorDA = require("../data/DayAccumulatorDA");
const MonthAccumulatorDA = require("../data/MonthAccumulatorDA");
const YearAccumulatorDA = require("../data/YearAccumulatorDA");
const { CustomError, DefaultError } = require("../tools/customError");
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
 * this method acumulate by one in the time frames
 * @param {Event} evt 
 */
  handleEventToCumulate$(evt){
    console.log(evt);
    return Rx.Observable.forkJoin(
      MinuteAccumulatorDA.cumulateEvent$(evt),
      HourAccumulatorDA.cumulateEvent$(evt),
      DayAccumulatorDA.cumulateEvent$(evt),
      MonthAccumulatorDA.cumulateEvent$(evt),
      YearAccumulatorDA.cumulateEvent$(evt)
    )
  }

  /**
   * return Array where each element has the quantized data of the relevant attributes of the events 
   * @param {Object} rqst 
   */
  getTimeFramesSince$({args}) {
    const timeFrameType = args.timeFrameType;
    const startFlag = args.initTimestamp;
    const quantity = args.quantity;
    switch (timeFrameType) {
      case "MINUTE":
        return MinuteAccumulatorDA.getAccumulateDataInTimeRange$(startFlag, quantity)          
          .mergeMap(result => this.objectKeyToArrayFormat$(result))
          .mergeMap(respond => this.buildSuccessResponse$(respond))
          .catch(err => this.errorHandler$(err));
      case "HOUR":
        return HourAccumulatorDA.getAccumulateDataInTimeRange$(startFlag, quantity)
          .mergeMap(result => this.objectKeyToArrayFormat$(result))
          .mergeMap(respond => this.buildSuccessResponse$(respond))
          .catch(err => this.errorHandler$(err));
      case "DAY": 
        return DayAccumulatorDA.getAccumulateDataInTimeRange$(startFlag, quantity)
        .mergeMap(result => this.objectKeyToArrayFormat$(result))
        .mergeMap(respond => this.buildSuccessResponse$(respond))
        .catch(err => this.errorHandler$(err));
      case "MONTH": 
        return MonthAccumulatorDA.getAccumulateDataInTimeRange$(startFlag, quantity)
        .mergeMap(result => this.objectKeyToArrayFormat$(result))
        .mergeMap(respond => this.buildSuccessResponse$(respond))
        .catch(err => this.errorHandler$(err));
      case "YEAR": 
        return YearAccumulatorDA.getAccumulateDataInTimeRange$(startFlag, quantity)
        .mergeMap(result => this.objectKeyToArrayFormat$(result))
        .mergeMap(respond => this.buildSuccessResponse$(respond))
        .catch(err => this.errorHandler$(err));
      default: return Rx.Observable.of([{
        id: 13412352345234,
        globalHits: 324968,
        eventTypeHits: [
          { AAA: 123},
          { BBB: 258} 
        ],
        userHits: [
          { CCC: 123},
          { DDD: 258}
        ],
        eventTypes: [
          {
            EEE: [
              { FFF: 569},
              { GGG : 9654 }
            ]
          }
        ]
      }]).mergeMap(respond => this.buildSuccessResponse$(respond))
        .catch(err => this.errorHandler$(err));
    }
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

  objectKeyToArrayFormat$(object) {
    return Rx.Observable.of(object)
      // .do(r => console.log("$$$$$$$$$$$$$$$$$$$", r, "$$$$$$$$$$$$$$$$$$$$$"))
      .mergeMap(timeFrameArray => Rx.Observable.from(timeFrameArray)
      .filter(obj => obj != null)
        .map(timeFrameObj => {
          // console.log(timeFrameObj);
          const eventTypeHits = [];
          const aggregateTypeHits = [];
          const userHits = [];
          const eventTypes = [];
          Object.entries(timeFrameObj.eventTypeHits).forEach(e => {
            eventTypeHits.push({key: e[0], value: e[1]})
          });
          Object.entries(timeFrameObj.aggregateTypeHits).forEach(e => {
            aggregateTypeHits.push({key: e[0], value: e[1]})
          });
          Object.entries(timeFrameObj.userHits).forEach(e => {
            userHits.push({key: e[0], value: e[1]})
          });
          // Object.entries(timeFrameObj.eventTypes).forEach(innerEvent => {
          //   console.log("## INNER_EVENT_TYPE ###", innerEvent[0], "###############");
          //   const key = innerEvent[0];
          //   const innerKeyValues = [];
          //   Object.entries(innerEvent[1]).forEach(innerHit => {
          //     const innerHitKey = innerHit[0];
          //     const InnerHitValue = [];
          //     Object.entries(innerHit[1]).forEach(InnerKeyValueInInnerHitValue => {
          //       InnerHitValue.push({
          //         key: InnerKeyValueInInnerHitValue[0],
          //         value: InnerKeyValueInInnerHitValue[1]})
          //     })
          //     innerKeyValues.push({key: innerHitKey, value: InnerHitValue});
          //   })

          //   eventTypes.push({key: key, value: innerKeyValues });
          // });
          // console.log(JSON.stringify(eventTypes));

          return {
            id: timeFrameObj.id,
            globalHits: timeFrameObj.globalHits,
            eventTypeHits,
            aggregateTypeHits,
            userHits,
            eventTypes
          }
        }).toArray()
      )
  }

  /**
   * Error catcher
   * @param {Error} err 
   */
  errorHandler$(err) {
    console.log("errorHandler$ => ", err);
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

  /**
   * mapper to encapsulate the response
   * @param {Object} rawRespponse 
   */
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
