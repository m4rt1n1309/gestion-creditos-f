import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-temp-password-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, TooltipModule],
  templateUrl: './temp-password-dialog.component.html',
})
export class TempPasswordDialogComponent {
  @Input() visible = false;
  @Input() password = '';
  @Output() closed = new EventEmitter<void>();

  copySuccess = false;

  /**
   * Copia la contraseña temporal al portapapeles y muestra un mensaje de éxito. Utiliza la API de portapapeles del navegador para realizar la copia. Si la copia es exitosa, se establece el estado `copySuccess` en `true` para mostrar un mensaje de confirmación al usuario.
   */
  copy(): void {
    navigator.clipboard.writeText(this.password).then(() => {
      this.copySuccess = true;
    });
  }

  /**
   * Maneja el cierre del diálogo. Restablece el estado de éxito de la copia y emite un evento para notificar al componente padre que el diálogo ha sido cerrado. Esto permite al componente padre realizar cualquier acción necesaria después de que el usuario haya cerrado el diálogo, como refrescar datos o actualizar la interfaz de usuario.
   * @returns
   */
  confirm(): void {
    this.copySuccess = false;
    this.closed.emit();
  }
}
