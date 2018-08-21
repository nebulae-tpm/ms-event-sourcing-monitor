import { Subscription } from 'rxjs/Subscription';
import { TimeRanges } from '../chart-helpers/ChartTools';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { FuseTranslationLoaderService } from './../../../../core/services/translation-loader.service';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { MatSidenav } from '@angular/material';
import { EventSourcingMonitorService } from '../event-sourcing-monitor.service';
import { ActivatedRoute } from '@angular/router';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
// tslint:disable-next-line:import-blacklist
import { mergeMap, map, tap, filter, toArray } from 'rxjs/operators';
import { GenericBaseChart } from '../chart-helpers/GenericBaseChart';
import { NgxChartsPieChart } from '../chart-helpers/NgxChartsPieChart';
import { ObservableMedia } from '@angular/flex-layout';
import { FormControl } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-event-sourcing-specific-chart',
  templateUrl: './event-sourcing-specific-chart.component.html',
  styleUrls: ['./event-sourcing-specific-chart.component.scss']
})

export class EventSourcingSpecificChartComponent implements OnInit, OnDestroy, AfterViewInit {


  @ViewChild('sidenav') public sideNav: MatSidenav;
  // @ViewChild('inputFilterValue') inputFilterValue: ElementRef;
  filterInput: FormControl = new FormControl();

  eventTypeChart:  GenericBaseChart = new GenericBaseChart('eventTypeChart');
  eventTypeVsByUsersChart: NgxChartsPieChart = new NgxChartsPieChart('eventTypeVsByUsersChart');
  eventTypeVsByVersionChart: NgxChartsPieChart = new NgxChartsPieChart('eventTypeVsByVersionChart');
  selectedEvent: string = null;
  filterValue: string = null;
  listeningEvents = this.eventSourcingMonitorService.listeningEvents;

  totalVersionsCount = 0;
  totalUsersCount = 0;

  listeningEventSubscription: Subscription;


  constructor(
    private translationLoader: FuseTranslationLoaderService,
    private eventSourcingMonitorService: EventSourcingMonitorService,
    private route: ActivatedRoute,
    private observableMedia: ObservableMedia
  ) {
    this.translationLoader.loadTranslations(english, spanish);
  }


  eventOptionList: { eventName: string, count: number, show: boolean }[] = [];
  screenMode = 0;

  ngOnInit() {

    const grid = new Map([['xs', 1], ['sm', 2], ['md', 2], ['lg', 3], ['xl', 3]]);
    let start: number;
    grid.forEach((cols, mqAlias) => {
      if (this.observableMedia.isActive(mqAlias)) {
        start = cols;
      }
    });

    this.observableMedia.asObservable()
      .map(change => grid.get(change.mqAlias))
      .startWith(start)
      .subscribe((e: number) => { this.screenMode = e; console.log('Selected ==> ', e ); });

    this.setFunctionOnCharts('eventTypeChart');

    this.eventTypeVsByUsersChart.clearResultData = () => {
      this.eventTypeVsByUsersChart.results.length = 0;
      this.eventTypeVsByUsersChart.results = [];
    };

    this.eventTypeVsByVersionChart.clearResultData = () => {
      this.eventTypeVsByVersionChart.results.length = 0;
      this.eventTypeVsByVersionChart.results = [];
    };

    this.route.params
      .pipe(
        filter(params => params['name']),
        mergeMap(params => {
          this.selectedEvent = params['name'];
          return this.updateEventTypeChart$(this.selectedEvent, TimeRanges[this.eventTypeChart.currentTimeRange], this.eventTypeChart.currentQuantity);
        }))
      .subscribe(result => {});

      if (this.eventSourcingMonitorService.listeningEvents){
        this.startToListenUpdates();
      }


    this.filterInput.valueChanges.subscribe(term => {
      this.eventOptionList.forEach(e => {
        e.show = (term && term !== '') ? e.eventName.toLowerCase().includes(term.toLowerCase()) : true;
      });
    });


  }

  ngAfterViewInit(){
    // const filterinputObservable = Rx.Observable.fromEvent(this.inputFilterValue.nativeElement, 'keyup');

  }

  ngOnDestroy(): void {
    if (this.listeningEventSubscription){
      this.stopToListenUpdates();
    }
  }

  updateCharts(evtType: string) {
    if (this.selectedEvent !== evtType) {
      this.selectedEvent = evtType;
      Rx.Observable.forkJoin(
        this.updateEventTypeChart$(evtType, TimeRanges[this.eventTypeChart.currentTimeRange], this.eventTypeChart.currentQuantity)
      ).subscribe(
        (ok) => { },
        (error) => { console.log(error); },
        () => { }
      );

    }
  }

