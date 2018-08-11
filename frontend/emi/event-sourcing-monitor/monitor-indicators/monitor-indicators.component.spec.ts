import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorIndicatorsComponent } from './monitor-indicators.component';

describe('MonitorIndicatorsComponent', () => {
  let component: MonitorIndicatorsComponent;
  let fixture: ComponentFixture<MonitorIndicatorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorIndicatorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
