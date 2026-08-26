import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuillModule } from 'ngx-quill';

import { Emotion, Entry } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { EmotionsService } from '../../../core/services/emotions.service';
import { EntriesService } from '../../../core/services/entries-service/entries.service';
import { HelperService } from '../../../services/helper/helper.service';
import { LightboxComponent } from '../../../shared/components/lightbox/lightbox.component';
import { EmotionPickerDialogComponent } from '../../emotions/emotion-picker-dialog/emotion-picker-dialog.component';

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule,
    MatSnackBarModule, MatTooltipModule, QuillModule,
  ],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css'
})
export class EntryFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private entriesService = inject(EntriesService);
  private emotionsService = inject(EmotionsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private auth = inject(AuthService);
  helper = inject(HelperService);

  @ViewChild('cameraVideo') cameraVideo?: ElementRef<HTMLVideoElement>;

  form = this.fb.group({
    content: ['', Validators.required],
  });

  quillModules = { toolbar: false };

  loading = signal(false);
  selectedEmotion = signal<Emotion | null>(null);
  cameraOpen = signal(false);
  cameraStarting = signal(false);
  availableCameras = signal<MediaDeviceInfo[]>([]);
  selectedCameraId = signal<string | null>(null);

  private quillInstance: any = null;
  private cameraStream: MediaStream | null = null;
  private cameraDevicesListener?: () => void;
  isEdit = false;
  entryId: string | null = null;
  entryFormattedDate: string | null = null;
  entryToEdit: Entry | null = null;

  async ngOnInit() {
    await this.emotionsService.loadAll();
    this.entryId = this.route.snapshot.paramMap.get('id');

    if (this.entryId) {
      this.isEdit = true;
      this.entryToEdit = await this.entriesService.getById(this.entryId);
      this.entryFormattedDate = this.helper.formatDate(this.entryToEdit.created_at);
      this.form.patchValue({ content: this.entryToEdit.content });
      if (this.entryToEdit.emotion) this.selectedEmotion.set(this.entryToEdit.emotion);
    }
  }

  onEditorCreated(quill: any) {
    this.quillInstance = quill;

    quill.root.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        this.openLightbox((target as HTMLImageElement).src);
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
      await this.insertPhotoFile(file);
    }

    (event.target as HTMLInputElement).value = '';
  }

  async insertPhotoFile(file: File) {
    try {
      const signedUrl = await this.entriesService.uploadTempPhoto(file, this.auth.getUserId());
      const range = this.quillInstance.getSelection(true);
      this.quillInstance.insertEmbed(range.index, 'image', signedUrl);
      this.quillInstance.setSelection(range.index + 1);
    } catch {
      this.snackBar.open('Erro ao inserir foto', 'Fechar', { duration: 4000 });
    }
  }

  private async loadCameraDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return;

    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(device => device.kind === 'videoinput');
    this.availableCameras.set(cameras);

    if (!this.selectedCameraId() && cameras.length) {
      const rearCamera = cameras.find(camera => /back|rear|environment/i.test(camera.label));
      this.selectedCameraId.set(rearCamera?.deviceId ?? cameras[0].deviceId);
    }
  }

  async openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.snackBar.open('A câmera não é suportada neste navegador.', 'Fechar', { duration: 4000 });
      return;
    }

    this.cameraStarting.set(true);
    this.cameraOpen.set(true);

    try {
      // First request permission. Device labels are often unavailable until
      // the user has granted camera access at least once.
      await this.startCamera(this.selectedCameraId() ?? undefined);
      await this.loadCameraDevices();
      this.cameraDevicesListener = () => {
        this.loadCameraDevices().catch(() => undefined);
      };
      navigator.mediaDevices.addEventListener?.('devicechange', this.cameraDevicesListener);

      const currentCameraId = this.selectedCameraId();
      if (currentCameraId && currentCameraId !== this.getActiveCameraId()) {
        await this.startCamera(currentCameraId);
      }
    } catch {
      this.closeCamera();
      this.snackBar.open('Não foi possível acessar a câmera. Verifique a permissão do navegador.', 'Fechar', { duration: 5000 });
    } finally {
      this.cameraStarting.set(false);
    }
  }

  private async startCamera(deviceId?: string) {
    this.stopCameraStream();

    const videoConstraints: MediaTrackConstraints = deviceId
      ? { deviceId: { exact: deviceId } }
      : { facingMode: { ideal: 'environment' } };

    this.cameraStream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false
    });

    setTimeout(() => {
      if (this.cameraVideo?.nativeElement) {
        this.cameraVideo.nativeElement.srcObject = this.cameraStream;
        this.cameraVideo.nativeElement.play().catch(() => undefined);
      }
    });
  }

  private getActiveCameraId(): string | null {
    return this.cameraStream?.getVideoTracks()[0]?.getSettings().deviceId ?? null;
  }

  async switchCamera() {
    const cameras = this.availableCameras();
    if (cameras.length < 2) return;

    const currentId = this.getActiveCameraId() ?? this.selectedCameraId();
    const currentIndex = cameras.findIndex(camera => camera.deviceId === currentId);
    const nextCamera = cameras[(currentIndex + 1) % cameras.length];

    this.cameraStarting.set(true);
    try {
      this.selectedCameraId.set(nextCamera.deviceId);
      await this.startCamera(nextCamera.deviceId);
    } catch {
      this.snackBar.open('Não foi possível trocar a câmera.', 'Fechar', { duration: 4000 });
    } finally {
      this.cameraStarting.set(false);
    }
  }

  async capturePhoto() {
    const video = this.cameraVideo?.nativeElement;
    if (!video || !this.quillInstance || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await this.insertPhotoFile(file);
      this.closeCamera();
    }, 'image/jpeg', 0.9);
  }

  private stopCameraStream() {
    this.cameraStream?.getTracks().forEach(track => track.stop());
    this.cameraStream = null;
  }

  closeCamera() {
    this.stopCameraStream();
    if (this.cameraDevicesListener) {
      navigator.mediaDevices?.removeEventListener?.('devicechange', this.cameraDevicesListener);
      this.cameraDevicesListener = undefined;
    }
    this.cameraOpen.set(false);
  }

  ngOnDestroy() {
    this.closeCamera();
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
      const currentContent = this.quillInstance.root.innerHTML;
      const currentPaths = this.helper.getAllPhotosPaths(currentContent);

      const formData = {
        content: currentContent,
        emotion_id: this.selectedEmotion()?.id ?? null,
        photos_paths: currentPaths ?? [],
      };

      if (this.isEdit && this.entryId) {
        const previousPaths = this.entryToEdit?.photos_paths ?? [];
        const pathsToDelete = previousPaths.filter(
          path => !currentPaths?.includes(path)
        );

        if (pathsToDelete.length > 0) {
          await this.entriesService.deletePhotos(pathsToDelete);
        }

        await this.entriesService.update(this.entryId, formData);
      } else {
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
}