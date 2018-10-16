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
const lastEventMonitorUpdateSentToClientDBKey = "lastEventUpdateSentToClient";
const CommonVarsDA = require("../data/CommonVars");

/**
 * Singleton instance
 */
let instance;

class EventSourcingMonitor {
  constructor() {
    this.frontendEventMonitorUpdated$ = new Rx.Subject();
    this.prepareSubjects();
    this.incommingEvents$ = new Rx.Subject();

    this.startListenEvents$().subscribe(o => {}, e => console.log(e), () => { console.log("Finished")} )
  }

  startListenEvents$() {
    return this.incommingEvents$
      .bufferTime(3000)
      .filter(items => items.length > 0)
      // .do(items => {
      //   console.log(" Package size==> ", items.length);
      // })
      .map(events => events.reduce((acc, event) => {
          const eventType = event.et.replace(/\./g, "-");
          const eventUser = event.user.replace(/\./g, "-");
          const eventAggregateType = event.at.replace(/\./g, "-");
          acc["$inc"][`globalHits`]++;

          acc["$inc"][`eventTypeHits.${eventType}`] 
            ? acc["$inc"][`eventTypeHits.${eventType}`]++
            : acc["$inc"][`eventTypeHits.${eventType}`] = 1;

          acc["$inc"][`userHits.${eventUser}`]
            ? acc["$inc"][`userHits.${eventUser}`]++
            : acc["$inc"][`userHits.${eventUser}`] = 1;

          acc["$inc"][`eventTypes.${eventType}.userHits.${eventUser}`]
            ? acc["$inc"][`eventTypes.${eventType}.userHits.${eventUser}`]++
            : acc["$inc"][`eventTypes.${eventType}.userHits.${eventUser}`] = 1;

          acc["$inc"][`eventTypes.${eventType}.versionHits.${event.etv}`]
            ? acc["$inc"][`eventTypes.${eventType}.versionHits.${event.etv}`]
            : acc["$inc"][`eventTypes.${eventType}.versionHits.${event.etv}`] = 1;

          acc["$inc"][`aggregateTypeHits.${eventAggregateType}`]
            ? acc["$inc"][`aggregateTypeHits.${eventAggregateType}`]++
            : acc["$inc"][`aggregateTypeHits.${eventAggregateType}`] = 1;

          acc["timestamp"] = event.timestamp;
          return acc;
        }, { $inc: { globalHits: 0 }, timestamp: 0 }))     
      .mergeMap(update =>
        Rx.Observable.forkJoin(
          MinuteAccumulatorDA.cumulateEvent$(update),
          HourAccumulatorDA.cumulateEvent$(update),
          DayAccumulatorDA.cumulateEvent$(update),
          MonthAccumulatorDA.cumulateEvent$(update),
          YearAccumulatorDA.cumulateEvent$(update)
        )
      );
  }

  prepareSubjects() {
    this.frontendEventMonitorUpdated$
      .map((eventUpdateTimestamp) => { return { timestamp: eventUpdateTimestamp, timeRange: 1 } })
      .mergeMap((eventUpdate) => Rx.Observable.forkJoin(
        Rx.Observable.of(eventUpdate),
        CommonVarsDA.getVarValue$(lastEventMonitorUpdateSentToClientDBKey)
          .map(result => result ? result.value : null)
      ))
      .map(([eventUpdate, lastFrontendEventUpdateSent]) => ({ ...eventUpdate, lastFrontendEventUpdateSent }) )
      .filter((eventUpdate) => (eventUpdate.timestamp > (eventUpdate.lastFrontendEventUpdateSent + 5000)
        || eventUpdate.lastFrontendEventUpdateSent == null)
      )
      .mergeMap((r) => CommonVarsDA.updateVarValue$(lastEventMonitorUpdateSentToClientDBKey, Date.now()))
      .mergeMap(() =>
        broker.send$(
          MATERIALIZED_VIEW_TOPIC,
          "EventMonitorUpdateAvailable",
          Date.now()
        )
      )
      .subscribe(
        (ok) => { },
        error => console.log(error)),
      () => console.log("COMPLETED !!")
  }
  
  
  /**
   * this method calls at two Subjects to accumulate the events and other calculate frontend updates
   * @param {Event} evt 
   */
  handleEventToCumulate$(evt) {
    return Rx.Observable.of(evt)
    .map(evt => ({et: evt.et, user: evt.user, at: evt.at, timestamp: evt.timestamp}) )
    .do(event => {
      this.incommingEvents$.next(event);
      this.frontendEventMonitorUpdated$.next(evt.timestamp);
    });
  }

