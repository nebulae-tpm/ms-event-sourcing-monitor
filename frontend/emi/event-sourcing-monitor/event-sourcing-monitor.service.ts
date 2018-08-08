import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GatewayService } from '../../../api/gateway.service';
import {
  EventSourcingMonitorHelloWorldSubscription,
  getTimeFrameInRangeSince
} from './gql/EventSourcingMonitor';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
import { mergeMap, map } from 'rxjs/operators';
// tslint:disable-next-line:import-blacklist
import { forkJoin } from 'rxjs';

@Injectable()
export class EventSourcingMonitorService {
  lastDataQueried: any[] = [];
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
                  eventTypeVersionsByUser: summary.eventTypes.filter(evt => evt.key === eventName)
                };
              })
            ).toArray(),
            Rx.Observable.of(newData)
            .map((data: any[]) => {
              const options = [];
              data.forEach((summary: any ) => {
                summary.eventTypeHits.forEach(e => {
                  if (options.findIndex((element: any) => element === e.key ) === -1) {
                    options.push(e.key);
                  }
                });
              });
              return options.sort();
            })
          )
        })
      );
  }


}
