import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { API_URL } from '../api';
import { Formula, Product } from '../models';

@Service()
export class CatalogService {
  private readonly http = inject(HttpClient);

  getProducts() {
    return this.http.get<Product[]>(`${API_URL}/products`);
  }

  getFormulas() {
    return this.http.get<Formula[]>(`${API_URL}/formulas`);
  }
}
