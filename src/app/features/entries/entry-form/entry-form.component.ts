import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuillModule } from 'ngx-quill';

import { Emotion, Entry, EntryPhoto } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { EmotionsService } from '../../../core/services/emotions.service';
import { EntriesService } from '../../../core/services/entries.service';
import { HelperService } from '../../../services/helper/helper.service';
import { LightboxComponent } from '../../../shared/components/lightbox/lightbox.component';
import { EmotionPickerDialogComponent } from '../../emotions/emotion-picker-dialog/emotion-picker-dialog.component';

interface PhotoPreview {
  url: string;
  file?: File;
  existing?: EntryPhoto;
}

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatDialogModule,
    MatSnackBarModule, MatTooltipModule, QuillModule,
  ],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css'
})
export class EntryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private entriesService = inject(EntriesService);
  private emotionsService = inject(EmotionsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private auth = inject(AuthService);
  helper = inject(HelperService)

  form = this.fb.group({
    content: ['', Validators.required],
  });

  quillModules = { toolbar: false };

  loading = signal(false);
  selectedEmotion = signal<Emotion | null>(null);
  photosToDelete: EntryPhoto[] = [];

  private quillInstance: any = null;
  isEdit = false;
  entryId: string | null = null;
  entryFormattedDate: string | null = null;
  entryToEdit: Entry | null = null

  async ngOnInit() {
    await this.emotionsService.loadAll();
    this.entryId = this.route.snapshot.paramMap.get('id');

    if (this.entryId) {
      this.isEdit = true;
      this.entryToEdit = await this.entriesService.getById(this.entryId);
      this.entryFormattedDate = this.helper.formatDate(this.entryToEdit.created_at)
      this.form.patchValue({ content: this.entryToEdit.content });
      if (this.entryToEdit.emotion) this.selectedEmotion.set(this.entryToEdit.emotion);
    }
  }

  onEditorCreated(quill: any) {
    this.quillInstance = quill;

    // Captura clique em imagens dentro do editor
    quill.root.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const url = (target as HTMLImageElement).src;
        this.openLightbox(url);
      }
    });
  }

  openLightbox(url: string) {
    this.dialog.open(LightboxComponent, {
      data: { url },
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'lightbox-dialog',
    });
  }

  format(type: string) {
    if (!this.quillInstance) return;
    const current = this.quillInstance.getFormat();
    this.quillInstance.format(type, !current[type]);
  }

  insertBulletList() {
    if (!this.quillInstance) return;
    const current = this.quillInstance.getFormat();
    this.quillInstance.format('list', current['list'] === 'bullet' ? false : 'bullet');
  }

  async onPhotoSelected(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    if (!files.length || !this.quillInstance) return;

    for (const file of files) {
      try {
        // Faz upload e pega signed URL
        const signedUrl = await this.entriesService.uploadTempPhoto(file, this.auth.getUserId());

        // Insere imagem na posição do cursor
        const range = this.quillInstance.getSelection(true);
        this.quillInstance.insertEmbed(range.index, 'image', signedUrl);
        this.quillInstance.setSelection(range.index + 1);
      } catch (err: any) {
        this.snackBar.open('Erro ao inserir foto', 'Fechar', { duration: 4000 });
      }
    }

    (event.target as HTMLInputElement).value = '';
  }

  openEmotionPicker() {
    const ref = this.dialog.open(EmotionPickerDialogComponent, {
      width: '480px',
      data: { selected: this.selectedEmotion() }
    });
    ref.afterClosed().subscribe((emotion: Emotion | undefined) => {
      if (emotion !== undefined) this.selectedEmotion.set(emotion);
    });
  }

  clearEmotion() { this.selectedEmotion.set(null); }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);

    try {
      const formData = {
        content: this.quillInstance.root.innerHTML,
        emotion_id: this.selectedEmotion()?.id ?? null,
        photo_files: [],        
        photos_paths: this.helper.getAllPhotosPaths(this.quillInstance.root.innerHTML)
      };


      if (this.isEdit && this.entryId) {
        //const photosPathsFromEditor = this.getAllPhotosPathsFromEditor()
        const notDeletedphotosPathsFromEditor = this.helper.getAllPhotosPaths(this.form.get('content')?.value); //paths das imagens que o usuário não excluiu do editor
        console.log("paths do banco " + this.entryToEdit?.photos_paths)
        const photosPathsToDelete = this.entryToEdit?.photos_paths?.filter(path => !notDeletedphotosPathsFromEditor?.includes(path)); //o que em entryToEdit?.photos_paths que não tem no notDeletedphotosPathsFromEditor. É o que te que excluir
        if(photosPathsToDelete){
          this.entriesService.deletePhotos(photosPathsToDelete)
        }
        await this.entriesService.update(this.entryId, formData,[]);
      } else {
        console.log("salvando novo")
        await this.entriesService.create(formData);
      }

      this.snackBar.open('Relato salvo com sucesso!', '', { duration: 3000 });
      this.router.navigate(['/entries']);
    } catch (err: any) {
      this.snackBar.open('Erro ao salvar: ' + err.message, 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  goBack() { this.router.navigate(['/entries']); }

  getImages(content: string): HTMLImageElement[] | null {
  const div = document.createElement('div');
  div.innerHTML = content;  
  const imgs = div.querySelectorAll('img');
  console.log(Array.from(imgs).map(img => img.src))
  return imgs.length > 0 ? Array.from(imgs) : null;
}
  
}