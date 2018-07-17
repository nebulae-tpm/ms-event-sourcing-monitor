import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs';
import { GatewayService } from '../../../api/gateway.service';
import {
  getHelloWorld,
  EventSourcingMonitorHelloWorldSubscription
} from './gql/EventSourcingMonitor';

@Injectable()
export class EventSourcingMonitorService {


  constructor(private gateway: GatewayService) {

  }

  /**
   * Hello World sample, please remove
   */
  getHelloWorld$() {
    return this.gateway.apollo.watchQuery<any>({
      query: getHelloWorld,
      fetchPolicy: 'network-only',
    }).valueChanges;
  }

  /**
  * Hello World subscription sample, please remove
  */
  getEventSourcingMonitorHelloWorldSubscription$(): Observable<any> {
    return Rx.Observable.merge(
      this.gateway.apollo
        .subscribe({
          query: EventSourcingMonitorHelloWorldSubscription
        })
        .map(resp => resp.data.sn)
    );
  }

}
