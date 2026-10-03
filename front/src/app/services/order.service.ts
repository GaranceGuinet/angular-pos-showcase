import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { API_URL } from '../api';
import { DailyTotal, Order, OrderRequest } from '../models';

@Service()
export class OrderService {
  private readonly http = inject(HttpClient);

  pay(request: OrderRequest) {
    return this.http.post<Order>(`${API_URL}/orders`, request);
  }

  getDailyTotals() {
    return this.http.get<DailyTotal[]>(`${API_URL}/orders/daily-totals`);
  }
}
