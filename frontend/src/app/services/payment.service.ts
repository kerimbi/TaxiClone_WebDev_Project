import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly API = 'http://localhost:8000/api/payments';

  constructor(private http: HttpClient) {}

  createPaymentIntent(tripId: number): Observable<{ client_secret: string; amount: number }> {
    return this.http.post<any>(`${this.API}/create-intent/`, { trip_id: tripId });
  }

  getPaymentHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/history/`);
  }
}
