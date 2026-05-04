import { Pipe, PipeTransform, inject } from '@angular/core';
import { FormatService } from '../services/format.service';

@Pipe({ name: 'percentArs', standalone: true })
export class PercentArsPipe implements PipeTransform {
  private readonly format = inject(FormatService);

  transform(value: number | null | undefined, decimals = 2): string {
    return this.format.percent(value, decimals);
  }
}
