import { Component, ContentChild, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DataSource } from './data-source.model';
import { ColumnDefinition } from './list-view/list-view.component';
import { Subject, Subscription, debounceTime, map } from 'rxjs';
import { ActionState, ModalNotificatorService } from './modal-notificator.service';

type GridViewModeOptions = 'card' | 'list';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  providers: [ModalNotificatorService],
})
export class GridComponent<T> implements OnInit, OnDestroy {
  @Input() dataSource?: DataSource<T>;
  @Input() colDefs: ColumnDefinition<T>[] = [];
  @Input() viewMode: GridViewModeOptions = 'list';
  @Input() data?: T[];
  @Input() pageSizes = [5, 10, 20, 100];
  @Input() pageSize = 10;

  @ContentChild('cardTemplate') cardTemplateRef: TemplateRef<any> | null = null;
  @ViewChild('search') searchInput: ElementRef | null = null;
  
  protected searchFieldUpdate$ = new Subject<any>();

  protected totalCount = 0;
  protected pageNumber = 0;
  protected query?: string;

  /** Text in modal block about current action performing.
   * Using also for disabling controls, since we should not allow requests
   * while message is being shown. */
  protected modalInfoText?: string;

  private modalInfoAutoHideTimer?: number;
  private subscriptions: Subscription[] = [];

  constructor(private modalNotificatorService: ModalNotificatorService) {}

  ngOnInit(): void {
    if (!this.pageSizes.includes(this.pageSize)) {
      const pageSize = this.pageSizes[0] ?? 1;
      console.warn(
        `Can't set [pageSize] of ${this.pageSize}, since it isn't available in [pageSizes].
        Setting to ${pageSize}.`);
      this.pageSize = pageSize;
    }

    this.subscriptions.push(
      this.modalNotificatorService.actionState$.subscribe(
        (state) => this.processActionState(state)),

      this.searchFieldUpdate$.pipe(
        debounceTime(500),
        map(event => event.target),
      ).subscribe((input : HTMLInputElement) => this.search(input.value))
    );

    this.callRefresh();
  }

  /** Since I'm apparently using not the latest version of Angular,
   * I haven't cool takeUntilDestroyed operator,
   * so have to unsubscribe manually */
  ngOnDestroy(): void {
    this.subscriptions.forEach(subs => subs.unsubscribe());

    if (this.modalInfoAutoHideTimer) {
      clearTimeout(this.modalInfoAutoHideTimer);
    }
  }

  previousPage() {
    this.pageNumber--;
    this.callRefresh();
  }

  nextPage() {
    this.pageNumber++;
    this.callRefresh();
  }

  changePageSize(event: any) {
    const newPageSize = Number.parseInt(event.target?.value ?? 0);
    this.pageSize = newPageSize;
    this.callRefresh();
  }

  search(query: string) {
    this.query = query;
    this.callRefresh();
  }

  protected processActionState(actionState: ActionState) {
    switch (actionState) {
      case 'data_loading':
        this.toggleModalInfo('Загрузка данных...');
        break;
      case 'data_loaded':
        this.toggleModalInfo();
        this.focusSearchField();
        break;
      case 'operation_started':
        this.toggleModalInfo('Выполняется операция...', true);
        break;
      case 'operation_finished':
        this.toggleModalInfo();
        this.callRefresh();
        break;
      case 'operation_failed':
      case 'data_failed':
        this.toggleModalInfo('Произошла ошибка, операция не выполнена', true);
        this.focusSearchField();
        break;
      default:
        console.warn(`Unknown action state '${actionState}'`);
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

  private callRefresh() {
    this.callDataUpdate(this.pageNumber, this.pageSize, this.query);
  }

  private callDataUpdate(pageNumber: number, pageSize: number, query?: string) {
    this.modalNotificatorService.actionState$.next('data_loading');

    this.dataSource?.getData({
      itemsPerPage: pageSize,
      pageNumber: pageNumber,
      search: query,
      onLoad: (data) => {
        this.data = data.data;
        this.totalCount = data.total;
        this.modalNotificatorService.actionState$.next('data_loaded');
      },
      onFail: (err) => {
        console.error(err);
        this.data = undefined;
        this.totalCount = 0;
        this.modalNotificatorService.actionState$.next('data_failed');
      },
    });
  }

  private focusSearchField() {
    setTimeout(() => {
       this.searchInput?.nativeElement?.focus();
     }, 0);
  }
}
