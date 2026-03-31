import { DatePipe } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  private datePipe = inject(DatePipe)

  constructor() { }

  formatDate(rawDate: string): string | null {
  if (!rawDate || isNaN(Date.parse(rawDate))) return null;
  return this.datePipe.transform(rawDate, 'dd/MM/yyyy - HH:mm:ss');
}

  validarUrlSupabase(url: string): boolean {
    const pattern = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/sign\/[a-z0-9-_]+\/[a-z0-9-_]+\/temp\/.+\.(jpg|jpeg|png)\?token=[A-Za-z0-9._%=\-\*]+$/i;
    return pattern.test(url);
  }

  getAllPhotosPaths(contentWithImgTags: string | null | undefined): string[] {
    const div = document.createElement('div');
    const formContent = contentWithImgTags
    div.innerHTML = formContent!
    const imgList = Array.from(div.querySelectorAll('img'));
    const paths = [];
    for (const img of imgList) {
      if (this.validarUrlSupabase(img.src)) {
        paths.push(img.src.split("?")[0].split("entry-photos")[1].slice(1));
      }
    }
    return paths;
  }
}
