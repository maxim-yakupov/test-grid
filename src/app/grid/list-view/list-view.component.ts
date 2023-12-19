import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalNotificatorService } from '../modal-notificator.service';

export interface ColumnDefinition<T> {
  name: string;
  title: string;
  getCellValue: (item: T) => string;
  action?: (item: T) => Observable<void>;
}

@Component({
  selector: 'app-grid-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridListViewComponent<T> {
  @Input() colDefs: ColumnDefinition<T>[] = [];
  @Input() data?: T[];

  constructor(private mns: ModalNotificatorService) { }
  
  protected performAction(colDef: ColumnDefinition<T>, item: T) {
    this.mns.actionState$.next('operation_started');
    if (colDef.action) {
      colDef.action(item).subscribe({
        next: () => this.mns.actionState$.next('operation_finished'),
        error: () => this.mns.actionState$.next('operation_failed'),
      });
    }
  }
}
