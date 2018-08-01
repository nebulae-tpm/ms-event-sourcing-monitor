import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSourcingSpecificChartComponent } from './event-sourcing-specific-chart.component';

describe('EventSourcingSpecificChartComponent', () => {
  let component: EventSourcingSpecificChartComponent;
  let fixture: ComponentFixture<EventSourcingSpecificChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventSourcingSpecificChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSourcingSpecificChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
