import { genericLineChart, TimeRanges } from './event-sourcing-monitor-chart-helper';
import { FuseTranslationLoaderService } from './../../../core/services/translation-loader.service';
import { EventSourcingMonitorService } from './event-sourcing-monitor.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { fuseAnimations } from '../../../core/animations';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
// tslint:disable-next-line:import-blacklist
import { mergeMap, map, tap } from 'rxjs/operators';
// tslint:disable-next-line:import-blacklist
import { forkJoin, of } from 'rxjs';


export interface FilterOption{
  letter: string;
  names: String[];
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'event-sourcing-monitor',
  templateUrl: './event-sourcing-monitor.component.html',
  styleUrls: ['./event-sourcing-monitor.component.scss'],
  // encapsulation: ViewEncapsulation.Emulated,
  animations: fuseAnimations
})
export class EventSourcingMonitorComponent implements OnInit, OnDestroy {

  topEvents: {eventType: string, total: number, balance: number}[] = [];
  generalEventsOverViewChart: any = JSON.parse(JSON.stringify(genericLineChart));
  overViewByEventType: any = JSON.parse(JSON.stringify(genericLineChart));
  overViewByAggregateType: any = JSON.parse(JSON.stringify(genericLineChart));
  showFilterForGeneralOverview = true;

  balanceTable = {
    currentTimeRange: TimeRanges.MINUTE,
    timeScales: {
      MINUTE: 1,
      HOUR: 2,
      DAY: 3,
      MONTH: 4,
      YEAR: 5
    },
    onScaleChanged: (timeScale: number) => {
      const timeScaleAsString = Object.entries(this.balanceTable.timeScales).filter(o => o[1] === timeScale)[0][0];
      this.updateBalanceTable(timeScaleAsString);
    }
  };



  constructor(
    private eventSourcingMonitorervice: EventSourcingMonitorService,
    private translationLoader: FuseTranslationLoaderService) {
    this.translationLoader.loadTranslations(english, spanish);
    this.initCharts();
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
      .pipe(
        map(result => JSON.parse(JSON.stringify(result))),
        map(resultAsArray => resultAsArray.sort((a, b) =>  a.id - b.id)),
        mergeMap((arrayResult: any) =>
          forkJoin(
            this.updateGeneralEventsOverViewChart$(arrayResult, TimeRanges[1]),
            this.updateOverViewByEventType$(arrayResult, TimeRanges[1]),
            this.updateOverViewByAggregateType$(arrayResult, TimeRanges[1])
          )
        )
      ).toArray()
      .subscribe(
        (a) => console.log(a),
        (e) => console.log(e),
        () => { }
      );

    this.updateBalanceTable('MINUTE');
  }

