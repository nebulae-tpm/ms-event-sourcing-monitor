import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../core/modules/shared.module';
import { DatePipe } from '@angular/common';
import { FuseWidgetModule } from '../../../core/components/widget/widget.module';

import { EventSourcingMonitorService } from './event-sourcing-monitor.service';
import { EventSourcingMonitorComponent } from './event-sourcing-monitor.component';

const routes: Routes = [
  {
    path: '',
    component: EventSourcingMonitorComponent,
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    FuseWidgetModule
  ],
  declarations: [
    EventSourcingMonitorComponent    
  ],
  providers: [ EventSourcingMonitorService, DatePipe]
})

export class EventSourcingMonitorModule {}