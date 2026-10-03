import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DailyTotals } from '../daily-totals/daily-totals';
import { ApiError, CATEGORIES, DailyTotal, Formula, Order, Product } from '../../models';
import { OrderService } from '../../services/order.service';
import { CatalogService } from '../../services/catalog.service';
import { NoteService } from '../../services/note.service';
import { EurosPipe } from '../../shared/euros.pipe';
import { FormulaPicker, FormulaSelection } from '../formula-picker/formula-picker';
import { NotePanel } from '../note-panel/note-panel';
import { ProductCard } from '../product-card/product-card';
import { AdminService } from '../../services/admin.service';

@Component({
  imports: [ProductCard, NotePanel, FormulaPicker, DailyTotals, EurosPipe],
  selector: 'app-caisse-page',
  styleUrl: './caisse-page.css',
  templateUrl: './caisse-page.html',
})
export class CaissePage {
  private readonly catalog = inject(CatalogService);
  private readonly orderService = inject(OrderService);
  readonly note = inject(NoteService);
  private readonly auth = inject(AuthService);
  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);

  readonly categories = CATEGORIES;
  readonly products = signal<Product[]>([]);
  readonly formulas = signal<Formula[]>([]);
  readonly dailyTotals = signal<DailyTotal[]>([]);

  readonly todayTotal = computed(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return this.dailyTotals().find((dailyTotal) => dailyTotal.day === today)?.total ?? 0;
  });

  readonly selectedFormula = signal<Formula | null>(null);
  readonly paymentInProgress = signal(false);
  readonly paymentMessage = signal('');
  readonly paymentError = signal('');
  readonly lastPaidOrder = signal<Order | null>(null);

  constructor() {
    this.loadProducts();
    this.loadDailyTotals();

    this.catalog.getFormulas().subscribe((formulas) => {
      this.formulas.set(formulas);
    });
  }

  productsByCategory(category: Product['category']): Product[] {
    return this.products().filter((product) => product.category === category);
  }

  availableStock(product: Product): number {
    const quantityInNote = this.note.quantitiesByProduct().get(product.id) ?? 0;

    return Math.max(0, product.stock - quantityInNote);
  }

  isFormulaAvailable(formula: Formula): boolean {
    const hasMain = this.products().some(
      (product) => product.category === formula.mainCategory && this.availableStock(product) > 0,
    );

    const hasDrink = this.products().some(
      (product) => product.category === 'BOISSON' && this.availableStock(product) > 0,
    );

    const hasDessert = this.products().some(
      (product) => product.category === 'DESSERT' && this.availableStock(product) > 0,
    );

    return hasMain && hasDrink && hasDessert;
  }

  openFormula(formula: Formula): void {
    if (this.isFormulaAvailable(formula)) {
      this.selectedFormula.set(formula);
    }
  }

  closeFormula(): void {
    this.selectedFormula.set(null);
  }

  addFormula(selection: FormulaSelection): void {
    this.note.addFormula(selection.formula, selection.main, selection.drink, selection.dessert);

    this.closeFormula();
  }
  private loadProducts(): void {
    this.catalog.getProducts().subscribe((products) => {
      this.products.set(products);
    });
  }

  private loadDailyTotals(): void {
    this.orderService.getDailyTotals().subscribe((totals) => {
      this.dailyTotals.set(totals);
    });
  }

  reset(): void {
    this.admin.reset().subscribe(() => {
      window.location.reload();
    });
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.note.clear();
      this.router.navigate(['/login']);
    });
  }

  pay(): void {
    if (this.note.lines().length === 0 || this.paymentInProgress()) {
      return;
    }

    this.paymentInProgress.set(true);
    this.paymentMessage.set('');
    this.paymentError.set('');

    this.orderService.pay(this.note.toOrderRequest()).subscribe({
      next: (order: Order) => {
        this.lastPaidOrder.set(order);
        this.paymentMessage.set(
          `Note n°${order.id} payée : ${(order.total / 100).toFixed(2).replace('.', ',')} €`,
        );
        setTimeout(() => {
          this.paymentMessage.set('');
        }, 3000);

        this.note.clear();
        this.loadProducts();
        this.loadDailyTotals();
        this.paymentInProgress.set(false);
      },

      error: (error: HttpErrorResponse) => {
        const apiError = error.error as ApiError | null;

        this.paymentError.set(apiError?.message ?? 'Une erreur est survenue pendant le paiement.');

        this.loadProducts();
        this.paymentInProgress.set(false);
      },
    });
  }
}
