import { Component, Input } from '@angular/core';
import { UserDto, UsersApi } from '../services/users.api';
import { ModalNotificatorService } from '../grid/modal-notificator.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent {
  @Input() user!: UserDto;
  
  constructor(private userApi: UsersApi, private mns: ModalNotificatorService) {
  }

  remove() {
    this.mns.actionState$.next('operation_started');
    this.userApi.remove(this.user.id).subscribe({
      next: () => this.mns.actionState$.next('operation_finished'),
      error: () => this.mns.actionState$.next('operation_failed'),
    });
  }
}
