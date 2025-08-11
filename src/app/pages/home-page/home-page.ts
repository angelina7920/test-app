import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutocompleteInput } from '../../shared/components/autocomplete-input/autocomplete-input';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { Openverse } from './models/openverse';
import { OpenverseCard } from './components/openverse-card/openverse-card';
import { Store } from '@ngrx/store';
import { OpenverseActions } from './store/openverse.actions';
import { OpenverseSelectors } from './store/openverse.selectors';
import { OpenverseState } from './store/openverse.reducers';
import { Dialog } from '@angular/cdk/dialog';
import { ImageDialog } from './components/image-dialog/image-dialog';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import { ScrollEndReached } from '../../shared/directives/scroll-end-reached';
import { REQUEST_DELAY } from '../../shared/constants/request-delay';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutocompleteInput,
    OpenverseCard,
    ScrollingModule,
    ScrollEndReached,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class HomePage implements OnInit {
  virtualScrollViewport = viewChild<CdkVirtualScrollViewport>('virtualScroll');

  searchControl = new FormControl<string>('');

  readonly itemSize = 400;

  private store = inject(Store<OpenverseState>);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(Dialog);

  searchOptions = toSignal(
    this.store.select(OpenverseSelectors.selectSearchKeywords),
    { initialValue: [] },
  );

  searchResults = toSignal(
    this.store.select(OpenverseSelectors.selectAllOpenverseItems),
    { initialValue: [] },
  );

  isLoading = toSignal(this.store.select(OpenverseSelectors.selectIsLoading), {
    initialValue: false,
  });

  hasMoreResults = toSignal(
    this.store.select(OpenverseSelectors.selectHasMoreResults),
    { initialValue: false },
  );

  searchValue = toSignal(this.searchControl.valueChanges);

  filteredSearchOptions = computed(() => {
    const query = (this.searchValue() ?? '').trim().toLowerCase();
    const options = this.searchOptions() ?? [];
    if (!query) {
      return options;
    }
    return options.filter((opt) => opt.toLowerCase().includes(query));
  });

  ngOnInit() {
    this.store.dispatch(OpenverseActions.getOpenverse());

    this.searchControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(REQUEST_DELAY),
        filter((query) => query !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((query) => {
        this.store.dispatch(OpenverseActions.addSearchQuery({ query }));
      });
  }

  onCardClick(item: Openverse): void {
    this.dialog.open(ImageDialog, {
      data: item,
    });
  }

  onScrollEnd(): void {
    if (this.hasMoreResults() && !this.isLoading()) {
      this.store.dispatch(OpenverseActions.loadMoreOpenverse());
      setTimeout(() => {
        const viewport = this.virtualScrollViewport();
        if (viewport) {
          viewport.checkViewportSize();
        }
      }, REQUEST_DELAY);
    }
  }
}
