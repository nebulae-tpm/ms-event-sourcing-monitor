import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GatewayService } from '../../../api/gateway.service';
import {
  getHelloWorld,
  EventSourcingMonitorHelloWorldSubscription,
  getTimeFrameInRangeSince
} from './gql/EventSourcingMonitor';

@Injectable()
export class EventSourcingMonitorService {
  constructor(private gateway: GatewayService) {}

  /**
   * Hello World sample, please remove
   */
  getHelloWorld$() {
    return this.gateway.apollo
      .watchQuery<any>({
        query: getHelloWorld,
        fetchPolicy: 'network-only'
      })
      .valueChanges.map(
        resp => resp.data.getHelloWorldFromEventSourcingMonitor.sn
      );
  }
  /**
   *
   * @param timeFrameType string MINUTE, HOUR, DAY, MONTH, YEAR
   * @param initTimestamp Initial timestamp to make the request
   * @param quantity number  of timeframes to fetch
   */
  getTimeFrameInRangeSince$(
    timeFrameType: string,
    initTimestamp: number,
    quantity: number
  ) {
    return this.gateway.apollo.watchQuery<any>({
      query: getTimeFrameInRangeSince,
      fetchPolicy: 'network-only',
      variables: {
        initTimestamp: initTimestamp,
        quantity: quantity,
        timeFrameType: timeFrameType
      }
    }).valueChanges.map(result => result.data);
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
