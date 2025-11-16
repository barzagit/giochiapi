import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PanelService {
  private openSubject = new BehaviorSubject<boolean>(false);
  panelOpen$ = this.openSubject.asObservable();

  toggle(): void {
    this.openSubject.next(!this.openSubject.getValue());
  }

  open(): void {
    this.openSubject.next(true);
  }

  close(): void {
    this.openSubject.next(false);
  }
}
