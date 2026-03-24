import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Entry } from '../../../core/models';
import { EntriesService } from '../../../core/services/entries-service/entries.service';
import { LightboxComponent } from '../../../shared/components/lightbox/lightbox.component';

@Component({
  selector: 'app-entry-detail',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule,
  ],
  templateUrl: './entry-detail.component.html',
  styleUrl: './entry-detail.component.css'
})
export class EntryDetailComponent implements OnInit {
  private entriesService = inject(EntriesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  entry = signal<Entry | null>(null);
  loading = signal(true);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.goBack(); return; }

    try {
      const data = await this.entriesService.getById(id);
      this.entry.set(data);
    } catch {
      this.snackBar.open('Erro ao carregar relato', 'Fechar', { duration: 4000 });
      this.goBack();
    } finally {
      this.loading.set(false);
    }
  }

  onContentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG') {
      this.dialog.open(LightboxComponent, {
        data: { url: (target as HTMLImageElement).src },
        maxWidth: '95vw',
        maxHeight: '95vh',
        panelClass: 'lightbox-dialog',
      });
    }
  }

  edit() {
    this.router.navigate(['/entries', this.entry()!.id, 'edit']);
  }

  async delete() {
    if (!confirm('Excluir este relato?')) return;
    try {
      await this.entriesService.delete(this.entry()!.id);
      this.snackBar.open('Relato excluído', '', { duration: 3000 });
      this.goBack();
    } catch {
      this.snackBar.open('Erro ao excluir', 'Fechar', { duration: 4000 });
    }
  }

  goBack() { this.router.navigate(['/entries']); }
}