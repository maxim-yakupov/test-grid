import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-grid-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss']
})
export class GridCardViewComponent<T> {
  @Input() data?: T[];
}
