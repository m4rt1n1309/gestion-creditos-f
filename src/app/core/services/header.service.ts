import { Injectable, signal } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

export interface HeaderAction {
  label: string;
  icon?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  outlined?: boolean;
  styleClass?: string;
  action: () => void;
}

@Injectable({ providedIn: 'root' })
export class HeaderService {
  readonly breadcrumbs = signal<BreadcrumbItem[]>([{ label: 'Dashboard' }]);
  readonly actions = signal<HeaderAction[]>([]);
  readonly pageTitle = signal<string | null>(null);

  set(breadcrumbs: BreadcrumbItem[], actions: HeaderAction[] = []): void {
    this.breadcrumbs.set(breadcrumbs);
    this.actions.set(actions);
    this.pageTitle.set(null);
  }

  setTitle(title: string): void {
    this.pageTitle.set(title);
  }

  reset(): void {
    this.breadcrumbs.set([{ label: 'Dashboard' }]);
    this.actions.set([]);
    this.pageTitle.set(null);
  }
}
