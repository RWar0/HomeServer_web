import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../enviroments/enviroment';
import { Observable } from 'rxjs';

type httpOptions = {
  withCredentials?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  get<T>(url: string, body?: unknown): Observable<T> {
    return this.httpClient.get<T>(`${this.baseUrl}/${url}`, body ?? {});
  }

  post<T>(url: string, body?: unknown, options?: httpOptions): Observable<T> {
    return this.httpClient.post<T>(`${this.baseUrl}/${url}`, body ?? {}, options);
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.httpClient.put<T>(`${this.baseUrl}/${url}`, body);
  }

  patch<T>(url: string, body?: unknown): Observable<T> {
    return this.httpClient.patch<T>(`${this.baseUrl}/${url}`, body ?? {});
  }

  delete<T>(url: string): Observable<T> {
    return this.httpClient.delete<T>(`${this.baseUrl}/${url}`);
  }
}
