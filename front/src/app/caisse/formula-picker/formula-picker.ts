import { Component, HostListener, computed, input, output, signal } from '@angular/core';

import { Formula, Product } from '../../models';
import { EurosPipe } from '../../shared/euros.pipe';

export interface FormulaSelection {
  formula: Formula;
  main: Product;
  drink: Product;
  dessert: Product;
}

@Component({
  imports: [EurosPipe],
  selector: 'app-formula-picker',
  styleUrl: './formula-picker.css',
  templateUrl: './formula-picker.html',
})
export class FormulaPicker {
  readonly formula = input.required<Formula>();
  readonly products = input.required<Product[]>();
  readonly quantitiesByProduct = input.required<Map<number, number>>();

  readonly formulaAdded = output<FormulaSelection>();
  readonly cancelled = output<void>();

  readonly selectedMain = signal<Product | null>(null);
  readonly selectedDrink = signal<Product | null>(null);
  readonly selectedDessert = signal<Product | null>(null);

  readonly mainProducts = computed(() =>
    this.products().filter((product) => product.category === this.formula().mainCategory),
  );

  readonly drinks = computed(() =>
    this.products().filter((product) => product.category === 'BOISSON'),
  );

  readonly desserts = computed(() =>
    this.products().filter((product) => product.category === 'DESSERT'),
  );

  readonly canAdd = computed(
    () =>
      this.selectedMain() !== null &&
      this.selectedDrink() !== null &&
      this.selectedDessert() !== null,
  );

  availableStock(product: Product): number {
    const reservedQuantity = this.quantitiesByProduct().get(product.id) ?? 0;

    return product.stock - reservedQuantity;
  }

  selectMain(product: Product): void {
    if (this.availableStock(product) > 0) {
      this.selectedMain.set(product);
    }
  }

  selectDrink(product: Product): void {
    if (this.availableStock(product) > 0) {
      this.selectedDrink.set(product);
    }
  }

  selectDessert(product: Product): void {
    if (this.availableStock(product) > 0) {
      this.selectedDessert.set(product);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancelled.emit();
  }

  addFormula(): void {
    const main = this.selectedMain();
    const drink = this.selectedDrink();
    const dessert = this.selectedDessert();

    if (!main || !drink || !dessert) {
      return;
    }

    if (
      this.availableStock(main) <= 0 ||
      this.availableStock(drink) <= 0 ||
      this.availableStock(dessert) <= 0
    ) {
      return;
    }

    this.formulaAdded.emit({
      formula: this.formula(),
      main,
      drink,
      dessert,
    });
  }
}
