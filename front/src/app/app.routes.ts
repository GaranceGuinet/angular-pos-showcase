import { Routes } from '@angular/router';

import { loginGuard } from './auth/login-guard';
import { authGuard } from './auth/auth-guard';
import { CaissePage } from './caisse/caisse-page/caisse-page';
import { LoginPage } from './login/login-page/login-page';

export const routes: Routes = [
  { path: 'login', component: LoginPage, canActivate: [loginGuard] },
  {
    path: 'caisse',
    component: CaissePage,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'caisse', pathMatch: 'full' },
  { path: '**', redirectTo: 'caisse' },
];
