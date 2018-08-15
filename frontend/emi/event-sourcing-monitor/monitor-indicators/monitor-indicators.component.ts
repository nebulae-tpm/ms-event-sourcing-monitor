import { TimeRanges } from './../chart-helpers/Tool';
import { Component, OnInit } from '@angular/core';
import { EventSourcingMonitorService } from '../event-sourcing-monitor.service';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
// tslint:disable-next-line:import-blacklist
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

export interface TopEvent{
  eventType: string;
  date: string[];
  total: number[];
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
  public cols: Observable<number>;
  listeningEvent = false;
  topEvents: TopEvent[] = [];
  tableDataReady = false;

  displayedColumns: string[] = ['eventType', 'balance_0', 'balance_1', 'balance_2'];
  transactions: Transaction[] = [
    {item: 'Beach ball', cost: 4},
    {item: 'Towel', cost: 5},
    {item: 'Frisbee', cost: 2},
    {item: 'Sunscreen', cost: 4},
    {item: 'Cooler', cost: 25},
    {item: 'Swim suit', cost: 15},
  ];

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
    private eventSourcingMonitorervice: EventSourcingMonitorService
  ) { }

  ngOnInit() {

    this.updateBalanceTable('MINUTE');
  }

  updateBalanceTable(timeScale: string){
    this.tableDataReady = false;
    this.topEvents = [];
    this.eventSourcingMonitorervice.getTimeFrameInRangeSince$(timeScale, Date.now(), 3)
    .pipe(
      map(result => JSON.parse(JSON.stringify(result))),
      map((resultAsArray: any[]) => resultAsArray.sort((a, b) =>  a.id - b.id) ),
      mergeMap((arrayResult: any) =>
        Rx.Observable.from(arrayResult)
        .pipe(
          map((r: any) => ({ id: r.id, hits: r.eventTypeHits }) )
        ).toArray()
      )
    )
    .subscribe(
      (result: any[]) => {
        result.slice(1, 4).forEach((item, index) => {
          item.hits.forEach(currentKeyValue => {
            let previusKeyValue = result[index].hits.filter(o => o.key === currentKeyValue.key)[0];
            previusKeyValue = previusKeyValue ? previusKeyValue.value : 0;
            const balance =  previusKeyValue !== 0
              ? +(((currentKeyValue.value / previusKeyValue) - 1) * 100).toFixed(0)
              : -999;
            const indexInTopEvents = this.topEvents.findIndex(e => e.eventType === currentKeyValue.key);
            if (indexInTopEvents === -1){
              this.topEvents.push({
                eventType: currentKeyValue.key,
                date: ['---', '---', '---'],
                total: Array.apply(null, Array(3)).map(Number.prototype.valueOf, 0),
                balance: Array.apply(null, Array(3)).map(Number.prototype.valueOf, 0)
              });
              this.topEvents[this.topEvents.length - 1].date[index] = new Date(item.id).toLocaleString('es-CO', this.getLabelFormatter(timeScale));
              this.topEvents[this.topEvents.length - 1].total[index] = currentKeyValue.value;
              this.topEvents[this.topEvents.length - 1].balance[index] = balance;

            }else{
              this.topEvents[indexInTopEvents].date[index] = new Date(item.id).toLocaleString('es-CO', this.getLabelFormatter(timeScale));
              this.topEvents[indexInTopEvents].balance[index] = balance;
              this.topEvents[indexInTopEvents].total[index] = currentKeyValue.value;
            }
          });
        });
        console.log(this.topEvents);
        this.tableDataReady = true;
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


  eventListenerSwicht(){
    this.listeningEvent = !this.listeningEvent;
    this.eventSourcingMonitorervice.listeningEvent$.next(this.listeningEvent);
  }

}
