import { Injectable, inject } from '@angular/core';
import { DateService } from './date.service';

@Injectable({ providedIn: 'root' })
export class FormatService {
  private readonly date = inject(DateService);

  currency(value: number | null | undefined, decimals: 0 | 2 = 0): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  percent(value: number | null | undefined, decimals = 2): string {
    if (value == null) return '—';
    return `${(value * 100).toFixed(decimals).replace('.', ',')}%`;
  }

  number(value: number | null | undefined, decimals = 0): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  shortDate(value: string | Date | null | undefined): string {
    return this.date.display(value, 'dd/MM/yyyy');
  }

  longDate(value: string | Date | null | undefined): string {
    return this.date.display(value, "EEEE d 'de' MMMM yyyy");
  }
}
