import { Component, OnInit, ViewChild } from '@angular/core';
import { FuseTranslationLoaderService } from './../../../../core/services/translation-loader.service';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { MatSidenav } from '@angular/material';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-event-sourcing-specific-chart',
  templateUrl: './event-sourcing-specific-chart.component.html',
  styleUrls: ['./event-sourcing-specific-chart.component.scss']
})

export class EventSourcingSpecificChartComponent implements OnInit {

  @ViewChild('sidenav') public sideNav: MatSidenav;

  constructor(
    private translationLoader: FuseTranslationLoaderService,
  ) {
    this.translationLoader.loadTranslations(english, spanish);
  }

  eventList: string[] = Array.apply(null, Array(100)).map(Number.prototype.valueOf, 1);

  ngOnInit() {
    console.log('sideNAv ==> ', this.sideNav);
  }

  updateCharts(){
    console.log(this.sideNav._isFocusTrapEnabled);
    if (this.sideNav.opened){
      console.log('#########', this.sideNav );
      // this.sideNav.close();
    }

  }

}
