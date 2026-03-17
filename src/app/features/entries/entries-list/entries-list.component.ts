import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Entry } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { EntriesService } from '../../../core/services/entries.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-entries-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatMenuModule, MatSnackBarModule,
    MatTooltipModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './entries-list.component.html',
  styleUrl: './entries-list.component.css'
})
export class EntriesListComponent implements OnInit, OnDestroy {
  private entriesService = inject(EntriesService);
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  private realtimeChannel: any = null;

  entries = signal<Entry[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);

  filteredEntries = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const from = this.dateFrom();
    const to = this.dateTo();

    return this.entries().filter(entry => {
      if (term) {
        const div = document.createElement('div');
        div.innerHTML = entry.content;
        const text = (div.textContent || div.innerText || '').toLowerCase();
        const emotionLabel = entry.emotion?.label.toLowerCase() ?? '';
        if (!text.includes(term) && !emotionLabel.includes(term)) return false;
      }

      const entryDate = new Date(entry.created_at);
      if (from) {
        const fromStart = new Date(from);
        fromStart.setHours(0, 0, 0, 0);
        if (entryDate < fromStart) return false;
      }
      if (to) {
        const toEnd = new Date(to);
        toEnd.setHours(23, 59, 59, 999);
        if (entryDate > toEnd) return false;
      }

      return true;
    });
  });

  hasActiveFilters = computed(() =>
    !!this.searchTerm() || !!this.dateFrom() || !!this.dateTo()
  );

  async ngOnInit() {
    try {
      const data = await this.entriesService.getAll();
      this.entries.set(data);
    } catch (err: any) {
      this.snackBar.open('Erro ao carregar relatos', 'Fechar', { duration: 4000 });
    } finally {
      this.loading.set(false);
    }

    this.subscribeRealtime();
  }

  ngOnDestroy() {
    if (this.realtimeChannel) {
      this.supabase.client.removeChannel(this.realtimeChannel);
    }
  }

  private subscribeRealtime() {
    this.realtimeChannel = this.supabase.client
      .channel('entries-realtime')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'entries' },
        async (payload: any) => {
          if (payload.eventType === 'INSERT') {
            // Busca o relato completo com emotion e photos
            const entry = await this.entriesService.getById(payload.new.id);
            this.entries.update(list => [entry, ...list]);
          } else if (payload.eventType === 'UPDATE') {
            const entry = await this.entriesService.getById(payload.new.id);
            this.entries.update(list =>
              list.map(e => e.id === entry.id ? entry : e)
            );
          } else if (payload.eventType === 'DELETE') {
            this.entries.update(list =>
              list.filter(e => e.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
  }

  onSearch(term: string) { this.searchTerm.set(term); }
  onDateFrom(date: Date | null) { this.dateFrom.set(date); }
  onDateTo(date: Date | null) { this.dateTo.set(date); }

  clearFilters() {
    this.searchTerm.set('');
    this.dateFrom.set(null);
    this.dateTo.set(null);
  }

  newEntry() { this.router.navigate(['/entries/new']); }
  viewEntry(e: Entry) { this.router.navigate(['/entries', e.id]); }
  editEntry(e: Entry) { this.router.navigate(['/entries', e.id, 'edit']); }

  async deleteEntry(entry: Entry) {
    if (!confirm('Excluir este relato?')) return;
    try {
      await this.entriesService.delete(entry.id);
      this.entries.update(list => list.filter(e => e.id !== entry.id));
      this.snackBar.open('Relato excluído', '', { duration: 3000 });
    } catch (err: any) {
      this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 4000 });
    }
  }

  async signOut() { await this.authService.signOut(); }

  getPreview(content: string): string {
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || div.innerText || '';
    return text.length > 140 ? text.slice(0, 140) + '…' : text;
  }

  getFirstImage(content: string): string | null {
    console.log(content)
    const div = document.createElement('div');
    div.innerHTML = content;
    const img = div.querySelector('img');
    return img ? img.src : null;
  }

  getImages(content: string): HTMLImageElement[] | null {
  const div = document.createElement('div');
  div.innerHTML = content;  
  const imgs = div.querySelectorAll('img');
  return imgs.length > 0 ? Array.from(imgs) : null;
}
}