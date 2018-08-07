import { genericLineChart, TimeRanges } from './../event-sourcing-monitor-chart-helper';
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
import { mergeMap, map, tap } from 'rxjs/operators';
// tslint:disable-next-line:import-blacklist
import { forkJoin, of } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-event-sourcing-specific-chart',
  templateUrl: './event-sourcing-specific-chart.component.html',
  styleUrls: ['./event-sourcing-specific-chart.component.scss']
})

export class EventSourcingSpecificChartComponent implements OnInit {

  @ViewChild('sidenav') public sideNav: MatSidenav;
  eventTypeChart:  any = JSON.parse(JSON.stringify(genericLineChart));
  selectedEvent: string = null;

  constructor(
    private translationLoader: FuseTranslationLoaderService,
    private eventSourcingMonitorervice: EventSourcingMonitorService,
    private route: ActivatedRoute
  ) {
    this.translationLoader.loadTranslations(english, spanish);
  }

  eventList: string[] = Array.apply(null, Array(10)).map(Number.prototype.valueOf, 1);

  ngOnInit() {
    // console.log('sideNAv ==> ', this.sideNav);

    this.route.params
      .pipe(
        mergeMap(params => {
          this.selectedEvent = params['name'];
          return this.updateEventTypeChart$(this.selectedEvent, 'MINUTE', 30);
        }),
        tap(() => {
          this.initCharts();
        })
      )
      .subscribe(result => {
        console.log('RESULt BY SPECIFIC EVENT TYPE ', result);
      });


  }

  updateCharts(){
    console.log(this.sideNav._isFocusTrapEnabled);
    if (this.sideNav.opened){
      console.log('#########', this.sideNav );
      // this.sideNav.close();
    }

  }

  initCharts(){
    this.setFunctionOnCharts('eventTypeChart');
  }

  updateEventTypeChart$(eventName: string, timeScale: string, timeRange: number) {
    return this.eventSourcingMonitorervice.getTimeFrameswithFilter$(eventName, timeScale, timeRange)
      .pipe(
        tap(r => console.log(r)),
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
                .toLocaleString('es-CO', this.getLabelFormatter(timeScale))
            );
          });

          this.eventTypeChart.ready = true;


        })
      );
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

      this[functionToSubscribe](this.selectedEvent, TimeRanges[scaleTime], this[chartName].currentQuantity)
      .subscribe(
        (result) => { console.log('Result => ', result); },
        (error) => { console.log(error); },
        () => console.log('FINISHED')
      );
    };

    // When change the range of time
    this[chartName].onRangeChanged = (timeRange: number) => {
      this[functionToSubscribe](this.selectedEvent, TimeRanges[this.eventTypeChart.currentTimeRange], timeRange)
      .subscribe(
        (result) => { console.log('Result => ', result); },
        (error) => { console.log(error); },
        () => console.log('FINISHED')
      );
    };


  }

  updateChart(chartName: string): void {
    const labelsCopy = this[chartName].labels.slice();
    this[chartName].datasets.labels = 0;
    this[chartName].labels = labelsCopy;
  }

}
