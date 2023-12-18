import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataSource } from './data-source.model';
import { ColumnDefinition } from './list-view/list-view.component';
import { Subject, Subscription, debounceTime, map } from 'rxjs';

type GridViewModeOptions = 'card' | 'list';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent<T> implements OnInit, OnDestroy {
  @Input() dataSource?: DataSource<T>;
  @Input() colDefs: ColumnDefinition<T>[] = [];
  @Input() viewMode: GridViewModeOptions = 'list';
  @Input() data?: T[];

  protected searchFieldUpdate$ = new Subject<any>();
  protected pageSizes = [5, 10, 20];

  protected totalCount = 0;
  protected pageNumber = 0;
  protected pageSize = 10;
  protected query?: string;

  protected modalInfoText?: string;

  private modalInfoAutoHideTimer?: number;
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.refresh();

    this.subscriptions.push(
      this.searchFieldUpdate$.pipe(
        debounceTime(300),
        map(event => event.target),
      ).subscribe((input : HTMLInputElement) => this.search(input.value))
    );
  }

  /** Since I'm apparently using not the latest version of Angular,
   * I haven't cool takeUntilDestroyed operator,
   * so have to unsubscribe manually */
  ngOnDestroy(): void {
    this.subscriptions.forEach(subs => subs.unsubscribe());
  }

  previousPage() {
    console.log('Prev page');
    this.pageNumber--;
    this.refresh();
  }

  nextPage() {
    console.log('Next page');
    this.pageNumber++;
    this.refresh();
  }

  changePageSize(event: any) {
    const newPageSize = Number.parseInt(event.target?.value ?? 0);
    console.log('New page size:', newPageSize);
    this.pageSize = newPageSize;
    this.refresh();
  }

  search(query: string) {
    console.log('Search for:', query);
    this.query = query;
    this.refresh();
  }

  protected processActionState(actionState: string) {
    console.log(actionState);
    switch (actionState) {
      case 'started':
        this.toggleModalInfo('Выполняется действие...', true);
        break;
      case 'failed':
        this.toggleModalInfo('Произошла ошибка, действие не сработало', true);
        break;
      default:
        this.toggleModalInfo();
        this.refresh();
        break;
    }
  }

  private toggleModalInfo(text?: string, shouldAutoHide?: boolean) {
    if (this.modalInfoAutoHideTimer) {
      clearTimeout(this.modalInfoAutoHideTimer);
    }
    this.modalInfoText = text;
   if (shouldAutoHide) {
      this.modalInfoAutoHideTimer = window.setTimeout(() => this.toggleModalInfo(), 3000);
    }
  }

  private refresh() {
    this.updateData(this.pageNumber, this.pageSize, this.query);
  }

  private updateData(pageNumber: number, pageSize: number, query?: string) {
    this.toggleModalInfo('Загрузка...');

    this.dataSource?.getData({
      itemsPerPage: pageSize,
      pageNumber: pageNumber,
      search: query,
      onLoad: (data) => {
        this.data = data.data;
        this.totalCount = data.total;
        this.toggleModalInfo();
      },
      onFail: (err) => {
        this.data = undefined;
        this.totalCount = 0;
        this.toggleModalInfo(err.message, true);
      },
    });
  }
}