  updateEventTypeChart$(eventName: string, timeScale: string, timeRange: number) {
    this.eventTypeVsByUsersChart.clearResultData();
    this.eventTypeVsByVersionChart.clearResultData();
    return this.eventSourcingMonitorService.getTimeFrameswithFilter$(eventName, timeScale, timeRange)
      .pipe(
        mergeMap((array) => {
          return Rx.Observable.forkJoin(
            this.processVsData$(array[0]),
            Rx.Observable.of(array).pipe(
              tap(r => {
                this.eventOptionList = r[1].sort((a: any, b: any) => b.count - a.count );
                this.eventOptionList.forEach(e => {
                  e.show = (this.filterValue && this.filterValue !== '') ? e.eventName.toLowerCase().includes(this.filterValue.toLowerCase()) : true;
                });

              }),
              map(resultAsArray => resultAsArray[0].sort((a: any, b: any) => a.id - b.id)),
              tap(allSummaries => {
                this.eventTypeChart.datasets = [{
                  label: eventName,
                  data: [],
                  fill: 'start'
                }];

                this.eventTypeChart.labels.length = 0;
                allSummaries.forEach((summary: any, index: number) => {
                  this.eventTypeChart.datasets[0].data.push(summary.eventHits[0].value);
                  this.eventTypeChart.labels.push(
                    new Date(summary.id)
                      // TODO set i18n in the next method
                      .toLocaleString('es-CO', this.eventTypeChart.getLabelFormatter(timeScale))
                  );
                });
                this.eventTypeChart.ready = true;
              })
            )
          );
        })
      );

  }
  /**
   *
   * @param array UPDATE THE CHART THAT REPRESENT THE VS BETTEWN USERS AND VERSIONS BY EVENT TYPE
   */
  processVsData$(array: any[]) {
    return Rx.Observable.from(array)
      .pipe(
        map(summary => summary.eventTypes[0]),
        mergeMap(eventBalance => {
          return Rx.Observable.of(eventBalance)
            .pipe(
              mergeMap((eventtByVs: any) => Rx.Observable.forkJoin(
                Rx.Observable.of(eventtByVs).pipe(
                  filter(item => item),
                  map((r: any) => r.value),
                  map((arrayWithVs: any[]) => arrayWithVs.filter(vs => vs.key === 'userHits')),
                  filter((userHits: any[]) => userHits.length > 0),
                  map((r: any) => r[0].value),
                  mergeMap((cumulators: { key: string, value: number }[]) => this.cumulateDataInChart$(this.eventTypeVsByUsersChart.name, cumulators))
                ),
                Rx.Observable.of(eventtByVs).pipe(
                  filter(item => item),
                  map((r: any) => r.value),
                  map((arrayWithVs: any[]) => arrayWithVs.filter(vs => vs.key === 'versionHits')),
                  filter((userHits: any[]) => userHits.length > 0),
                  map((r: any) => r[0].value),
                  mergeMap((cumulators: { key: string, value: number }[]) => this.cumulateDataInChart$(this.eventTypeVsByVersionChart.name, cumulators))
                ),
              ))
            );
        })
      )
      .toArray()
      .pipe(
        mergeMap(() => {
          // sorting the data by the total count per version
          const resultsByVersionOrdered = this.eventTypeVsByVersionChart.results.sort((a, b) => b.value - a.value);
          this.totalVersionsCount = resultsByVersionOrdered.length;

          const resultsByUserOrdered = this.eventTypeVsByUsersChart.results.sort((a, b) => b.value - a.value);
          this.totalUsersCount = resultsByUserOrdered.length;

          const readyResultByVersion = resultsByVersionOrdered.slice(0, 10);
          const readyResultByUser = resultsByUserOrdered.slice(0, 10);

          return Rx.Observable.forkJoin(
            Rx.Observable.from(resultsByVersionOrdered.slice(10))
              .pipe(
                map((result) => {
                  readyResultByVersion[10] = {
                    name: 'Otros',
                    value: readyResultByVersion[10] ? readyResultByVersion[10].value + result.value : result.value
                  };
                })
              ).toArray()
              .pipe(
                map(() => {
                  // updating the data charts
                  this.eventTypeVsByVersionChart.results = readyResultByVersion.slice();
                })
              ),
            Rx.Observable.from(resultsByUserOrdered.slice(10))
            .pipe(
              map((result) => {
                readyResultByUser[10] = {
                  name: 'Otros',
                  value: readyResultByUser[10] ? readyResultByUser[10].value + result.value : result.value
                };
              })
            ).toArray()
            .pipe(
              map(() => {
                // updating the data charts
                this.eventTypeVsByUsersChart.results = readyResultByUser.slice();
              })
            )
          );
        }
        )
      );
  }

