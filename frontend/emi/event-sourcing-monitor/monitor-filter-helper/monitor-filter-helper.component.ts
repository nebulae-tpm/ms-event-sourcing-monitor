import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
// tslint:disable-next-line:import-blacklist
import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { FuseTranslationLoaderService } from '../../../../core/services/translation-loader.service';

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
  @ViewChild('searchFilter') filterInput: ElementRef;

  constructor(private fb: FormBuilder,
    private translationLoader: FuseTranslationLoaderService) { }

  filterForm: FormGroup = this.fb.group({
    filterGroup: '',
  });

  optionsToFilterByGroups: FilterOptions[] = [];


  eventGroupOptions: Observable<FilterOptions[]>;

  ngOnInit() {
    this.translationLoader.loadTranslations(english, spanish);
    this.optionsToFilterByGroups = this.listOptions;
    // tslint:disable-next-line:no-non-null-assertion
    this.eventGroupOptions = this.filterForm.get('filterGroup')!.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterGroup$(value))
      );
  }

  private filterGroup$(value: string): FilterOptions[] {
    if (value) {
      return this.optionsToFilterByGroups
        .map(group => ( {letter: group.letter, names: _filter(group.names, value)} ) )
        .filter(group => group.names.length > 0);
    }
    return this.optionsToFilterByGroups;
  }
  /**
   *
   * @param filter {string} filter to remove from event option list
   */
  removeItemFromFilter(filter: any) {
    this.filtersApplied = this.filtersApplied.filter(e => e !== filter);
    this.filtersUpdated.emit(this.filtersApplied);
  }

  /**
   *
   * @param filter { string } filter to apply at event list options.
   */
  onNewFilterAdded(filter: any){
    const filterToApply = filter.source.value;
    this.filterInput.nativeElement.value = '';
    if (!this.filtersApplied.includes(filterToApply)){
      this.filtersApplied.push(filter.source.value);
      this.filtersUpdated.emit(this.filtersApplied);
    }
  }
  /**
   *
   * @param optionsInGroup
   */
  allOptionInGroupAreApplied(optionsInGroup: string[]){
    return optionsInGroup.filter(e => !this.filtersApplied.includes(e)).length === 0;
  }
}
