import { Component, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="lightbox-container">
      <button mat-icon-button class="close-btn" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
      <img [src]="data.url" [alt]="data.alt || 'Foto'" class="lightbox-image">
    </div>
  `,
  styles: [`
    .lightbox-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: black;
      width: 100%;
      height: 100%;
    }
    .lightbox-image {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
      border-radius: 4px;
    }
    .close-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      color: white;
      background: rgba(0,0,0,0.5);
      z-index: 10;
    }
  `]
})
export class LightboxComponent {
  constructor(
    private dialogRef: MatDialogRef<LightboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string; alt?: string }
  ) {}

  close() { this.dialogRef.close(); }
}