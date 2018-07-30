import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GatewayService } from '../../../api/gateway.service';
import {
  EventSourcingMonitorHelloWorldSubscription,
  getTimeFrameInRangeSince
} from './gql/EventSourcingMonitor';

@Injectable()
export class EventSourcingMonitorService {
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
    return this.gateway.apollo.query<any>({
      query: getTimeFrameInRangeSince,
      fetchPolicy: 'network-only',
      variables: {
        initTimestamp: initTimestamp,
        quantity: quantity,
        timeFrameType: timeFrameType
      },
      errorPolicy: 'all'
    })
    .map(result => result.data.getTimeFramesSinceTimestampFromEventSourcingMonitor);
  }

  /**
   * Hello World subscription sample, please remove
   */
  getEventSourcingMonitorHelloWorldSubscription$(): Observable<any> {
    return this.gateway.apollo
      .subscribe({
        query: EventSourcingMonitorHelloWorldSubscription
      })
      .map(resp => resp.data.EventSourcingMonitorHelloWorldSubscription.sn);
  }
}
