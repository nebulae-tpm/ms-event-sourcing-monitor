import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
// tslint:disable-next-line:import-blacklist
import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';

export interface FilterOptions {
  letter: string;
  names: string[];
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.toLowerCase().indexOf(filterValue) === 0);
};

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-monitor-filter-helper',
  templateUrl: './monitor-filter-helper.component.html',
  styleUrls: ['./monitor-filter-helper.component.scss']
})


export class MonitorFilterHelperComponent implements OnInit {

  @Input() listOptions: FilterOptions[];
  @Input() filtersApplied: string[];
  @Output() filtersUpdated: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder) { }

  searchFilter: string;

  stateForm: FormGroup = this.fb.group({
    stateGroup: '',
  });
  stateGroups: FilterOptions[] = [];


  stateGroupOptions: Observable<FilterOptions[]>;

  ngOnInit() {
    this.stateGroups = this.listOptions;
    // tslint:disable-next-line:no-non-null-assertion
    this.stateGroupOptions = this.stateForm.get('stateGroup')!.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterGroup(value))
      );
  }

  private _filterGroup(value: string): FilterOptions[] {
    if (value) {
      return this.stateGroups
        .map(group => ({letter: group.letter, names: _filter(group.names, value)}))
        .filter(group => group.names.length > 0);
    }

    return this.stateGroups;
  }

  removeItemFromFilter(filter: any) {
    this.filtersApplied = this.filtersApplied.filter(e => e !== filter);
    console.log('removeItemFromFilter', this.filtersApplied);
    this.filtersUpdated.emit(this.filtersApplied);
  }

  onNewFilterAdded(filter: any){
    const filterToApply = filter.source.value;
    this.searchFilter = '';
    if (!this.filtersApplied.includes(filterToApply)){
      this.filtersApplied.push(filter.source.value);
      this.filtersUpdated.emit(this.filtersApplied);
    }
  }
}
