import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [],
  templateUrl: './error-state.component.html',
})
export class ErrorStateComponent {
  @Input() message = 'Ocurrió un error al cargar los datos.';
}
