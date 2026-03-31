import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatTabsModule,
    MatSnackBarModule,
  ],
  templateUrl: 'login.component.html',
  styleUrl: 'login.component.css'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  loading = signal(false);
  showPass = signal(false);

  selectedTab = 0;

  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onLogin() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    try {
      await this.auth.signIn(
        this.loginForm.value.email!,
        this.loginForm.value.password!
      );
    } catch (err: any) {
      this.snackBar.open('Credenciais inválidas', 'Fechar', { duration: 4000 });
    } finally {
      this.loading.set(false);
    }
  }

  async onRegister() {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    try {
      await this.auth.signUp(
        this.registerForm.value.email!,
        this.registerForm.value.password!
      );
      this.snackBar.open('Conta criada! Verifique seu e-mail.', '', { duration: 5000 });
      this.selectedTab = 0;
    } catch (err: any) {
      this.snackBar.open('Erro ao criar conta: ' + err.message, 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}