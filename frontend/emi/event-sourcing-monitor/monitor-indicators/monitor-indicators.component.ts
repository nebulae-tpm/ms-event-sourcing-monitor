import { TimeRanges } from './../chart-helpers/Tool';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, Output , EventEmitter} from '@angular/core';
import { EventSourcingMonitorService } from '../event-sourcing-monitor.service';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
// tslint:disable-next-line:import-blacklist
import { mergeMap, map, tap, filter } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { MatTableDataSource } from '@angular/material';

export interface TopEvent{
  eventType: string;
  totals: number[];
  balance: number[];
}

export interface Transaction {
  item: string;
  cost: number;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-monitor-indicators',
  templateUrl: './monitor-indicators.component.html',
  styleUrls: ['./monitor-indicators.component.scss']
})

export class MonitorIndicatorsComponent implements OnInit {
  @Output() eventListReady = new EventEmitter();
  public cols: Observable<number>;
  topEvents: TopEvent[] = [];
  topEventsDataSource = new MatTableDataSource();
  listeningEventSubscription: Subscription;

  displayedColumns: string[] = ['eventType', 'balance_0', 'balance_1', 'balance_2'];


  balanceTable = {
    datesHeaders: ['---', '---', '---'],
    currentTimeRange: TimeRanges.MINUTE,
    timeScales: {
      MINUTE: 1,
      HOUR: 2,
      DAY: 3,
      MONTH: 4,
      YEAR: 5
    }
  };

  selectedTimeRange: string;

  constructor(
    private eventSourcingMonitorervice: EventSourcingMonitorService
  ) { }

  ngOnInit() {
    this.selectedTimeRange = TimeRanges[this.eventSourcingMonitorervice.chartFilter.timeScale];
    this.updateBalanceTable(TimeRanges[this.eventSourcingMonitorervice.chartFilter.timeScale]);

    this.eventSourcingMonitorervice.onTimeScaleChanged$
    .pipe(
      tap(timeScale => {
        this.balanceTable.datesHeaders = ['---', '---', '---'];
        this.selectedTimeRange = TimeRanges[timeScale];
        this.updateBalanceTable(this.selectedTimeRange);
      })
    ).subscribe(
      () => {},
      (error) => {}
    );

    if (this.eventSourcingMonitorervice.listeningEvents){
      this.startToListenUpdates();
    }

    this.eventSourcingMonitorervice.listeningEvent$.subscribe(
      (listeningEvents) => listeningEvents ?  this.startToListenUpdates() : this.stopToListenUpdates()  ,
      (error) => console.log('ERROR ', error),
      () => console.log('Completed')
    );
  }

  updateBalanceTable(timeScale: string) {
    this.topEvents = [];
    this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(timeScale, Date.now(), 3)
      .pipe(
        filter(result => result != null),
        map(result => JSON.parse(JSON.stringify(result))),
        map((resultAsArray: any[]) => resultAsArray.sort((a, b) => a.id - b.id)),
        mergeMap((arrayResult: any) =>
          Rx.Observable.from(arrayResult)
            .pipe(
              map((r: any) => ({ id: r.id, hits: r.eventTypeHits }))
            ).toArray()
        )
      )
      .subscribe(
        (result: any[]) => {
          result.slice(1, 4).forEach((item, index) => {
            item.hits.forEach(currentKeyValue => {
              let previusKeyValue = result[index].hits.filter(o => o.key === currentKeyValue.key)[0];
              previusKeyValue = previusKeyValue ? previusKeyValue.value : 0;
              const balance = previusKeyValue !== 0
                ? +(((currentKeyValue.value / previusKeyValue) - 1) * 100).toFixed(0)
                : -999;
              const indexInTopEvents = this.topEvents.findIndex(e => e.eventType === currentKeyValue.key);

                if (indexInTopEvents === -1) {
                  this.topEvents.push({
                    eventType: currentKeyValue.key,
                    totals: Array.apply(null, Array(3)).map(Number.prototype.valueOf, 0),
                    balance: Array.apply(null, Array(3)).map(Number.prototype.valueOf, 0)
                  });
                  this.balanceTable.datesHeaders[index] = new Date(item.id).toLocaleString('es-CO', this.getLabelFormatter(timeScale));
                  this.topEvents[this.topEvents.length - 1].totals[index] = currentKeyValue.value;
                  this.topEvents[this.topEvents.length - 1].balance[index] = balance;

                } else {
                  this.balanceTable.datesHeaders[index] = new Date(item.id).toLocaleString('es-CO', this.getLabelFormatter(timeScale));
                  this.topEvents[indexInTopEvents].balance[index] = balance;
                  this.topEvents[indexInTopEvents].totals[index] = currentKeyValue.value;
                }
            });
          });
          this.topEvents = this.topEvents
          .sort((a, b) => b.totals.reduce((x, y) => x + y, 0) - a.totals.reduce((x, y) => x + y, 0))
          .slice(0, 7);
          this.topEventsDataSource.data = this.topEvents;
          this.eventListReady.emit(this.topEvents);
        },
        (e) => console.log(e),
        () => { }
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

  startToListenUpdates(){
    this.listeningEventSubscription = this.eventSourcingMonitorervice.listenAvailableUpdates$().subscribe(
      (ok) => this.updateBalanceTable(TimeRanges[this.eventSourcingMonitorervice.chartFilter.timeScale]),
      (error) => console.log(error),
      () => console.log()
    );
  }

  stopToListenUpdates(){
    this.listeningEventSubscription.unsubscribe();
  }

}
