import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export type ActionState = 'data_loading' | 'data_loaded' | 'data_failed' |
    'operation_started' | 'operation_finished' | 'operation_failed';

@Injectable()
export class ModalNotificatorService {
    actionState$ = new Subject<ActionState>();
}