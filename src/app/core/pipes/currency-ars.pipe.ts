import { Pipe, PipeTransform, inject } from '@angular/core';
import { FormatService } from '../services/format.service';

@Pipe({ name: 'currencyArs', standalone: true })
export class CurrencyArsPipe implements PipeTransform {
  private readonly format = inject(FormatService);

  transform(value: number | null | undefined, decimals: 0 | 2 = 0): string {
    return this.format.currency(value, decimals);
  }
}
