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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Entry } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { EntriesService } from '../../../core/services/entries-service/entries.service';
import { SupabaseService } from '../../../core/services/supabase-service/supabase.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-entries-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatProgressSpinnerModule, MatMenuModule, MatSnackBarModule,
    MatTooltipModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatPaginatorModule,
  ],
  templateUrl: './entries-list.component.html',
  styleUrl: './entries-list.component.css'
})
export class EntriesListComponent implements OnInit, OnDestroy {
   entriesService = inject(EntriesService);
  private authService = inject(AuthService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  theme = inject(ThemeService);

  private realtimeChannel: any = null;
  private searchDebounce: any = null;

  readonly PAGE_SIZE = 6;

  entries = signal<Entry[]>([]);
  totalCount = signal(0);
  loading = signal(true);
  searchTerm = signal('');
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  currentPage = signal(0);

  hasActiveFilters = computed(() =>
    !!this.searchTerm() || !!this.dateFrom() || !!this.dateTo()
  );

  async ngOnInit() {
    await this.loadPage();
    this.subscribeRealtime();
  }

  ngOnDestroy() {
    if (this.realtimeChannel) {
      this.supabase.client.removeChannel(this.realtimeChannel);
    }
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
  }

  private async loadPage() {
    this.loading.set(true);
    try {
      const result = await this.entriesService.search(
        this.currentPage(),
        this.PAGE_SIZE,
        this.searchTerm(),
        this.dateFrom(),
        this.dateTo()
      );
      this.entries.set(result.data);
      this.totalCount.set(result.count);
    } catch (err: any) {
      this.snackBar.open('Erro ao carregar relatos' + err.message, 'Fechar', { duration: 4000 });
    } finally {
      this.loading.set(false);
    }
  }

  private subscribeRealtime() {
    this.realtimeChannel = this.supabase.client
      .channel('entries-realtime')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'entries' },
        async () => await this.loadPage()
      )
      .subscribe();
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.currentPage.set(0);
      this.loadPage();
    }, 400);
  }

  onDateFrom(date: Date | null) {
    this.dateFrom.set(date);
    this.currentPage.set(0);
    this.loadPage();
  }

  onDateTo(date: Date | null) {
    this.dateTo.set(date);
    this.currentPage.set(0);
    this.loadPage();
  }

  clearFilters() {
    this.searchTerm.set('');
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.currentPage.set(0);
    this.loadPage();
  }

  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.loadPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  newEntry() { this.router.navigate(['/entries/new']); }
  viewEntry(e: Entry) { this.router.navigate(['/entries', e.id]); }
  editEntry(e: Entry) { this.router.navigate(['/entries', e.id, 'edit']); }

  async deleteEntry(entry: Entry) {
    if (!confirm('Excluir este relato?')) return;
    try {
      await this.entriesService.delete(entry.id);
      this.snackBar.open('Relato excluído', '', { duration: 3000 });
      await this.loadPage();
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

  getImages(content: string): HTMLImageElement[] | null {
    const div = document.createElement('div');
    div.innerHTML = content;
    const imgs = div.querySelectorAll('img');
    return imgs.length > 0 ? Array.from(imgs) : null;
  }
}