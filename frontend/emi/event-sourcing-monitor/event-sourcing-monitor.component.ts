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



  options_test = [{
    letter: 'A',
    names: ['Alabama', 'Alaska', 'Arizona', 'Arkansas']
  },
  {
    letter: 'B',
    names: ['Bogotá']
  },
  {
    letter: 'C',
    names: ['California', 'Colorado', 'Connecticut']
  }];


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
    this.initialQueries();

  }


  ngOnDestroy() {
  }

  toggleFilterList(overView: string) {
    this[overView] = !this[overView];
  }



  initialQueries(){
    this.eventSourcingMonitorervice.getTimeFrameInRangeSince$('MINUTE', Date.now(), this.getDefaultLimitByTimeRangeType('MINUTE'))
      .subscribe(
        result => {

          const responseJSON: any[] =  JSON.parse(JSON.stringify(result));
          // order summaries
          const AllSumaries = responseJSON.sort((a, b) =>  a.id - b.id);

          // update generalEventsOverViewChart
          this.generalEventsOverViewChart.datasets = [{
            label: 'General overview',
            data: [],
            fill: 'start'
          }];
          this.generalEventsOverViewChart.labels.length = 0;
          AllSumaries.forEach((summary, index) => {
            this.generalEventsOverViewChart.datasets[0].data.push(summary.globalHits);
            this.generalEventsOverViewChart.labels.push(
              new Date(summary.id)
              // TODO set i18n in the next method
                .toLocaleString('es-CO', this.getLabelFormatter('MINUTE'))
            );
          });
          this.generalEventsOverViewChart.ready = true;


          // updateOverViewByAggregateType
          const allDataSets = [];

          AllSumaries.forEach(({ eventTypeHits }) => {
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
                .toLocaleString('es-CO', this.getLabelFormatter('MINUTE'))
            );
          });






        },
        (e) => console.log(e),
        () => {}
      );
  }

  /**
   * Return the object to format the labels for timeRangeType given
   * @param timeRangeType MINUTE, HOUR, DAY, MONTH, YEAR
   */
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

  /**
   * Returns de default range time for the timeRangeType
   * @param timeRangeType MINUTE, HOUR, DAY, MONTH, YEAR
   */
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

  /**
   * return the rangeTime options that are posible represent with the scaleTime given
   * @param scaleTime MINUTE, HOUR, DAY, MONTH, YEAR
   */
  getDefaultsTimeRangesForscaleTime(scaleTime: string){
    switch (scaleTime){
      case 'MINUTE': return { HALF_HOUR: 30, ONE_HOUR: 60, TEN_MINUTES: 10 };
      case 'HOUR':   return { SIX_HOURS: 6, TWELVE_HOURS: 12, TWENTYFOUR: 24, FORTYEIGHT: 48  };
      case 'DAY':    return { ONE_WEEK: 7, ONE_MONTH: 30, FIFTEEN_DAYS: 15 };
      case 'MONTH':  return { SIX_MONTH: 6, ONE_YEAR: 12 };
      case 'YEAR':   return { FIVE_YEAR : 5 };
      default: return 0;
    }
  }

  updateGeneralEventsOverViewChart(timeRange: string, range: number){
    this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(timeRange, Date.now(), range)
      .subscribe(
        result => {
          const responseJSON =  JSON.parse(JSON.stringify(result));

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
        () => {}
      );
  }

  updateOverViewByEventType(timeRange: string, range: number){
    this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(timeRange, Date.now(), range)
      .subscribe(
        result => {
          const allDataSets = [];
          let responseJSON: any[] =  JSON.parse(JSON.stringify(result));
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
        () => {}
      );
  }

  updateOverViewByAggregateType(timeRange: string, range: number){
    this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(timeRange, Date.now(), range)
      .subscribe(
        result => {
          const allDataSets = [];
          let responseJSON: any[] =  JSON.parse(JSON.stringify(result));
          responseJSON = responseJSON.sort((a, b) =>  a.id - b.id);

          responseJSON.forEach(({ aggregateTypeHits }) => {
            aggregateTypeHits.forEach(({ key, value }) => {
              if (allDataSets.filter(o => o.label === key).length === 0) {
                allDataSets.push(
                  {
                    label: key,
                    data: Array.apply(null, Array(responseJSON.length)).map(Number.prototype.valueOf, 0),
                    fill: 'start'
                  });
                  console.log('$$$$$$$$$$$$', key);
              }
            });
          });

          this.overViewByAggregateType.labels.length = 0;

          responseJSON.forEach(({id, aggregateTypeHits}, index) => {
            aggregateTypeHits.forEach(({key, value}) => {
              const indexToReplace = allDataSets.findIndex(i => i.label === key);
              allDataSets[indexToReplace].data[index] = value;
            });

            this.overViewByAggregateType.datasets = allDataSets;

            this.overViewByAggregateType.labels.push(
              new Date(id)
              // TODO set i18n in the next method
                .toLocaleString('es-CO', this.getLabelFormatter(timeRange))
            );
          });







        },
        (e) => console.log(e),
        () => {}
      );
  }

  initCharts(){
    this.setFunctionOnCharts('generalEventsOverViewChart');
    this.setFunctionOnCharts('overViewByEventType');
    this.setFunctionOnCharts('overViewByAggregateType');
  }
  /**
   * initilizer function to create the chart and its inner functions
   * @param chartName Chart name in the component
   */
  setFunctionOnCharts(chartName: string): void {
    // function name to call when an update is required
    const functionToCall = `update${chartName[0].toUpperCase()}${chartName.slice(1, chartName.length)}`;
    this[chartName].quantities = this.getDefaultsTimeRangesForscaleTime(TimeRanges[TimeRanges.MINUTE]);
    this[chartName].currentQuantity = this.getDefaultLimitByTimeRangeType(TimeRanges[TimeRanges.MINUTE]);

    this[chartName].onScaleChanged = (scaleTime: number) => {
      this[chartName].labels = [];
      this[functionToCall](
        TimeRanges[scaleTime],
        this.getDefaultLimitByTimeRangeType(TimeRanges[scaleTime])
      );
      this[chartName].quantities = this.getDefaultsTimeRangesForscaleTime(TimeRanges[scaleTime]);
      this[chartName].currentQuantity = this.getDefaultLimitByTimeRangeType(TimeRanges[scaleTime]);
    };

    this[chartName].onRangeChanged = (timeRange: number) => {
      this[chartName].labels = [];
      this[functionToCall](
        TimeRanges[this[chartName].currentTimeRange],
        timeRange
      );
    };

    this[chartName].toggleFilterForm = () => {
      this[chartName].showFilterForm = !this[chartName].showFilterForm;
    };
  }



  printEvent(obj: any){
    console.log('========> ', obj);
  }

}
