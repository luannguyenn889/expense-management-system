import { Pipe, PipeTransform } from '@angular/core';
import { formatCurrencyVnd } from '../../core/utils/currency-vnd.util';

@Pipe({
  name: 'currencyVnd',
  standalone: true,
})
export class CurrencyVndPipe implements PipeTransform {
  transform(amount: number | null | undefined): string {
    return formatCurrencyVnd(amount ?? 0);
  }
}
