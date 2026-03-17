import { DatePipe } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  private datePipe = inject(DatePipe)

  constructor() { }

  formatDate(rawDate: string): string{
    return this.datePipe.transform(rawDate, 'dd/MM/yyyy - HH:mm:ss')!
  }

  getAllPhotosPaths(contentWithImgTags: string | null | undefined): string[]{
    const div = document.createElement('div');
    const formContent = contentWithImgTags
    div.innerHTML = formContent!
    const imgList = Array.from(div.querySelectorAll('img'));
    /*src está sempre no  padrão abaixo:
    https://wrwtsmrgubhlrcakfudu.supabase.co/storage/v1/object/sign/entry-photos/df21a8a7-fb37-4d50-9111-cfad35622492/temp/1773625421598.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xY2NmOGE5Yy1lNGQ2LTQwNDMtOTA2Ny1jZjM3MTU1ZmNlY2YiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJlbnRyeS1waG90b3MvZGYyMWE4YTctZmIzNy00ZDUwLTkxMTEtY2ZhZDM1NjIyNDkyL3RlbXAvMTc3MzYyNTQyMTU5OC5qcGciLCJpYXQiOjE3NzM2MjU0MjIsImV4cCI6MTgwNTE2MTQyMn0.6sp_I8U-JMHEMe8xXEmMi-QgtHlJBSZ9nGmrU7_9WBc */
    return imgList.map(img => img.src.split("?")[0].split("entry-photos")[1].slice(1));
  }
}
