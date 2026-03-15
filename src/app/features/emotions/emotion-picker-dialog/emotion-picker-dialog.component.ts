import { Component, OnInit, signal, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { EmotionsService } from '../../../core/services/emotions.service';
import { Emotion } from '../../../core/models';

const PRESET_COLORS = [
  '#EF5350', '#EC407A', '#AB47BC', '#7E57C2',
  '#42A5F5', '#26C6DA', '#26A69A', '#66BB6A',
  '#FFCA28', '#FFA726', '#FF7043', '#8D6E63',
];

const PRESET_EMOJIS = [
  '😊','😄','🥰','😎','🤩','😌','😁',
  '😢','😭','😰','😟','😔','😩','😤',
  '😂','🤣','😆','🙃','😏','🤔','😴',
  '🙏','💪','🔥','✨','💡','🎉','❤️',
];

@Component({
  selector: 'app-emotion-picker-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDividerModule,
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Como você está se sentindo?</h2>

      <mat-dialog-content>

        @if (emotions().length > 0) {
          <div class="emotions-grid">
            @for (emotion of emotions(); track emotion.id) {
              <button
                type="button"
                class="emotion-btn"
                [class.selected]="selectedId() === emotion.id"
                [style.border-color]="selectedId() === emotion.id ? emotion.color : 'transparent'"
                [style.background]="selectedId() === emotion.id ? emotion.color + '33' : 'transparent'"
                (click)="select(emotion)"
                [matTooltip]="emotion.label">
                <span class="emoji">{{ emotion.emoji }}</span>
                <span class="label">{{ emotion.label }}</span>
              </button>
            }
          </div>
        } @else {
          <p class="empty-hint">Você ainda não tem humores. Crie o primeiro abaixo!</p>
        }

        <mat-divider style="margin: 16px 0"></mat-divider>

        <div class="new-emotion-section">
          <p class="section-title">Criar novo humor</p>

          <form [formGroup]="newForm" (ngSubmit)="createEmotion()" class="new-form">

            <div class="field-group">
              <label class="field-label">Emoji</label>
              <div class="emoji-grid">
                @for (e of presetEmojis; track e) {
                  <button
                    type="button"
                    class="emoji-pick-btn"
                    [class.selected]="newForm.get('emoji')?.value === e"
                    (click)="newForm.get('emoji')?.setValue(e)">
                    {{ e }}
                  </button>
                }
              </div>
              <mat-form-field appearance="outline" style="width:80px; margin-top:8px">
                <mat-label>Outro</mat-label>
                <input matInput formControlName="emoji" maxlength="2">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome do humor</mat-label>
              <input matInput formControlName="label" placeholder="Ex: Grato, Ansioso...">
            </mat-form-field>

            <div class="field-group">
              <label class="field-label">Cor</label>
              <div class="color-grid">
                @for (c of presetColors; track c) {
                  <button
                    type="button"
                    class="color-btn"
                    [style.background]="c"
                    [class.selected]="newForm.get('color')?.value === c"
                    (click)="newForm.get('color')?.setValue(c)">
                  </button>
                }
              </div>
            </div>

            <button
              type="submit"
              mat-stroked-button
              [disabled]="newForm.invalid || creating()">
              @if (creating()) {
                <mat-spinner diameter="16"></mat-spinner>
              } @else {
                <mat-icon>add</mat-icon> Criar humor
              }
            </button>

          </form>
        </div>

      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancel()">Cancelar</button>
        <button mat-flat-button color="primary" (click)="confirm()" [disabled]="!selectedId()">
          Confirmar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { min-width: 400px; }

    .emotions-grid { display: flex; flex-wrap: wrap; gap: 8px; }

    .emotion-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 12px;
      border: 2px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      background: transparent;
      transition: all 0.15s;
      min-width: 72px;
    }
    .emotion-btn:hover { transform: scale(1.05); }
    .emotion-btn.selected { transform: scale(1.05); }
    .emotion-btn .emoji { font-size: 24px; }
    .emotion-btn .label { font-size: 11px; margin-top: 2px; color: var(--mat-sys-on-surface); }

    .empty-hint { color: var(--mat-sys-on-surface-variant); font-size: 14px; }

    .section-title { font-size: 13px; font-weight: 500; margin-bottom: 12px; }
    .new-form { display: flex; flex-direction: column; gap: 12px; }
    .full-width { width: 100%; }

    .field-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--mat-sys-on-surface-variant);
      display: block;
      margin-bottom: 6px;
    }

    .emoji-grid { display: flex; flex-wrap: wrap; gap: 4px; }
    .emoji-pick-btn {
      width: 36px; height: 36px;
      font-size: 20px;
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      background: transparent;
      transition: all 0.1s;
    }
    .emoji-pick-btn:hover { background: var(--mat-sys-surface-variant); }
    .emoji-pick-btn.selected {
      border-color: var(--mat-sys-primary);
      background: var(--mat-sys-primary-container);
    }

    .color-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .color-btn {
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.15s;
    }
    .color-btn:hover { transform: scale(1.2); }
    .color-btn.selected { border-color: var(--mat-sys-on-surface); transform: scale(1.2); }

    mat-spinner { display: inline-block; }
  `]
})
export class EmotionPickerDialogComponent implements OnInit {
  private emotionsService = inject(EmotionsService);
  private dialogRef = inject(MatDialogRef<EmotionPickerDialogComponent>);
  private fb = inject(FormBuilder);
  private data: { selected: Emotion | null } = inject(MAT_DIALOG_DATA);

  emotions = this.emotionsService.emotions;
  selectedId = signal<string | null>(null);
  creating = signal(false);

  presetColors = PRESET_COLORS;
  presetEmojis = PRESET_EMOJIS;

  newForm = this.fb.group({
    label: ['', Validators.required],
    emoji: ['😊', Validators.required],
    color: [PRESET_COLORS[0], Validators.required],
  });

  async ngOnInit() {
    await this.emotionsService.loadAll();
    if (this.data?.selected) this.selectedId.set(this.data.selected.id);
  }

  select(emotion: Emotion) {
    this.selectedId.set(
      this.selectedId() === emotion.id ? null : emotion.id
    );
  }

  async createEmotion() {
    if (this.newForm.invalid) return;
    this.creating.set(true);
    try {
      const created = await this.emotionsService.create({
        label: this.newForm.value.label!,
        emoji: this.newForm.value.emoji!,
        color: this.newForm.value.color!,
      });
      this.selectedId.set(created.id);
      this.newForm.reset({ emoji: '😊', color: PRESET_COLORS[0] });
    } finally {
      this.creating.set(false);
    }
  }

  confirm() {
    const emotion = this.emotions().find(e => e.id === this.selectedId()) ?? null;
    this.dialogRef.close(emotion);
  }

  cancel() { this.dialogRef.close(undefined); }
}