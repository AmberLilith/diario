import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Emotion } from '../../../core/models';
import { EmotionsService } from '../../../core/services/emotions.service';

const PRESET_COLORS = [
  '#EF5350', '#EC407A', '#AB47BC', '#7E57C2',
  '#42A5F5', '#26C6DA', '#26A69A', '#66BB6A',
  '#FFCA28', '#FFA726', '#FF7043', '#8D6E63',
];

const PRESET_EMOJIS = [
  '🙂','😄','🥰','😎','🤩','😌','😁',
  '😢','😭','😰','😟','😔','😩','😤',
  '😂','🤣','😆','🙃','😏','🤔','😴',
  '🙏','💪','🔥','✨','💡','🎉','❤️',
  '🤮','🤬'
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
  templateUrl: './emotion-picker-dialog.component.html',
  styleUrl: './emotion-picker-dialog.component.css'
})
export class EmotionPickerDialogComponent implements OnInit {
  private emotionsService = inject(EmotionsService);
  private dialogRef = inject(MatDialogRef<EmotionPickerDialogComponent>);
  private fb = inject(FormBuilder);
  private data: { selected: Emotion | null } = inject(MAT_DIALOG_DATA);

  emotions = this.emotionsService.emotions;
  selectedId = signal<string | null>(null);
  editingId = signal<string | null>(null);
  saving = signal(false);

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

  startEdit(emotion: Emotion) {
    this.editingId.set(emotion.id);
    this.newForm.patchValue({
      label: emotion.label,
      emoji: emotion.emoji,
      color: emotion.color,
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.newForm.reset({ emoji: '😊', color: PRESET_COLORS[0] });
  }

  async saveEmotion() {
    if (this.newForm.invalid) return;
    this.saving.set(true);

    try {
      const form = {
        label: this.newForm.value.label!,
        emoji: this.newForm.value.emoji!,
        color: this.newForm.value.color!,
      };

      if (this.editingId()) {
        await this.emotionsService.update(this.editingId()!, form);
        this.editingId.set(null);
      } else {
        const created = await this.emotionsService.create(form);
        this.selectedId.set(created.id);
      }

      this.newForm.reset({ emoji: '😊', color: PRESET_COLORS[0] });
    } finally {
      this.saving.set(false);
    }
  }

  async deleteEmotion(emotion: Emotion) {
    if (!confirm(`Excluir o humor "${emotion.label}"?`)) return;
    if (this.selectedId() === emotion.id) this.selectedId.set(null);
    if (this.editingId() === emotion.id) this.cancelEdit();
    await this.emotionsService.delete(emotion.id);
  }

  confirm() {
    const emotion = this.emotions().find(e => e.id === this.selectedId()) ?? null;
    this.dialogRef.close(emotion);
  }

  cancel() { this.dialogRef.close(undefined); }
}