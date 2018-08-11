import { TimeRanges } from './../chart-helpers/Tool';
import { Component, OnInit, Input } from '@angular/core';
import { EventSourcingMonitorService } from '../event-sourcing-monitor.service';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
// tslint:disable-next-line:import-blacklist
import { mergeMap, map, tap } from 'rxjs/operators';
import { GenericBaseChart } from '../chart-helpers/GenericBaseChart';

export interface TopEvent{
  eventType: string;
  date: string[];
  total: number[];
  balance: number[];
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-monitor-indicators',
  templateUrl: './monitor-indicators.component.html',
  styleUrls: ['./monitor-indicators.component.scss']
})

export class MonitorIndicatorsComponent implements OnInit {
  // topEvents: { eventType: string, data: { total: number, balance: number[] } }[] = [];
  topEvents: TopEvent[] = [];

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

  constructor(private eventSourcingMonitorervice: EventSourcingMonitorService) { }

  ngOnInit() {
    this.updateBalanceTable('MINUTE');
  }

  updateBalanceTable(timeScale: string){
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
        console.log('OPTIONS: ', result);
        result.slice(1, 4).forEach((item, index) => {
          item.hits.forEach(currentKeyValue => {
            console.log(new Date(result[index].id).toLocaleTimeString());
            const totalArray = [];
            const balanceArray = [];
            let previusKeyValue = result[index].hits.filter(o => o.key === currentKeyValue.key)[0];
            previusKeyValue = previusKeyValue ? previusKeyValue.value : 0;
            const balance =  previusKeyValue !== 0
              ? +(((currentKeyValue.value / previusKeyValue) - 1) * 100).toFixed(0)
              : -999;
              console.log('previusKeyValue ==>', previusKeyValue, 'currentKeyValue.value', currentKeyValue.value, ' BALANCE ==>', balance);

            const indexInTopEvents = this.topEvents.findIndex(e => e.eventType === currentKeyValue.key);
            if (indexInTopEvents === -1){
              this.topEvents.push({
                eventType: currentKeyValue.key,
                date: ['---', '---', '---'],
                total: Array.apply(null, Array(3)).map(Number.prototype.valueOf, 0),
                balance: Array.apply(null, Array(3)).map(Number.prototype.valueOf, 0)
              });
              this.topEvents[this.topEvents.length - 1].date[index] = new Date(item.id).toLocaleString('es-CO', this.getLabelFormatter('MINUTE'));
              this.topEvents[this.topEvents.length - 1].total[index] = currentKeyValue.value;
              this.topEvents[this.topEvents.length - 1].balance[index] = balance;

            }else{
              this.topEvents[indexInTopEvents].date[index] = new Date(item.id).toLocaleString('es-CO', this.getLabelFormatter('MINUTE'));
              this.topEvents[indexInTopEvents].balance[index] = balance;
              this.topEvents[indexInTopEvents].total[index] = currentKeyValue.value;
            }
            // if (this.topEvents.length <= 8) {
            //   this.topEvents[index].push({
            //     eventType: preKeyValue.key,
            //     total: latestKeyValue ? latestKeyValue.value : 0,
            //     balance: rowBalance
            //   });
            // }

          });


        });

        console.log('%%%%%%%%%%%%%%%%%%%', this.topEvents);
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

}