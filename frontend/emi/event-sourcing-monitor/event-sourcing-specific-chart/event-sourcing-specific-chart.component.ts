import { TimeRanges } from '../chart-helpers/ChartTools';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FuseTranslationLoaderService } from './../../../../core/services/translation-loader.service';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { MatSidenav } from '@angular/material';
import { EventSourcingMonitorService } from '../event-sourcing-monitor.service';
import { ActivatedRoute } from '@angular/router';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
// tslint:disable-next-line:import-blacklist
import { mergeMap, map, tap, filter } from 'rxjs/operators';
// tslint:disable-next-line:import-blacklist
import { forkJoin, of, pipe } from 'rxjs';
import { rxSubscriber } from 'rxjs/internal-compatibility';
import { GenericBaseChart } from '../chart-helpers/GenericBaseChart';
import { NgxChartsPieChart } from '../chart-helpers/NgxChartsPieChart';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-event-sourcing-specific-chart',
  templateUrl: './event-sourcing-specific-chart.component.html',
  styleUrls: ['./event-sourcing-specific-chart.component.scss']
})

export class EventSourcingSpecificChartComponent implements OnInit {

  @ViewChild('sidenav') public sideNav: MatSidenav;
  eventTypeChart:  GenericBaseChart = new GenericBaseChart();
  eventTypeVsByUsersChart: NgxChartsPieChart = new NgxChartsPieChart();
  eventTypeVsByVersionChart: NgxChartsPieChart = new NgxChartsPieChart();
  selectedEvent: string = null;

  constructor(
    private translationLoader: FuseTranslationLoaderService,
    private eventSourcingMonitorervice: EventSourcingMonitorService,
    private route: ActivatedRoute
  ) {
    this.translationLoader.loadTranslations(english, spanish);
  }


  eventOptionList: string[] = [];

  ngOnInit() {

    this.initCharts();

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
        mergeMap(params => {
          this.selectedEvent = params['name'];
          return this.updateEventTypeChart$(this.selectedEvent, 'MINUTE', 30);
        })
      )
      .subscribe(result => {
        console.log('RESULt BY SPECIFIC EVENT TYPE ', result);
      });


  }

  updateCharts(evtType: string) {
    if (this.selectedEvent !== evtType) {
      this.selectedEvent = evtType;
      Rx.Observable.forkJoin(
        this.updateEventTypeChart$(evtType, TimeRanges[this.eventTypeChart.currentTimeRange], this.eventTypeChart.currentQuantity)
      ).subscribe(
        (ok) => { console.log(ok); },
        (error) => { console.log(error); },
        () => { }
      );

    }
  }

  initCharts(){
    this.setFunctionOnCharts('eventTypeChart');
  }

  updateEventTypeChart$(eventName: string, timeScale: string, timeRange: number) {
    this.eventTypeVsByUsersChart.clearResultData();
    this.eventTypeVsByVersionChart.clearResultData();
    return this.eventSourcingMonitorervice.getTimeFrameswithFilter$(eventName, timeScale, timeRange)
      .pipe(
        mergeMap((array) => {
          return Rx.Observable.forkJoin(
            this.processVsData$(array[0]),
            Rx.Observable.of(array).pipe(
              tap(r => {
                this.eventOptionList = r[1];
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
        }),
        tap(() => {
          this.eventTypeVsByUsersChart.results = this.eventTypeVsByUsersChart.results.slice();
          this.eventTypeVsByVersionChart.results =  this.eventTypeVsByVersionChart.results.slice();
        })
      );

  }
  /**
   *
   * @param array UPDATE THE CHART THAT REPRESENT THE VS BETTEWN USERS AND VERSIONS BY EVENT TYPE
   */
  processVsData$(array: any[]){
    console.log('PROCESANDO DATA DEL LOS VS');
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
              mergeMap((cumulators: {key: string, value: number}[]) => this.cumulateDataInChart$('eventTypeVsByUsersChart', cumulators))
            ),
            Rx.Observable.of(eventtByVs).pipe(
              filter(item => item),
              map((r: any) => r.value),
              map((arrayWithVs: any[]) => arrayWithVs.filter(vs => vs.key === 'versionHits')),
              filter((userHits: any[]) => userHits.length > 0),
              map((r: any) => r[0].value),
              mergeMap((cumulators: {key: string, value: number}[]) => this.cumulateDataInChart$('eventTypeVsByVersionChart', cumulators))
            ),
          ))

        );
      }),
      map(() => {} )
    );
  }

  cumulateDataInChart$(chartName: string, dataToCummulate: any[]){
    return Rx.Observable.from(dataToCummulate)
    .pipe(
      mergeMap(({key, value}) => {
        return Rx.Observable.of({key, value})
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
    this[chartName].quantities = GenericBaseChart.getDefaultsTimeRangesForscaleTime(TimeRanges[TimeRanges.MINUTE]);
    this[chartName].currentQuantity = GenericBaseChart.getDefaultLimitByTimeRangeType(TimeRanges[TimeRanges.MINUTE]);

    // when Change the Scale of time like MINUTES, HOURS ....
    this[chartName].onScaleChanged = (scaleTime: number) => {
      this[chartName].quantities = GenericBaseChart.getDefaultsTimeRangesForscaleTime(TimeRanges[scaleTime]);
      this[chartName].currentQuantity = GenericBaseChart.getDefaultLimitByTimeRangeType(TimeRanges[scaleTime]);

      this[functionToSubscribe](this.selectedEvent, TimeRanges[scaleTime], this[chartName].currentQuantity)
      .subscribe(
        (result) => { console.log('Result => ', result); },
        (error) => { console.log(error); },
        () => { }
      );
    };

    // When change the range of time
    this[chartName].onRangeChanged = (timeRange: number) => {
      this[functionToSubscribe](this.selectedEvent, TimeRanges[this.eventTypeChart.currentTimeRange], timeRange)
      .subscribe(
        (result) => { console.log('Result => ', result); },
        (error) => { console.log(error); },
        () => { }
      );
    };
  }

  toogleSideNav(){
    this.sideNav.opened = !this.sideNav.opened;
  }
}
