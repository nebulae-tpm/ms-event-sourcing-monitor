import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { GatewayService } from '../../../api/gateway.service';
import {
  getHelloWorld,
  EventSourcingMonitorHelloWorldSubscription
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
