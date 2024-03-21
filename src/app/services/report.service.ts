import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Report } from '../models/report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  API = "http://localhost:3000/reports"
  constructor(private httpClient: HttpClient) { }

  create(report: Report): Observable<Report>{
    return this.httpClient.post<Report>(this.API, report)
  }


  update(id: string, report: Report): Observable<any> {
    return this.httpClient.put<any>(`${this.API}/${id}`, report);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
  
  

  listAll(): Observable<Report[]> {
    return this.httpClient.get<Report[]>(this.API)
}

getOne(id: number): Observable<any> {
  return this.httpClient.get(`${this.API}/${id}`).pipe(
   catchError(error => {
   console.error('Erro ao obter registro:', error);
     return throwError(() => new Error('Não foi possível recuperar o registro!'))
    })
  );
}


}
