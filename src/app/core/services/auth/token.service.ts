import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly accessToken = signal<string | null>(null);

  setToken(token: string | null): void {
    this.accessToken.set(token);
  }

  clearToken(): void {
    this.accessToken.set(null);
  }

  getToken(): string | null {
    return this.accessToken();
  }
}
