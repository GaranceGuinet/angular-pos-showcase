import { Service, computed, signal } from '@angular/core';

import { Formula, OrderRequest, Product } from '../models';

export interface ProductLine {
  kind: 'product';
  product: Product;
  quantity: number;
}

export interface FormulaLine {
  kind: 'formula';
  formula: Formula;
  main: Product;
  drink: Product;
  dessert: Product;
}

export type NoteLine = ProductLine | FormulaLine;

@Service()
export class NoteService {
  private readonly _lines = signal<NoteLine[]>([]);

  readonly lines = this._lines.asReadonly();

  readonly quantitiesByProduct = computed(() => {
    const quantities = new Map<number, number>();

    const addQuantity = (productId: number, quantity: number): void => {
      const currentQuantity = quantities.get(productId) ?? 0;
      quantities.set(productId, currentQuantity + quantity);
    };

    for (const line of this._lines()) {
      if (line.kind === 'product') {
        addQuantity(line.product.id, line.quantity);
      } else {
        addQuantity(line.main.id, 1);
        addQuantity(line.drink.id, 1);
        addQuantity(line.dessert.id, 1);
      }
    }

    return quantities;
  });

  readonly total = computed(() =>
    this._lines().reduce((sum, line) => {
      if (line.kind === 'product') {
        return sum + line.product.price * line.quantity;
      }

      return sum + line.formula.price;
    }, 0),
  );

  addProduct(product: Product): void {
    const reservedQuantity = this.quantitiesByProduct().get(product.id) ?? 0;

    if (reservedQuantity >= product.stock) {
      return;
    }

    const existingLine = this._lines().find(
      (line): line is ProductLine => line.kind === 'product' && line.product.id === product.id,
    );

    if (existingLine) {
      this._lines.update((lines) =>
        lines.map((line) =>
          line.kind === 'product' && line.product.id === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        ),
      );
      return;
    }

    this._lines.update((lines) => [
      ...lines,
      {
        kind: 'product',
        product,
        quantity: 1,
      },
    ]);
  }

  addFormula(formula: Formula, main: Product, drink: Product, dessert: Product): void {
    if (
      main.category !== formula.mainCategory ||
      drink.category !== 'BOISSON' ||
      dessert.category !== 'DESSERT'
    ) {
      return;
    }
    const products = [main, drink, dessert];

    const hasUnavailableProduct = products.some((product) => {
      const reservedQuantity = this.quantitiesByProduct().get(product.id) ?? 0;

      return reservedQuantity >= product.stock;
    });

    if (hasUnavailableProduct) {
      return;
    }

    this._lines.update((lines) => [
      ...lines,
      {
        kind: 'formula',
        formula,
        main,
        drink,
        dessert,
      },
    ]);
  }

  decreaseProduct(productId: number): void {
    this._lines.update((lines) =>
      lines
        .map((line) =>
          line.kind === 'product' && line.product.id === productId
            ? { ...line, quantity: line.quantity - 1 }
            : line,
        )
        .filter((line) => line.kind === 'formula' || line.quantity > 0),
    );
  }

  removeProduct(productId: number): void {
    this._lines.update((lines) =>
      lines.filter((line) => line.kind === 'formula' || line.product.id !== productId),
    );
  }

  removeFormula(lineToRemove: FormulaLine): void {
    this._lines.update((lines) => lines.filter((line) => line !== lineToRemove));
  }

  toOrderRequest(): OrderRequest {
    return {
      products: this._lines()
        .filter((line): line is ProductLine => line.kind === 'product')
        .map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),

      formulas: this._lines()
        .filter((line): line is FormulaLine => line.kind === 'formula')
        .map((line) => ({
          formulaId: line.formula.id,
          mainId: line.main.id,
          drinkId: line.drink.id,
          dessertId: line.dessert.id,
        })),
    };
  }

  clear(): void {
    this._lines.set([]);
  }
}
