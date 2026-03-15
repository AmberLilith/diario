import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <mat-icon class="auth-icon">menu_book</mat-icon>
          <h1>Diário de Vivências</h1>
          <p>Guarde seus momentos especiais</p>
        </div>

        <mat-tab-group animationDuration="200ms">

          <mat-tab label="Entrar">
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>E-mail</mat-label>
                <input matInput type="email" formControlName="email">
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Senha</mat-label>
                <input matInput [type]="showPass() ? 'text' : 'password'" formControlName="password">
                <button type="button" mat-icon-button matSuffix (click)="showPass.set(!showPass())">
                  <mat-icon>{{ showPass() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <button
                type="submit"
                mat-flat-button
                color="primary"
                class="full-width submit-btn"
                [disabled]="loading() || loginForm.invalid">
                @if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
                @else { Entrar }
              </button>
            </form>
          </mat-tab>

          <mat-tab label="Criar conta">
            <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>E-mail</mat-label>
                <input matInput type="email" formControlName="email">
                <mat-icon matSuffix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Senha</mat-label>
                <input matInput [type]="showPass() ? 'text' : 'password'" formControlName="password">
                <mat-hint>Mínimo 6 caracteres</mat-hint>
                <button type="button" mat-icon-button matSuffix (click)="showPass.set(!showPass())">
                  <mat-icon>{{ showPass() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <button
                type="submit"
                mat-flat-button
                color="primary"
                class="full-width submit-btn"
                [disabled]="loading() || registerForm.invalid">
                @if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
                @else { Criar conta }
              </button>
            </form>
          </mat-tab>

        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: var(--mat-sys-surface-variant);
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      background: var(--mat-sys-surface);
      border-radius: 16px;
      padding: 32px 24px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .auth-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mat-sys-primary);
    }
    .auth-header h1 { font-size: 22px; font-weight: 600; margin: 8px 0 4px; }
    .auth-header p { color: var(--mat-sys-on-surface-variant); margin: 0; font-size: 14px; }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 20px 0 8px;
    }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; margin-top: 8px; font-size: 16px; }
    mat-spinner { display: inline-block; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  loading = signal(false);
  showPass = signal(false);

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
    } catch (err: any) {
      this.snackBar.open('Erro ao criar conta: ' + err.message, 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}