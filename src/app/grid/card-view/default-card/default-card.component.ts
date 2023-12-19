import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-default-card',
  templateUrl: './default-card.component.html',
  styleUrls: ['./default-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultCardComponent {
  @Input() item!: Object;
}
