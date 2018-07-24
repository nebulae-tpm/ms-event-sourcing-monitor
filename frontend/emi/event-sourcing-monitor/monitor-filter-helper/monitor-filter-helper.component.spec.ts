import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorFilterHelperComponent } from './monitor-filter-helper.component';

describe('MonitorFilterHelperComponent', () => {
  let component: MonitorFilterHelperComponent;
  let fixture: ComponentFixture<MonitorFilterHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorFilterHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorFilterHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
