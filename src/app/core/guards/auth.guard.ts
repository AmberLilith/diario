import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Espera a sessão ser verificada antes de decidir
  await auth.waitForReady();

  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/auth/login']);
};