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
}
