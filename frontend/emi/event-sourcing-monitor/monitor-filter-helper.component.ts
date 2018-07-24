import { EventSourcingMonitorService } from './event-sourcing-monitor.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { fuseAnimations } from '../../../core/animations';
import { Subscription } from 'rxjs/Subscription';
import * as Rx from 'rxjs/Rx';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'event-sourcing-monitor',
  templateUrl: './event-sourcing-monitor.component.html',
  styleUrls: ['./event-sourcing-monitor.component.scss'],
  animations: fuseAnimations
})
export class EventSourcingMonitorComponent implements OnInit, OnDestroy {

  helloWorld: String = 'Hello World static';
  allSubscriptions: Subscription[] = [];
  helloWorldLabelQuery$: Rx.Observable<any>;
  helloWorldLabelSubscription$: Rx.Observable<any>;


  constructor(private eventSourcingMonitorervice: EventSourcingMonitorService  ) {

  }


  ngOnInit() {

    this.helloWorldLabelQuery$ = this.eventSourcingMonitorervice.getHelloWorld$();
    this.helloWorldLabelSubscription$ = this.eventSourcingMonitorervice.getEventSourcingMonitorHelloWorldSubscription$();

  }


  ngOnDestroy() {
  }

}
