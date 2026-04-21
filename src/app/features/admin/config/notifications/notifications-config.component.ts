import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';

interface NotifSetting {
  id: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-notifications-config',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputSwitchModule],
  templateUrl: './notifications-config.component.html',
})
export class NotificationsConfigComponent {
  settings: NotifSetting[] = [
    {
      id: 'mora',
      label: 'Alertas de mora',
      description: 'Notificar cuando un crédito entra en período de mora',
      icon: 'pi pi-exclamation-triangle',
      enabled: true,
    },
    {
      id: 'vencimiento',
      label: 'Vencimiento de cuotas',
      description: 'Recordatorio 3 días antes del vencimiento de cuotas',
      icon: 'pi pi-calendar',
      enabled: true,
    },
    {
      id: 'aprobacion',
      label: 'Solicitudes de aprobación',
      description: 'Notificar nuevas solicitudes pendientes de aprobación',
      icon: 'pi pi-check-square',
      enabled: true,
    },
    {
      id: 'caja',
      label: 'Cierre de caja',
      description: 'Recordatorio diario para el cierre de caja',
      icon: 'pi pi-wallet',
      enabled: true,
    },
    {
      id: 'nuevo_cliente',
      label: 'Nuevo cliente registrado',
      description: 'Notificar al admin cuando se registra un nuevo cliente',
      icon: 'pi pi-user-plus',
      enabled: false,
    },
    {
      id: 'informe',
      label: 'Informes automáticos',
      description: 'Enviar resumen semanal de operaciones por email',
      icon: 'pi pi-chart-bar',
      enabled: false,
    },
  ];

  save(): void {
    console.log('Guardando configuración de notificaciones');
  }
}
