import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  @Input() message = 'No se encontraron resultados.';
}