  /**
   * Return the object to format the labels for timeRangeType given
   * @param timeRangeType MINUTE, HOUR, DAY, MONTH, YEAR
   */
  getLabelFormatter(timeRangeType: string): Object{
    // return { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric',  hour12: false };
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
/**
 * Update the general overview chart
 * @param allSummaries allSummaries that the query give us
 * @param timeScale  MINUTE, HOUR, DAY, MONTH, YEAR
 */
  updateGeneralEventsOverViewChart$(allSummaries: any[], timeScale: string) {
    this.generalEventsOverViewChart.datasets = [{
      label: 'General overview',
      data: [],
      fill: 'start'
    }];

    this.generalEventsOverViewChart.labels.length = 0;
    allSummaries.forEach((summary, index) => {
      this.generalEventsOverViewChart.datasets[0].data.push(summary.globalHits);
      this.generalEventsOverViewChart.labels.push(
        new Date(summary.id)
          // TODO set i18n in the next method
          .toLocaleString('es-CO', this.getLabelFormatter(timeScale))
      );
    });
    this.generalEventsOverViewChart.ready = true;
    // return Rx.Observable.from(allSummaries).pipe(
    //   map((summary: any) => new Date(summary.id).toLocaleTimeString())
    // );
    return Rx.Observable.of(allSummaries);
  }

  /**
   * Update the overview by eventType chart
   * @param allSummaries allSummaries that the query give us
   * @param timeScale MINUTE, HOUR, DAY, MONTH, YEAR
   */
  updateOverViewByEventType$(allSummaries: any, timeScale: string) {

    // update OverViewByEventType chart
    let allDataSets = []; // var used to all datasets for OverViewByEventType chart
    // const filtersApplied = this.overViewByEventType.filtersApplied.slice();
    allSummaries.forEach(({ eventTypeHits }) => {
      eventTypeHits.forEach(({ key, value }) => {
        if (allDataSets.filter(o => o.label === key).length === 0) {
          allDataSets.push(
            {
              label: key,
              data: Array.apply(null, Array(allSummaries.length)).map(Number.prototype.valueOf, 0),
              fill: false
            });
          // this.overViewByEventType.filtersApplied.push(key);
        }
      });
    });
    this.overViewByEventType.labels.length = 0;

    allSummaries.forEach(({ id, eventTypeHits }, index) => {

      eventTypeHits.forEach(({ key, value }) => {
        const indexToReplace = allDataSets.findIndex(i => i.label === key);
        allDataSets[indexToReplace].data[index] = value;
      });

      // TODO apply with i18n
      this.overViewByEventType.labels.push(new Date(id).toLocaleString('es-CO', this.getLabelFormatter(timeScale)));
    });

    const filterOptions: FilterOption[] = [];

    allDataSets.forEach((e: { label: string, data: number[], fill: string }) => {
      const filterIndex = filterOptions.findIndex(i => i.letter === e.label[0]);
      if (filterIndex === -1) {
        filterOptions.push(
          {
            letter: e.label[0].toUpperCase(),
            names: [e.label]
          });
      } else {
        filterOptions[filterIndex].names.push(e.label);
      }
    });
    this.overViewByEventType.optionsToFilter = filterOptions;

    if (allDataSets.length === 0) {
      console.log('EL DATASETS ESTABA VACIO', allDataSets);
      allDataSets = [{
        label: 'Event_A',
        data: Array.apply(null, Array(allSummaries.length)).map(Number.prototype.valueOf, 0),
        fill: 'start'
      }];
    }

    this.overViewByEventType.datasets = allDataSets;
    console.log('FILTERS ===> ', this.overViewByEventType.filter);
    this.overViewByEventType.ready = true;

    // return Rx.Observable.from(allSummaries).pipe(
    //   map((summary: any) => new Date(summary.id).toLocaleTimeString())
    // );
    return Rx.Observable.of(timeScale);
  }

  updateOverViewByAggregateType$(allSummaries: any, timeScale: string){
     // update OverViewByEventType chart
     let allDataSets = []; // var used to all datasets for OverViewByEventType chart
     allSummaries.forEach(({ aggregateTypeHits }) => {
       aggregateTypeHits.forEach(({ key, value }) => {
         if (allDataSets.filter(o => o.label === key).length === 0) {
           allDataSets.push(
             {
               label: key,
               data: Array.apply(null, Array(allSummaries.length)).map(Number.prototype.valueOf, 0),
               fill: false
             });
          //  this.overViewByAggregateType.filtersApplied.push(key);
         }
       });
     });
     this.overViewByAggregateType.labels.length = 0;
     allSummaries.forEach(({ id, aggregateTypeHits }, index) => {
      aggregateTypeHits.forEach(({ key, value }) => {
         const indexToReplace = allDataSets.findIndex(i => i.label === key);
         allDataSets[indexToReplace].data[index] = value;
       });



       this.overViewByAggregateType.labels.push(
         new Date(id)
           // TODO set i18n in the next method
           .toLocaleString('es-CO', this.getLabelFormatter(timeScale))
       );
     });
     const filterOptions: FilterOption[] = [];

     allDataSets.forEach((e: { label: string, data: number[], fill: string }) => {
       const filterIndex = filterOptions.findIndex(i => i.letter === e.label[0]);
       if (filterIndex === -1) {
         filterOptions.push(
           {
             letter: e.label[0].toUpperCase(),
             names: [e.label]
           });
       } else {
         filterOptions[filterIndex].names.push(e.label);
       }
     });
     this.overViewByAggregateType.optionsToFilter = filterOptions;

     if (allDataSets.length === 0) {
       console.log('EL DATASETS ESTABA VACIO', allDataSets);
       allDataSets = [{
         label: 'Event_A',
         data: Array.apply(null, Array(allSummaries.length)).map(Number.prototype.valueOf, 0),
         fill: 'start'
       }];
     }

     this.overViewByAggregateType.datasets = allDataSets;
     this.overViewByAggregateType.ready = true;

     // return Rx.Observable.from(allSummaries).pipe(
     //   map((summary: any) => new Date(summary.id).toLocaleTimeString())
     // );
     return Rx.Observable.of(timeScale);
  }

  updateBalanceTable(timeScale: string){
    this.topEvents = [];
    this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(timeScale, Date.now(), this.getDefaultLimitByTimeRangeType(timeScale))
    .pipe(
      map(result => JSON.parse(JSON.stringify(result))),
      map((resultAsArray: any[]) => resultAsArray.sort((a, b) =>  a.id - b.id).slice(resultAsArray.length - 3, resultAsArray.length - 1)),
      mergeMap((arrayResult: any) =>
        Rx.Observable.from(arrayResult)
        .pipe(
          map((r: any) => r.eventTypeHits)
        ).toArray()
      )
    )
    .subscribe(
      ( result: any[] ) =>  {
        // const allEvenTypes = [...Object.entries(result[0]), ...Object.entries(result[1]) ];
        // console.log('ALL EVENT TYPES ==> ', allEvenTypes);

        result[0].forEach(preKeyValue => {
          const latestKeyValue = result[1].filter(o => o.key === preKeyValue.key)[0];
          const latestValue = latestKeyValue ? latestKeyValue.value : 0;
          const rowBalance = +(((latestValue / preKeyValue.value) - 1) * 100).toFixed(0);

          if (this.topEvents.length <= 8){
          this.topEvents.push({
            eventType: preKeyValue.key,
            total: latestKeyValue ? latestKeyValue.value : 0,
            balance: rowBalance
          });
          }
        });
      },
      (e) => console.log(e),
      () => { }
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
    const functionToSubscribe = `update${chartName[0].toUpperCase()}${chartName.slice(1, chartName.length)}$`;
    this[chartName].quantities = this.getDefaultsTimeRangesForscaleTime(TimeRanges[TimeRanges.MINUTE]);
    this[chartName].currentQuantity = this.getDefaultLimitByTimeRangeType(TimeRanges[TimeRanges.MINUTE]);

    // when Change the Scale of time like MINUTES, HOURS ....
    this[chartName].onScaleChanged = (scaleTime: number) => {

      this[chartName].quantities = this.getDefaultsTimeRangesForscaleTime(TimeRanges[scaleTime]);
      this[chartName].currentQuantity = this.getDefaultLimitByTimeRangeType(TimeRanges[scaleTime]);
      this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(TimeRanges[scaleTime], Date.now(), this[chartName].currentQuantity)
      .pipe(
        map(result => JSON.parse(JSON.stringify(result))),
        map(resultAsArray => resultAsArray.sort((a, b) =>  a.id - b.id)),
        mergeMap((arrayResult: any[]) => this[functionToSubscribe](arrayResult, TimeRanges[scaleTime])
        )
      )
      .subscribe(
        (result) => { console.log('Result => ', result); },
        (error) => { console.log(error); },
        () => console.log('FINISHED')
      );
    };
    // When change the range of time
    this[chartName].onRangeChanged = (timeRange: number) => {
      console.log('currentQuantity => ', this[chartName].currentQuantity);
      console.log('currentTimeRange => ', this[chartName].currentTimeRange);

      console.log('onRangeChanged => ', timeRange );
      // this[chartName].labels = [];
      this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(TimeRanges[this[chartName].currentTimeRange], Date.now(), timeRange)
      .pipe(
        map(result => JSON.parse(JSON.stringify(result))),
        map(resultAsArray => resultAsArray.sort((a, b) =>  a.id - b.id)),
        mergeMap((arrayResult: any[]) => this[functionToSubscribe](arrayResult, TimeRanges[this[chartName].currentTimeRange])
        )
      )
      .subscribe(
        (result) => { console.log('Result => ', result); },
        (error) => { console.log(error); },
        () => console.log('FINISHED')
      );
    };
    // To hide or show the filter helper component
    this[chartName].toggleFilterForm = () => {
      this[chartName].showFilterForm = !this[chartName].showFilterForm;
    };
    // to update the filters for each chart
    this[chartName].updateFiltersApplied = (filtersApplied: string[], show: boolean) => {
      this[chartName].filtersApplied = filtersApplied;
      this[chartName].datasets.forEach(dataset => {
        filtersApplied.findIndex(i => i === dataset.label) !== -1
        ? dataset.hidden = false
        : dataset.hidden = filtersApplied.length === 0 ? false : true;
      });
      this.updateChart(chartName);
    };

  }

  updateChart(chartName: string): void {
    const labelsCopy = this[chartName].labels.slice();
    this[chartName].datasets.labels = 0;
    this[chartName].labels = labelsCopy;
  }


}
