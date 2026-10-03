import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Formula, Product } from '../models';
import { NoteService } from './note.service';

describe('NoteService', () => {
  let service: NoteService;

  const burger: Product = {
    id: 1,
    name: 'Classic Burger',
    category: 'BURGER',
    price: 850,
    stock: 3,
  };

  const drink: Product = {
    id: 2,
    name: 'Limonade',
    category: 'BOISSON',
    price: 250,
    stock: 3,
  };

  const dessert: Product = {
    id: 3,
    name: 'Brownie',
    category: 'DESSERT',
    price: 350,
    stock: 3,
  };

  const burgerFormula: Formula = {
    id: 1,
    name: 'Formule Burger',
    mainCategory: 'BURGER',
    price: 1350,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NoteService],
    });

    service = TestBed.inject(NoteService);
  });

  it('should start with an empty note', () => {
    expect(service.lines()).toEqual([]);
    expect(service.total()).toBe(0);
  });

  it('should add a product to the note', () => {
    service.addProduct(burger);

    expect(service.lines().length).toBe(1);
    expect(service.lines()[0]).toEqual({
      kind: 'product',
      product: burger,
      quantity: 1,
    });
    expect(service.total()).toBe(850);
  });

  it('should increase the quantity when the same product is added twice', () => {
    service.addProduct(burger);
    service.addProduct(burger);

    const line = service.lines()[0];

    expect(line.kind).toBe('product');

    if (line.kind === 'product') {
      expect(line.quantity).toBe(2);
    }

    expect(service.total()).toBe(1700);
  });

  it('should not add more products than available stock', () => {
    service.addProduct(burger);
    service.addProduct(burger);
    service.addProduct(burger);
    service.addProduct(burger);

    expect(service.quantitiesByProduct().get(burger.id)).toBe(3);
    expect(service.total()).toBe(2550);
  });

  it('should decrease a product quantity and remove the line at zero', () => {
    service.addProduct(burger);
    service.addProduct(burger);

    service.decreaseProduct(burger.id);

    const line = service.lines()[0];

    expect(line.kind).toBe('product');

    if (line.kind === 'product') {
      expect(line.quantity).toBe(1);
    }

    service.decreaseProduct(burger.id);

    expect(service.lines()).toEqual([]);
  });

  it('should remove a product line', () => {
    service.addProduct(burger);
    service.addProduct(drink);

    service.removeProduct(burger.id);

    expect(service.lines().length).toBe(1);
    expect(service.quantitiesByProduct().has(burger.id)).toBe(false);
    expect(service.quantitiesByProduct().get(drink.id)).toBe(1);
  });

  it('should clear the note', () => {
    service.addProduct(burger);
    service.addProduct(drink);

    service.clear();

    expect(service.lines()).toEqual([]);
    expect(service.total()).toBe(0);
    expect(service.quantitiesByProduct().size).toBe(0);
  });

  it('should add a valid formula and reserve its three products', () => {
    service.addFormula(burgerFormula, burger, drink, dessert);

    expect(service.lines().length).toBe(1);
    expect(service.total()).toBe(1350);

    expect(service.quantitiesByProduct().get(burger.id)).toBe(1);
    expect(service.quantitiesByProduct().get(drink.id)).toBe(1);
    expect(service.quantitiesByProduct().get(dessert.id)).toBe(1);
  });

  it('should reject a formula with incompatible product categories', () => {
    service.addFormula(burgerFormula, drink, burger, dessert);

    expect(service.lines()).toEqual([]);
    expect(service.total()).toBe(0);
  });

  it('should reject a formula when one of its products has no available stock', () => {
    const unavailableDrink: Product = {
      ...drink,
      stock: 0,
    };

    service.addFormula(burgerFormula, burger, unavailableDrink, dessert);

    expect(service.lines()).toEqual([]);
  });

  it('should count products already reserved by a formula when checking stock', () => {
    const lastBurger: Product = {
      ...burger,
      stock: 1,
    };

    service.addFormula(burgerFormula, lastBurger, drink, dessert);
    service.addProduct(lastBurger);

    expect(service.lines().length).toBe(1);
    expect(service.quantitiesByProduct().get(lastBurger.id)).toBe(1);
  });

  it('should remove a formula', () => {
    service.addFormula(burgerFormula, burger, drink, dessert);

    const line = service.lines()[0];

    expect(line.kind).toBe('formula');

    if (line.kind === 'formula') {
      service.removeFormula(line);
    }

    expect(service.lines()).toEqual([]);
    expect(service.total()).toBe(0);
  });

  it('should convert the note to an OrderRequest', () => {
    service.addProduct(burger);
    service.addProduct(burger);
    service.addFormula(burgerFormula, burger, drink, dessert);

    expect(service.toOrderRequest()).toEqual({
      products: [
        {
          productId: burger.id,
          quantity: 2,
        },
      ],
      formulas: [
        {
          formulaId: burgerFormula.id,
          mainId: burger.id,
          drinkId: drink.id,
          dessertId: dessert.id,
        },
      ],
    });
  });
});
