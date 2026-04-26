import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [],
  templateUrl: './loading-state.component.html',
})
export class LoadingStateComponent {
  @Input() message = 'Cargando…';
}
