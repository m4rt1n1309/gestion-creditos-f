import { Component } from '@angular/core';
import { CompanyConfigComponent } from './company/company-config.component';
import { ConfigTab, TabItem } from './models/system-config.model';
import { NotificationsConfigComponent } from './notifications/notifications-config.component';
import { ProductRatesConfigComponent } from './product-rates/product-rates-config.component';
import { InterestRatesConfigComponent } from './rates/interest-rates-config.component';
import { SystemParamsConfigComponent } from './system-params/system-params-config.component';
import { UsersConfigComponent } from './users/users-config.component';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CompanyConfigComponent,
    InterestRatesConfigComponent,
    ProductRatesConfigComponent,
    SystemParamsConfigComponent,
    UsersConfigComponent,
    NotificationsConfigComponent,
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
})
export class ConfigComponent {
  activeTab: ConfigTab = 'tasas';

  tabs: TabItem[] = [
    { id: 'tasas', label: 'Tasas de interés', icon: 'pi pi-percentage' },
    { id: 'tasas-producto', label: 'Tasas por producto', icon: 'pi pi-tag' },
    {
      id: 'parametros',
      label: 'Parámetros del sistema',
      icon: 'pi pi-sliders-h',
    },
    { id: 'empresa', label: 'Empresa', icon: 'pi pi-building' },
    { id: 'usuarios', label: 'Usuarios', icon: 'pi pi-users' },
    { id: 'notificaciones', label: 'Notificaciones', icon: 'pi pi-bell' },
  ];

  /**
   * Devuelve la etiqueta de la pestaña activa, buscando en el arreglo `tabs` el objeto cuya propiedad `id` coincide con `activeTab` y retornando su propiedad `label`. Si no se encuentra ningún objeto con el ID activo, devuelve una cadena vacía. Esta función se utiliza para mostrar el título o etiqueta correspondiente a la pestaña que el usuario tiene actualmente seleccionada en la interfaz de configuración.
   */
  get activeTabLabel(): string {
    return this.tabs.find((t) => t.id === this.activeTab)?.label ?? '';
  }

  /**
   * Establece la pestaña activa.
   * @param tab
   */
  setTab(tab: ConfigTab): void {
    this.activeTab = tab;
  }
}
