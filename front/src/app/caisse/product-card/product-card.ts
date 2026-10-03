import { Component, computed, input, output } from '@angular/core';

import { CATEGORIES, Product } from '../../models';
import { EurosPipe } from '../../shared/euros.pipe';

@Component({
  imports: [EurosPipe],
  selector: 'app-product-card',
  styleUrl: './product-card.css',
  templateUrl: './product-card.html',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly availableStock = input.required<number>();

  readonly productClicked = output<Product>();

  readonly icon = computed(
    () => CATEGORIES.find((category) => category.code === this.product().category)?.icon ?? '',
  );

  onClick(): void {
    if (this.availableStock() > 0) {
      this.productClicked.emit(this.product());
    }
  }
}
