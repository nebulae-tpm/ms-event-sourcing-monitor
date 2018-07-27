import { genericLineChart, TimeRanges } from './event-sourcing-monitor-chart-helper';
import { FuseTranslationLoaderService } from './../../../core/services/translation-loader.service';
import { EventSourcingMonitorService } from './event-sourcing-monitor.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { fuseAnimations } from '../../../core/animations';
import { Subscription } from 'rxjs/Subscription';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
// tslint:disable-next-line:import-blacklist
import { pipe } from 'rxjs/Rx';

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
  generalEventsOverViewChart: any = JSON.parse(JSON.stringify(genericLineChart));
  overViewByEventType: any = JSON.parse(JSON.stringify(genericLineChart));
  overViewByAggregateType: any = JSON.parse(JSON.stringify(genericLineChart));
  showFilterForGeneralOverview = true;



  constructor(
    private eventSourcingMonitorervice: EventSourcingMonitorService,
    private translationLoader: FuseTranslationLoaderService) {

    this.translationLoader.loadTranslations(english, spanish);
    this.initCharts();



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

    this.initialQueries();

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

  initialQueries(){
    this.updateGeneralOverViewTimeRange('MINUTE', this.getDefaultLimitByTimeRangeType('MINUTE'));
    this.updateOverViewByEventType('MINUTE', this.getDefaultLimitByTimeRangeType('MINUTE'));
  }

  getLabelFormatter(timeRangeType: string): Object{
    switch (timeRangeType){
      case 'MINUTE': return { hour: 'numeric', minute: 'numeric',  hour12: false };
      case 'HOUR':   return { hour: 'numeric', minute: 'numeric',  hour12: false };
      case 'DAY':    return { month: 'short', day: 'numeric',  hour12: false };
      case 'MONTH':  return { year: 'numeric', month: 'short',  hour12: false };
      case 'YEAR':   return { year: 'numeric',  hour12: false };
      default: {}
    }
  }
  getDefaultLimitByTimeRangeType(timeRangeType: string): number{
    switch (timeRangeType){
      case 'MINUTE': return 30;
      case 'HOUR':   return 12;
      case 'DAY':    return 7;
      case 'MONTH':  return 12;
      case 'YEAR':   return 5;
      default: return 0;
    }
  }

  getDefaultsTimeRangesForscaleTime(scaleTime: string){
    switch (scaleTime){
      case 'MINUTE': return { HALF_HOUR: 30, ONE_HOUR: 60 };
      case 'HOUR':   return { SIX_HOURS: 6, TWELVE_HOURS: 12, TWENTYFOUR: 24, FORTYEIGHT: 48  };
      case 'DAY':    return { ONE_WEEK: 7, ONE_MONTH: 30 };
      case 'MONTH':  return { SIX_MONTH: 6, ONE_YEAR: 12 };
      case 'YEAR':   return { FIVE_YEAR : 5 };
      default: return 0;
    }
  }

  updateGeneralOverViewTimeRange(timeRange: string, range: number){
    this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(timeRange, Date.now(), range)
      .subscribe(
        result => {
          const responseJSON =  JSON.parse(JSON.stringify(result.getTimeFramesSinceTimestampFromEventSourcingMonitor));

          this.generalEventsOverViewChart.datasets = [{
            label: 'General overview',
            data: [],
            fill: 'start'
          }];

          const AllSumaries: [any] = responseJSON.sort((a, b) =>  a.id - b.id);
          this.generalEventsOverViewChart.labels.length = 0;
          AllSumaries.forEach((summary, index) => {
            this.generalEventsOverViewChart.datasets[0].data.push(summary.globalHits);
            this.generalEventsOverViewChart.labels.push(
              new Date(summary.id)
              // TODO set i18n in the next method
                .toLocaleString('es-CO', this.getLabelFormatter(timeRange))
            );
          });
        },
        (e) => console.log(e),
        () => console.log('####################33')
      );
  }

  updateOverViewByEventType(timeRange: string, range: number){
    this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(timeRange, Date.now(), range)
      .subscribe(
        result => {
          const allDataSets = [];
          let responseJSON: any[] =  JSON.parse(JSON.stringify(result.getTimeFramesSinceTimestampFromEventSourcingMonitor));
          responseJSON = responseJSON.sort((a, b) =>  a.id - b.id);

          responseJSON.forEach(({ eventTypeHits }) => {
            eventTypeHits.forEach(({ key, value }) => {
              if (allDataSets.filter(o => o.label === key).length === 0) {
                allDataSets.push(
                  {
                    label: key,
                    data: Array.apply(null, Array(responseJSON.length)).map(Number.prototype.valueOf, 0),
                    fill: 'start'
                  });
              }
            });
          });

          this.overViewByEventType.labels.length = 0;

          responseJSON.forEach(({id, eventTypeHits}, index) => {
            eventTypeHits.forEach(({key, value}) => {
              const indexToReplace = allDataSets.findIndex(i => i.label === key);
              allDataSets[indexToReplace].data[index] = value;
            });

            this.overViewByEventType.datasets = allDataSets;

            this.overViewByEventType.labels.push(
              new Date(id)
              // TODO set i18n in the next method
                .toLocaleString('es-CO', this.getLabelFormatter(timeRange))
            );
          });
        },
        (e) => console.log(e),
        () => console.log('####################33')
      );
  }

  updateOverViewByAggregateType(timeRange: string, range: number){
    this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(timeRange, Date.now(), range)
      .subscribe(
        result => {
          const allDataSets = [];
          let responseJSON: any[] =  JSON.parse(JSON.stringify(result.getTimeFramesSinceTimestampFromEventSourcingMonitor));
          responseJSON = responseJSON.sort((a, b) =>  a.id - b.id);

          responseJSON.forEach(({ eventTypeHits }) => {
            eventTypeHits.forEach(({ key, value }) => {
              if (allDataSets.filter(o => o.label === key).length === 0) {
                allDataSets.push(
                  {
                    label: key,
                    data: Array.apply(null, Array(responseJSON.length)).map(Number.prototype.valueOf, 0),
                    fill: 'start'
                  });
              }
            });
          });

          this.overViewByEventType.labels.length = 0;

          responseJSON.forEach(({id, eventTypeHits}, index) => {
            eventTypeHits.forEach(({key, value}) => {
              const indexToReplace = allDataSets.findIndex(i => i.label === key);
              allDataSets[indexToReplace].data[index] = value;
            });

            this.overViewByEventType.datasets = allDataSets;

            this.overViewByEventType.labels.push(
              new Date(id)
              // TODO set i18n in the next method
                .toLocaleString('es-CO', this.getLabelFormatter(timeRange))
            );
          });
        },
        (e) => console.log(e),
        () => console.log('####################33')
      );
  }

  initCharts(){
    this.generalEventsOverViewChart.quantities = this.getDefaultsTimeRangesForscaleTime(TimeRanges[TimeRanges.MINUTE]);
    this.generalEventsOverViewChart.currentQuantity = this.getDefaultLimitByTimeRangeType(TimeRanges[TimeRanges.MINUTE]);

    this.generalEventsOverViewChart.onScaleChanged = (scaleTime: number) => {
      console.log('scaleTime ==>', scaleTime);
      this.generalEventsOverViewChart.labels = [];
      this.updateGeneralOverViewTimeRange(
        TimeRanges[scaleTime].toString(),
        this.getDefaultLimitByTimeRangeType(TimeRanges[scaleTime].toString())
      );
      this.generalEventsOverViewChart.quantities = this.getDefaultsTimeRangesForscaleTime(TimeRanges[scaleTime].toString());
      this.generalEventsOverViewChart.currentQuantity = this.getDefaultLimitByTimeRangeType(TimeRanges[scaleTime].toString());
    };

    this.generalEventsOverViewChart.onRangeChanged = (timeRange: number) => {
      console.log('timeRange ==>', timeRange);
      this.generalEventsOverViewChart.labels = [];
      this.updateGeneralOverViewTimeRange(
        TimeRanges[this.generalEventsOverViewChart.currentTimeRange].toString(),
        timeRange
      );
    };




    this.overViewByEventType.onRangeChanged = (timeRange: number) => {
      this.overViewByEventType.labels = [];
      this.updateOverViewByEventType(
        TimeRanges[timeRange].toString(),
        this.getDefaultLimitByTimeRangeType(TimeRanges[timeRange].toString())
      );
    };

    this.overViewByAggregateType.onRangeChanged = (timeRange: number) => {
      this.overViewByEventType.labels = [];
      this.updateOverViewByAggregateType(
        TimeRanges[timeRange].toString(),
        this.getDefaultLimitByTimeRangeType(TimeRanges[timeRange].toString())
      );
    };
  }



}
