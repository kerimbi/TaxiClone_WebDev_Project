import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip, CreateTripPayload, NearbyDriver } from '../models/trip.model';

@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly API = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getMyTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.API}/trips/`);
  }

  getTripById(id: number): Observable<Trip> {
    return this.http.get<Trip>(`${this.API}/trips/${id}/`);
  }

  requestTrip(payload: CreateTripPayload): Observable<Trip> {
    return this.http.post<Trip>(`${this.API}/trips/request/`, payload);
  }

  acceptTrip(id: number): Observable<Trip> {
    return this.http.post<Trip>(`${this.API}/trips/${id}/accept/`, {});
  }

  completeTrip(id: number): Observable<Trip> {
    return this.http.post<Trip>(`${this.API}/trips/${id}/complete/`, {});
  }

  cancelTrip(id: number): Observable<Trip> {
    return this.http.post<Trip>(`${this.API}/trips/${id}/cancel/`, {});
  }

  getNearbyDrivers(lat: number, lng: number, radius = 5): Observable<NearbyDriver[]> {
    return this.http.get<NearbyDriver[]>(
      `${this.API}/drivers/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`
    );
  }
}
