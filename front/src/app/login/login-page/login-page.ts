import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login-page',
  styleUrl: './login-page.css',
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorMessage = signal('');

  readonly form = this.fb.group({
    login: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.errorMessage.set('');

    const { login, password } = this.form.getRawValue();

    this.auth.login(login, password).subscribe({
      next: () => {
        this.router.navigate(['/caisse']);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.errorMessage.set('Identifiant ou mot de passe incorrect');
        } else {
          this.errorMessage.set('Serveur indisponible');
        }
      },
    });
  }
}
