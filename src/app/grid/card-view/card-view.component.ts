import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-grid-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridCardViewComponent<T> {
  @Input() data?: T[];
  @Input() cardTemplateRef: TemplateRef<any> | null = null;
}
