import { EventSourcingSpecificChartComponent } from './event-sourcing-specific-chart/event-sourcing-specific-chart.component';
import { NgModule } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../core/modules/shared.module';
import { DatePipe } from '@angular/common';
import { FuseWidgetModule } from '../../../core/components/widget/widget.module';

import { EventSourcingMonitorService } from './event-sourcing-monitor.service';
import { EventSourcingMonitorComponent } from './event-sourcing-monitor.component';
import { MonitorFilterHelperComponent } from './monitor-filter-helper/monitor-filter-helper.component';
import { MonitorIndicatorsComponent } from './monitor-indicators/monitor-indicators.component';


const routes: Routes = [
  {
    path: '',
    component: EventSourcingMonitorComponent,
  },
  {
    path: ':name',
    component: EventSourcingSpecificChartComponent
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    NgxChartsModule,
    FuseWidgetModule
  ],
  declarations: [
    EventSourcingMonitorComponent,
    MonitorFilterHelperComponent,
    EventSourcingSpecificChartComponent,
    MonitorIndicatorsComponent
  ],
  providers: [ EventSourcingMonitorService, DatePipe]
})

export class EventSourcingMonitorModule { }
