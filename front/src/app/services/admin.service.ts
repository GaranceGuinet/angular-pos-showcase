import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';

import { API_URL } from '../api';

@Service()
export class AdminService {
  private readonly http = inject(HttpClient);

  reset() {
    return this.http.post(`${API_URL}/reset`, {});
  }
}
