import { msnamecamelService } from './msname.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { fuseAnimations } from '../../../core/animations';
import { Subscription } from 'rxjs/Subscription';
import * as Rx from 'rxjs/Rx';

@Component({
  selector: 'msname',
  templateUrl: './msname.component.html',
  styleUrls: ['./msname.component.scss'],
  animations: fuseAnimations
})
export class msnamecamelComponent implements OnInit, OnDestroy {
  
  helloWorld: String = 'Hello World static';

  constructor(private msnamecamelervice: msnamecamelService  ) {

  }
    

  ngOnInit() {    
  }

  
  ngOnDestroy() {
  }

}
