import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GatewayService } from '../../../api/gateway.service';
import {
  eventMonitorUpdateAvailable,
  getTimeFrameInRangeSince
} from './gql/EventSourcingMonitor';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
import { mergeMap, map } from 'rxjs/operators';
// tslint:disable-next-line:import-blacklist
import { forkJoin } from 'rxjs';
import { GenericBaseChart } from './chart-helpers/GenericBaseChart';

@Injectable()
export class EventSourcingMonitorService {
  lastDataQueried: any[] = [];
  listeningEvent$ = new Rx.Subject<boolean>();
  listeningEvents = false;
  chartFilter: { timeScale: number, timeRange: number, ranges: any } = {
    timeScale: 1,
    timeRange: 30,
    ranges: GenericBaseChart.getDefaultsTimeRangesForscaleTime('MINUTE')
  };
  onTimeScaleChanged$ = new Rx.Subject<number>();
  constructor(private gateway: GatewayService) {}



  /**
   * @param timeFrameType string MINUTE, HOUR, DAY, MONTH, YEAR
   * @param initTimestamp Initial timestamp to make the request
   * @param quantity number  of timeframes to fetch
   */
  getTimeFrameInRangeSince$(
    timeFrameType: string,
    initTimestamp: number,
    quantity: number
  ) {
    return this.gateway.apollo
      .query<any>({
        query: getTimeFrameInRangeSince,
        fetchPolicy: 'network-only',
        variables: {
          initTimestamp: initTimestamp,
          quantity: quantity,
          timeFrameType: timeFrameType
        },
        errorPolicy: 'all'
      })
      .map(
        result => {
          this.lastDataQueried  = result.data.getTimeFramesSinceTimestampFromEventSourcingMonitor;
          return this.lastDataQueried;
        }

      );
  }


  getTimeFrameswithFilter$(eventName: string, timeScale: string, timeRange: number) {
    return this.getTimeFrameInRangeSince$(timeScale, Date.now(), timeRange)
      .pipe(
        mergeMap((newData: any[]) => {
          return forkJoin(
            Rx.Observable.from(newData).pipe(
              map((summary: any) => {
                const eventHitsResult: any[] = summary.eventTypeHits.filter(eventTypeHit => eventTypeHit.key === eventName);
                if (eventHitsResult.length === 0) {
                  eventHitsResult.push({ key: eventName, value: 0 });
                }
                return {
                  id: summary.id,
                  eventHits: eventHitsResult,
                  eventTypeVersionsByUser: summary.eventTypes.filter(evt => evt.key === eventName),
                  eventTypes: summary.eventTypes.filter(evt => evt.key === eventName)
                };
              })
            ).toArray(),
            Rx.Observable.of(newData)
            .map((data: any[]) => {
              const options = [];
              data.forEach((summary: any ) => {
                summary.eventTypeHits.forEach(e => {
                const indexInSummaries = options.findIndex((element: any) => element.eventName === e.key );
                  if ( indexInSummaries === -1) {
                    options.push({eventName: e.key, count: e.value, show: true });
                  }else{
                    options[indexInSummaries].count = options[indexInSummaries].count + e.value;
                  }
                });
              });
              return options.sort();
            })
          );
        })
      );
  }


  listenAvailableUpdates$(){
    return this.gateway.apollo
    .subscribe({
      query: eventMonitorUpdateAvailable
    })
    .map((resp) => resp.data.EventMonitorUpdateAvailable );
  }


}
