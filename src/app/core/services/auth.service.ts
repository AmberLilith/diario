import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Session } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _session = signal<Session | null>(null);
  private _ready = signal(false);

  readonly user = computed(() => this._session()?.user ?? null);
  readonly isLoggedIn = computed(() => !!this._session());
  readonly ready = computed(() => this._ready());

  constructor(private supabase: SupabaseService, private router: Router) {
    this.supabase.client.auth.getSession().then((result: { data: { session: Session | null } }) => {
      this._session.set(result.data.session);
      this._ready.set(true);  // ← marca como pronto após verificar sessão
    });

    this.supabase.client.auth.onAuthStateChange((_: any, session: Session | null) => {
      this._session.set(session);
      if (!session && this._ready()) this.router.navigate(['/auth/login']);
    });
  }

  async signUp(email: string, password: string) {
    const { error } = await this.supabase.client.auth.signUp({ email, password });
    if (error) throw error;
  }

  async signIn(email: string, password: string) {
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.router.navigate(['/entries']);
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
  }

  getUserId(): string {
    const id = this.user()?.id;
    if (!id) throw new Error('Usuário não autenticado');
    return id;
  }

  // Aguarda a sessão ser verificada
  waitForReady(): Promise<void> {
    return new Promise(resolve => {
      if (this._ready()) {
        resolve();
        return;
      }
      const interval = setInterval(() => {
        if (this._ready()) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }
}