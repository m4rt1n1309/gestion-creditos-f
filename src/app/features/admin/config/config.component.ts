import { Component } from '@angular/core';
import { CompanyConfigComponent } from './company/company-config.component';
import { NotificationsConfigComponent } from './notifications/notifications-config.component';
import { RatesConfigComponent } from './rates/rates-config.component';
import { UsersConfigComponent } from './users/users-config.component';

type ConfigTab = 'empresa' | 'tasas' | 'usuarios' | 'notificaciones';

interface TabItem {
  id: ConfigTab;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CompanyConfigComponent,
    RatesConfigComponent,
    UsersConfigComponent,
    NotificationsConfigComponent,
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
})
export class ConfigComponent {
  activeTab: ConfigTab = 'empresa';

  tabs: TabItem[] = [
    { id: 'empresa', label: 'Empresa', icon: 'pi pi-building' },
    { id: 'tasas', label: 'Tasas', icon: 'pi pi-percentage' },
    { id: 'usuarios', label: 'Usuarios', icon: 'pi pi-users' },
    { id: 'notificaciones', label: 'Notificaciones', icon: 'pi pi-bell' },
  ];

  get activeTabLabel(): string {
    return this.tabs.find(t => t.id === this.activeTab)?.label ?? '';
  }

  setTab(tab: ConfigTab): void {
    this.activeTab = tab;
  }
}
