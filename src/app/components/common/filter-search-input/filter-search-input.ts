import { Component, input, output } from '@angular/core';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'filter-search-input',
  imports: [HlmInputImports, HlmLabelImports, NgIcon],
  providers: [provideIcons({ lucideSearch })],
  templateUrl: './filter-search-input.html',
  styleUrl: './filter-search-input.css',
})
export class FilterSearchInput {
  // Inputs
  fieldName = input.required<string>();
  value = input.required<string | null>();
  placeholder = input<string>('Szukaj...');

  // Outputs
  onValueChange = output<string>();

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.onValueChange.emit(value);
      });
  }

  protected onChange(value: string) {
    this.searchSubject.next(value);
  }
}
