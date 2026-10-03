import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'euros',
})
export class EurosPipe implements PipeTransform {
  transform(value: number): string {
    return `${(value / 100).toFixed(2).replace('.', ',')} €`;
  }
}
