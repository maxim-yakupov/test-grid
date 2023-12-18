import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

export interface ColumnDefinition<T> {
  name: string;
  title: string;
  getCellValue: (item: T) => string;
  action?: (item: T) => Observable<void>;
}

type ActionState = 'started' | 'finished' | 'failed';

@Component({
  selector: 'app-grid-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridListViewComponent<T> {
  @Input() colDefs: ColumnDefinition<T>[] = [];
  @Input() data?: T[];
  @Output() actionStateChanged = new EventEmitter<ActionState>();

  protected performAction(colDef: ColumnDefinition<T>, item: T) {
    this.actionStateChanged.emit('started');
    if (colDef.action) {
      colDef.action(item).subscribe({
        next: () => this.actionStateChanged.emit('finished'),
        error: () => this.actionStateChanged.emit('failed'),
      });
    }
  }
}
