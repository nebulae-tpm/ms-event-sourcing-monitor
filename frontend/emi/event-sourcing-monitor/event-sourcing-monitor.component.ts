import { Subscription } from 'rxjs/Subscription';
import { TimeRanges } from './chart-helpers/ChartTools';
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
import { forkJoin } from 'rxjs';
import { GenericBaseChart } from './chart-helpers/GenericBaseChart';
import { TranslateService } from '@ngx-translate/core';


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
  generalEventsOverViewChart: GenericBaseChart = new GenericBaseChart();
  overViewByEventType: GenericBaseChart = new GenericBaseChart();
  overViewByAggregateType: GenericBaseChart = new GenericBaseChart();
  allSubscriptionis: Subscription[] = [];
  listeningEventSubscription: Subscription;
  listeningEvent = false;

  constructor(
    private eventSourcingMonitorervice: EventSourcingMonitorService,
    private translationLoader: FuseTranslationLoaderService,
    private translateService: TranslateService) {
    this.translationLoader.loadTranslations(english, spanish);
  }


  ngOnInit() {
    this.setFunctionOnCharts('generalEventsOverViewChart');
    this.updateAllCharts$()
    .subscribe(
      (result) =>  {} ,
      (error) => (console.log(error)),
      () => {}
    );

      this.eventSourcingMonitorervice.listeningEvent$
      .subscribe(
        (listeningEvents) => {
          listeningEvents ? this.startToListenEvents() : this.stopListeningEvents();
        },
        (error) => {

        },
      );



  }

  ngOnDestroy() {
    this.allSubscriptionis.forEach(e => e.unsubscribe());
  }

  updateAllCharts$(timeScale: string = 'MINUTE', timestamp: number = Date.now(), quantity: number = GenericBaseChart.getDefaultLimitByTimeRangeType('MINUTE') ){
    return this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(timeScale, timestamp,  quantity)
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
      ).toArray();
  }

/**
 * Update the general overview chart
 * @param allSummaries allSummaries that the query give us
 * @param timeScale  MINUTE, HOUR, DAY, MONTH, YEAR
 */
  updateGeneralEventsOverViewChart$(allSummaries: any[], timeScale: string) {
    this.generalEventsOverViewChart.datasets = [{
      label: this.translateService.instant('WIDGETS.LABELS.GENERAL_EVENT_COUNT'),
      data: [],
      fill: 'start'
    }];

    this.generalEventsOverViewChart.labels.length = 0;
    allSummaries.forEach((summary, index) => {
      this.generalEventsOverViewChart.datasets[0].data.push(summary.globalHits);
      this.generalEventsOverViewChart.labels.push(
        new Date(summary.id)
          // TODO set i18n in the next method
          .toLocaleString('es-CO', this.generalEventsOverViewChart.getLabelFormatter(timeScale))
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
    allSummaries.forEach(({eventTypeHits}) => {
      eventTypeHits.forEach(({ key, value }) => {
        if (allDataSets.filter(o => o.label === key).length === 0) {
          allDataSets.push(
            {
              label: key,
              data: Array(allSummaries.length).fill(0), // .apply(null, Array(allSummaries.length)).map(Number.prototype.valueOf, 0),
              fill: false,
              hidden: allDataSets.length >= 5 ? true : false
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
      this.overViewByEventType.labels.push(new Date(id).toLocaleString('es-CO', this.overViewByEventType.getLabelFormatter(timeScale)));
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
      allDataSets = [{
        label: 'Event_A',
        data: Array(allSummaries.length).fill(0), // Array.apply(null, Array(allSummaries.length)).map(Number.prototype.valueOf, 0),
        fill: 'start'
      }];
    }

    this.overViewByEventType.datasets = allDataSets;
    this.overViewByEventType.ready = true;
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
               data: Array(allSummaries.length).fill(0), // .apply(null, Array(allSummaries.length)).map(Number.prototype.valueOf, 0),
               fill: false,
               hidden: allDataSets.length >= 5 ? true : false
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
           .toLocaleString('es-CO', this.overViewByAggregateType.getLabelFormatter(timeScale))
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

  /**
   * initilizer function to create the chart and its inner functions
   * @param chartName Chart name in the component
   */
  setFunctionOnCharts(chartName: string): void {
    // function name to call when an update is required
    const functionToSubscribe = `update${chartName[0].toUpperCase()}${chartName.slice(1, chartName.length)}$`;
    this[chartName].quantities = GenericBaseChart.getDefaultsTimeRangesForscaleTime(TimeRanges[TimeRanges.MINUTE]);
    this[chartName].currentQuantity = GenericBaseChart.getDefaultLimitByTimeRangeType(TimeRanges[TimeRanges.MINUTE]);

    // when Change the Scale of time like MINUTES, HOURS ....
    this[chartName].onScaleChanged = (scaleTime: number) => {

      this[chartName].quantities = GenericBaseChart.getDefaultsTimeRangesForscaleTime(TimeRanges[scaleTime]);
      this[chartName].currentQuantity = GenericBaseChart.getDefaultLimitByTimeRangeType(TimeRanges[scaleTime]);
      this.updateAllCharts$(TimeRanges[scaleTime], Date.now(), this[chartName].currentQuantity)
      .subscribe(
        (result) =>  {},
        (error) => (console.log(error)),
        () => {}
      );

    };
    // When change the range of time
    this[chartName].onRangeChanged = (timeRange: number) => {
      this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(TimeRanges[this[chartName].currentTimeRange], Date.now(), timeRange)
      .pipe(
        map(result => JSON.parse(JSON.stringify(result))),
        map(resultAsArray => resultAsArray.sort((a, b) =>  a.id - b.id)),
        mergeMap((arrayResult: any[]) => this[functionToSubscribe](arrayResult, TimeRanges[this[chartName].currentTimeRange])
        )
      )
      .subscribe(
        (result) => { },
        (error) => { console.log(error); },
        () => { }
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
      this[chartName].updateChart();
    };

  }

  startToListenEvents(){
    this.listeningEventSubscription = this.eventSourcingMonitorervice.listenAvailableUpdates$()
      .pipe(
        mergeMap(() => this.updateAllCharts$(
          TimeRanges[this.generalEventsOverViewChart.currentTimeRange], Date.now(), this.generalEventsOverViewChart.currentQuantity) )
      )
      .subscribe(
        (result) => {} ,
        (error) => (console.log(error)),
        () => {}
      );
    // this.allSubscriptionis.push(this.listeningEventSubscription);
  }

  stopListeningEvents(){
    this.listeningEventSubscription.unsubscribe();
  }

  eventListenerSwicht(){
    this.listeningEvent = !this.listeningEvent;
    this.eventSourcingMonitorervice.listeningEvent$.next(this.listeningEvent);
  }
}