  /**
   * return Array where each element has the quantized data of the relevant attributes of the events 
   * @param {Object} rqst 
   */
  getTimeFramesSince$({ args }) {
    const timeFrameType = args.timeFrameType;
    const startFlag = args.initTimestamp;
    const quantity = args.quantity;
    return this.getAccumulatorDA$(timeFrameType)
      .mergeMap(acumulator => acumulator.getAccumulateDataInTimeRange$(startFlag, quantity))
      .mergeMap(result => this.objectKeyToArrayFormat$(result))
      .mergeMap(respond => this.buildSuccessResponse$(respond))
      .catch(err => this.errorHandler$(err));
  }

  getAccumulatorDA$(timeFrameType){
    switch (timeFrameType) {
      case "MINUTE": return Rx.Observable.of(MinuteAccumulatorDA);
      case "HOUR": return Rx.Observable.of(HourAccumulatorDA);
      case "DAY": return Rx.Observable.of(DayAccumulatorDA);
      case "MONTH": return Rx.Observable.of(MonthAccumulatorDA);
      case "YEAR": return Rx.Observable.of(YearAccumulatorDA);
      default: return Rx.Observable.throw(new Error("Unexpeted  frame type"));
    }
  }

  /**
   * Event handler to clean up the databases
   * @param {any} evt 
   */
  handleCleanHistory$(evt) {
    return Rx.Observable.of(evt.data)
      .map(data => ({
        now: Date.now(),
        minuteLimit: (data && data.minuteObsoleteThreshold) ? data.minuteObsoleteThreshold : 190,
        hourLimit: (data && data.hourObsoleteThreshold) ? data.hourObsoleteThreshold : 75,
        dayLimit: (data && data.dayObsoleteThreshold) ? data.dayObsoleteThreshold : 62,
        monthLimit: (data && data.monthObsoleteThreshold) ? data.monthObsoleteThreshold : 14,
        yearLimit: (data && data.yearObsoleteThreshold) ? data.yearObsoleteThreshold : 6
      }))
      .mergeMap(obsoleteThreshold => Rx.Observable.forkJoin(
        MinuteAccumulatorDA.deleteObsoleteDocuments$(obsoleteThreshold.minuteLimit),
        HourAccumulatorDA.deleteObsoleteDocuments$(obsoleteThreshold.hourLimit),
        DayAccumulatorDA.deleteObsoleteDocuments$(obsoleteThreshold.dayLimit),
        MonthAccumulatorDA.deleteObsoleteDocuments$(obsoleteThreshold.monthLimit),
        YearAccumulatorDA.deleteObsoleteDocuments$(obsoleteThreshold.yearLimit)
      ));
  }


  //#region  mappers for API responses
  objectKeyToArrayFormat$(object) {
    return Rx.Observable.of(object)
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

          Object.entries(timeFrameObj.eventTypes).forEach(innerEvent => {
            const key = innerEvent[0];
            const values = innerEvent[1];
            eventTypes.push({key: key, value: Object.entries(values).map(([key, value]) => {
              return {key, value: Object.entries(value).map(([key, value]) => {
                return {key, value}
              }) }
            })})
          });

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
/**
 * @returns {EventSourcingMonitor}
 */
module.exports = () => {
  if (!instance) {
    instance = new EventSourcingMonitor();
    console.log(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};