  /**
   * cumulate
   * @param chartName ChartName
   * @param dataToCummulate
   */
  cumulateDataInChart$(chartName: string, dataToCummulate: any[]){
    return Rx.Observable.from(dataToCummulate)
    .pipe(
      mergeMap(({key, value}) => {
        return Rx.Observable.of({
            key: chartName === this.eventTypeVsByVersionChart.name ? `Version: ${key}` : key,
            value
        })
        .pipe(
          map(item => {
            const indexOf = this[chartName].results.findIndex(o => o.name === item.key);
            if (indexOf === -1){
              this[chartName].results.push({name: item.key, value: item.value });
            }else{
              this[chartName].results[indexOf].value = this[chartName].results[indexOf].value + item.value;
            }
            return Rx.Observable.of(item);
          })
        );
      })
    );
  }

  /**
   * initilizer function to create the chart and its inner functions
   * @param chartName Chart name in the component
   */
  setFunctionOnCharts(chartName: string): void {
    // function name to call when an update is required
    const functionToSubscribe = `update${chartName[0].toUpperCase()}${chartName.slice(1, chartName.length)}$`;
    this[chartName].quantities = Object.entries(this.eventSourcingMonitorService.chartFilter.ranges).length > 0
      ? this.eventSourcingMonitorService.chartFilter.ranges
      : GenericBaseChart.getDefaultsTimeRangesForscaleTime(TimeRanges[this.eventSourcingMonitorService.chartFilter.timeScale]);
    this.eventTypeChart.currentQuantity = this.eventSourcingMonitorService.chartFilter.timeRange;
    this.eventTypeChart.currentTimeRange = this.eventSourcingMonitorService.chartFilter.timeScale;

    // when Change the Scale of time like MINUTES, HOURS ....
    this[chartName].onScaleChanged = (scaleTime: number) => {
      this.eventSourcingMonitorService.chartFilter.timeScale = scaleTime;
      this[chartName].quantities = GenericBaseChart.getDefaultsTimeRangesForscaleTime(TimeRanges[scaleTime]);
      this.eventSourcingMonitorService.chartFilter.ranges = this[chartName].quantities;
      this[chartName].currentQuantity = GenericBaseChart.getDefaultLimitByTimeRangeType(TimeRanges[scaleTime]);
      this.eventSourcingMonitorService.chartFilter.timeRange = this[chartName].currentQuantity;

      this[functionToSubscribe](this.selectedEvent, TimeRanges[scaleTime], this[chartName].currentQuantity)
      .subscribe(
        (result) => {  },
        (error) => { console.log(error); },
        () => { }
      );
    };

    // When change the range of time
    this[chartName].onRangeChanged = (timeRange: number) => {
      this.eventSourcingMonitorService.chartFilter.timeRange = timeRange;
      this[functionToSubscribe](this.selectedEvent, TimeRanges[this.eventTypeChart.currentTimeRange], timeRange)
      .subscribe(
        (result) => { },
        (error) => { console.log(error); },
        () => { }
      );
    };
  }

  toogleSideNav(mandatory: boolean){
    if ( mandatory || this.screenMode !== 3 ){
      this.sideNav.opened = !this.sideNav.opened;
    }
  }

  eventListenerSwicht(){
    this.eventSourcingMonitorService.listeningEvents = !this.eventSourcingMonitorService.listeningEvents;
    this.listeningEvents = this.eventSourcingMonitorService.listeningEvents;
    this.eventSourcingMonitorService.listeningEvent$.next(this.listeningEvents);
    this.listeningEvents ? this.startToListenUpdates() : this.stopToListenUpdates();
  }

  startToListenUpdates(){
    this.listeningEventSubscription = this.eventSourcingMonitorService.listenAvailableUpdates$()
      .pipe(
        mergeMap(() => this.updateEventTypeChart$(
          this.selectedEvent,
          TimeRanges[this.eventSourcingMonitorService.chartFilter.timeScale],
          this.eventSourcingMonitorService.chartFilter.timeRange)
        )
      )
    .subscribe(
      (update) => { },
      (error) => console.log(error)
    );
  }

  stopToListenUpdates(){
    this.listeningEventSubscription.unsubscribe();
  }


}
