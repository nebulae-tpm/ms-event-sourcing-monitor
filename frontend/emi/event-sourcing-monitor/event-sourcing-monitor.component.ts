import { FuseTranslationLoaderService } from './../../../core/services/translation-loader.service';
import { EventSourcingMonitorService } from './event-sourcing-monitor.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { fuseAnimations } from '../../../core/animations';
import { Subscription } from 'rxjs/Subscription';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
// tslint:disable-next-line:import-blacklist
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
  topEvents = [];


  successfulAndFailedTransactionWidget: any = {};
  showFilterForGeneralOverview = true;



  constructor(
    private eventSourcingMonitorervice: EventSourcingMonitorService,
    private translationLoader: FuseTranslationLoaderService) {

      this.translationLoader.loadTranslations(english, spanish);

      this.successfulAndFailedTransactionWidget = {
        name: 'successfulAndFailedTransactionWidget',
        timeRanges: {
          ONE_HOUR: 1,
          TWO_HOURS: 2,
          THREE_HOURS: 3
        },
        currentTimeRange: 1,
        datasets: [
          {
            label: 'Event_A',
            data: [1234, 5687, 3456],
            fill: 'start'
          },
          {
            label: 'Event_B',
            data: [3456, 9876, 1239],
            fill: 'start'
          }
        ],
        labels: ['12:00', '12:10', '12:20', '12:30', '12:40', '12:50', '13:00'],
        colors: [
          {
            borderColor: '#3949ab',
            backgroundColor: 'rgba(57,73, 171,0.3)',
            pointBackgroundColor: '#3949ab',
            pointHoverBackgroundColor: '#3949ab',
            pointBorderColor: '#ffffff',
            pointHoverBorderColor: '#ffffff'
          },
          {
            borderColor: 'rgba(30, 136, 229, 0.87)',
            backgroundColor: 'rgba(30, 136, 229, 0.3)',
            pointBackgroundColor: 'rgba(30, 136, 229, 0.87)',
            pointHoverBackgroundColor: 'rgba(30, 136, 229, 0.87)',
            pointBorderColor: '#ffffff',
            pointHoverBorderColor: '#ffffff'
          }
        ],
        options: {
          spanGaps: false,
          legend: { display: false },
          maintainAspectRatio: false,
          tooltips: { position: 'nearest', mode: 'index', intersect: false },
          layout: { padding: { left: 24, right: 32 } },
          elements: {
            point: {
              radius: 4,
              borderWidth: 2,
              hoverRadius: 4,
              hoverBorderWidth: 2
            }
          },
          scales: {
            xAxes: [
              {
                gridLines: { display: false },
                ticks: { fontColor: 'rgba(0,0,0,0.54)' }
              }
            ],
            yAxes: [
              {
                gridLines: { tickMarkLength: 16 },
                ticks: {
                  // stepSize: 200,
                  beginAtZero: true
                }
              }
            ]
          },
          plugins: { filler: { propagate: false } }
        },
        chartType: 'line',
        usagesCount: 0,
        errorsCount: 0,
        onRangeChanged: (timeRange: number) => {
          console.log('option changed!');
        }
      };

    this.topEvents = [
      { eventType: 'Event_A', total: 345, balance: '+34%' },
      { eventType: 'Event_B', total: 2569, balance: '-2.58%' },
      { eventType: 'Event_C', total: 2569, balance: '-2.58%' },
      { eventType: 'Event_D', total: 2569, balance: '-2.58%' },
      { eventType: 'Event_E', total: 2569, balance: '-2.58%' },
      { eventType: 'Event_F', total: 2569, balance: '-2.58%' },
      { eventType: 'Event_D', total: 2569, balance: '-2.58%' }
    ];
  }


  ngOnInit() {

    this.helloWorldLabelQuery$ = this.eventSourcingMonitorervice.getHelloWorld$();
    this.helloWorldLabelSubscription$ = this.eventSourcingMonitorervice.getEventSourcingMonitorHelloWorldSubscription$();

  }


  ngOnDestroy() {
  }

  toggleFilterList(overView: string) {
    this[overView] = !this[overView];
  }

  printEvent(event: any){
    console.log('##');
    console.log(event);
  }

}
