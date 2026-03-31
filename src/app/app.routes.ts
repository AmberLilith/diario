import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./components/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'entries',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/entries/entries-list/entries-list.component')
            .then(m => m.EntriesListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/entries/entry-form/entry-form.component')
            .then(m => m.EntryFormComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/entries/entry-form/entry-form.component')
            .then(m => m.EntryFormComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/entries/entry-detail/entry-detail.component')
            .then(m => m.EntryDetailComponent),
      },
    ],
  },
  { path: '', redirectTo: 'entries', pathMatch: 'full' },
  { path: '**', redirectTo: 'entries' },
];