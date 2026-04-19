import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { PaymentService } from '../../services/payment.service';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-book-trip',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="book-wrapper">
      <h2>Book a Ride</h2>

      @if (!bookedTrip) {
        <div class="instructions card">
          <p>🖱 <strong>Click on the map</strong> to set pickup and dropoff points</p>
          <div class="markers-info">
            <span class="dot-blue"></span> First click = Pickup
            <span class="dot-red" style="margin-left:16px"></span> Second click = Dropoff
          </div>
        </div>

        <div id="book-map" style="height:400px; border-radius:16px; z-index:1; margin-bottom:20px;"></div>

        @if (pickup.lat && dropoff.lat) {
          <div class="card estimate-card">
            <div class="estimate-row">
              <div class="estimate-item">
                <span class="label">📍 Pickup</span>
                <span class="value">{{ pickup.lat | number:'1.4-4' }}, {{ pickup.lng | number:'1.4-4' }}</span>
              </div>
              <div class="estimate-item">
                <span class="label">🏁 Dropoff</span>
                <span class="value">{{ dropoff.lat | number:'1.4-4' }}, {{ dropoff.lng | number:'1.4-4' }}</span>
              </div>
              <div class="estimate-item">
                <span class="label">📏 Distance</span>
                <span class="value highlight">{{ distanceKm | number:'1.1-1' }} km</span>
              </div>
              <div class="estimate-item">
                <span class="label">💰 Fare</span>
                <span class="value highlight green">{{ fare | currency:'KZT':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>
        }

        <div class="form-group" style="margin-top:16px">
          <label>Pickup Address (description)</label>
          <input [(ngModel)]="pickup_address" placeholder="e.g. KBTU University">
        </div>
        <div class="form-group">
          <label>Dropoff Address (description)</label>
          <input [(ngModel)]="dropoff_address" placeholder="e.g. Mega Center Almaty">
        </div>

        @if (error) {
          <div class="error-box">{{ error }}</div>
        }

        <button class="btn-primary"
          (click)="requestTrip()"
          [disabled]="loading || !pickup.lat || !dropoff.lat">
          {{ loading ? 'Finding drivers…' : '🚕 Request Trip' }}
        </button>

        @if (!pickup.lat) {
          <p class="hint">👆 Click on the map to set your pickup point first</p>
        } @else if (!dropoff.lat) {
          <p class="hint">👆 Now click to set your dropoff point</p>
        }
      }

      @if (bookedTrip) {
        <div class="card success-card">
          <div class="success-icon">✅</div>
          <h3>Trip Requested!</h3>
          <p>Trip #{{ bookedTrip.id }}</p>
          <div class="trip-details">
            <div class="detail-row">
              <span>Distance</span>
              <span>{{ bookedTrip.distance_km }} km</span>
            </div>
            <div class="detail-row">
              <span>Base fare</span>
              <span>300 KZT</span>
            </div>
            <div class="detail-row">
              <span>Per km ({{ bookedTrip.distance_km }} × 120)</span>
              <span>{{ bookedTrip.distance_km * 120 | number:'1.0-0' }} KZT</span>
            </div>
            <div class="detail-row total">
              <span>Total Fare</span>
              <span>{{ bookedTrip.fare_estimate | currency:'KZT':'symbol':'1.0-0' }}</span>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn-primary" (click)="trackTrip()">🗺 Track on Map</button>
            <button class="btn-secondary" (click)="reset()">+ New Trip</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .book-wrapper h2 { font-size:28px; font-weight:700; margin-bottom:20px; }
    .instructions { margin-bottom:16px; }
    .instructions p { font-size:15px; }
    .markers-info { margin-top:8px; display:flex; align-items:center; font-size:13px; color:#94a3b8; }
    .dot-blue { width:12px; height:12px; border-radius:50%; background:#38bdf8;
      display:inline-block; margin-right:6px; }
    .dot-red  { width:12px; height:12px; border-radius:50%; background:#f43f5e;
      display:inline-block; margin-right:6px; }
    .estimate-card { margin-bottom:16px; }
    .estimate-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:16px; }
    .estimate-item { display:flex; flex-direction:column; gap:4px; }
    .label { font-size:12px; color:#94a3b8; }
    .value { font-size:15px; font-weight:600; }
    .highlight { color:#38bdf8; font-size:18px; }
    .green { color:#4ade80 !important; }
    .form-group { margin-bottom:14px; }
    .form-group label { display:block; margin-bottom:6px; font-size:13px; color:#94a3b8; }
    .btn-primary { width:100%; margin-top:8px; }
    .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .hint { text-align:center; color:#94a3b8; font-size:13px; margin-top:10px; }
    .error-box { background:#450a0a; border:1px solid #ef4444; border-radius:8px;
      padding:10px 14px; color:#fca5a5; margin-top:12px; font-size:14px; }
    .success-card { max-width:480px; text-align:center; }
    .success-icon { font-size:48px; margin-bottom:12px; }
    .success-card h3 { font-size:22px; font-weight:700; margin-bottom:16px; }
    .trip-details { background:#0f172a; border-radius:12px; padding:16px; margin-bottom:20px; text-align:left; }
    .detail-row { display:flex; justify-content:space-between; padding:8px 0;
      border-bottom:1px solid #1e293b; font-size:14px; color:#94a3b8; }
    .detail-row.total { border-bottom:none; font-size:16px; font-weight:700; color:#4ade80; }
    .action-buttons { display:flex; gap:12px; }
    .btn-secondary { flex:1; background:#334155; border:none; border-radius:10px;
      color:#f1f5f9; padding:12px; font-size:15px; font-weight:600; cursor:pointer; }
  `]
})
export class BookTripComponent implements AfterViewInit, OnDestroy {
  pickup  = { lat: 0, lng: 0 };
  dropoff = { lat: 0, lng: 0 };
  pickup_address  = '';
  dropoff_address = '';
  distanceKm = 0;
  fare = 0;
  bookedTrip: any = null;
  error = ''; loading = false;

  private map!: L.Map;
  private pickupMarker!: L.Marker | null;
  private dropoffMarker!: L.Marker | null;
  private routeLine!: L.Polyline | null;
  private step = 0; // 0=pickup, 1=dropoff

  constructor(private tripService: TripService, private router: Router) {}

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
  }

  initMap() {
    this.map = L.map('book-map').setView([43.238, 76.945], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (this.step === 0) {
        // Set pickup
        if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);
        this.pickupMarker = L.marker([lat, lng], { icon: this.blueIcon() })
            .addTo(this.map)
            .bindPopup('📍 Pickup').openPopup();
        this.pickup = { lat, lng };
        this.step = 1;
        if (!this.pickup_address) this.pickup_address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      } else {
        // Set dropoff
        if (this.dropoffMarker) this.map.removeLayer(this.dropoffMarker);
        this.dropoffMarker = L.marker([lat, lng], { icon: this.redIcon() })
            .addTo(this.map)
            .bindPopup('🏁 Dropoff').openPopup();
        this.dropoff = { lat, lng };
        this.step = 0;
        if (!this.dropoff_address) this.dropoff_address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        // Draw line between points
        if (this.routeLine) this.map.removeLayer(this.routeLine);
        this.routeLine = L.polyline([
          [this.pickup.lat, this.pickup.lng],
          [this.dropoff.lat, this.dropoff.lng]
        ], { color: '#38bdf8', weight: 3, dashArray: '8,6' }).addTo(this.map);

        // Fit map to show both markers
        this.map.fitBounds([
          [this.pickup.lat, this.pickup.lng],
          [this.dropoff.lat, this.dropoff.lng]
        ], { padding: [40, 40] });

        // Calculate distance and fare
        this.distanceKm = this.haversine(this.pickup.lat, this.pickup.lng, this.dropoff.lat, this.dropoff.lng);
        this.fare = Math.round(300 + this.distanceKm * 120);
      }
    });
  }

  haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
        Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
    return +(2 * R * Math.asin(Math.sqrt(a))).toFixed(2);
  }

  blueIcon() {
    return L.divIcon({
      html: '<div style="background:#38bdf8;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>',
      iconSize: [18, 18], iconAnchor: [9, 9], className: ''
    });
  }

  redIcon() {
    return L.divIcon({
      html: '<div style="background:#f43f5e;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>',
      iconSize: [18, 18], iconAnchor: [9, 9], className: ''
    });
  }

  requestTrip() {
    this.loading = true; this.error = '';
    this.tripService.requestTrip({
      pickup_lat: this.pickup.lat, pickup_lng: this.pickup.lng,
      dropoff_lat: this.dropoff.lat, dropoff_lng: this.dropoff.lng,
      pickup_address: this.pickup_address,
      dropoff_address: this.dropoff_address,
    }).subscribe({
      next: (trip) => { this.bookedTrip = trip; this.loading = false; },
      error: () => { this.error = 'Failed to request trip. Please try again.'; this.loading = false; }
    });
  }

  trackTrip() {
    this.router.navigate(['/map', this.bookedTrip.id]);
  }

  reset() {
    this.bookedTrip = null;
    this.pickup = { lat: 0, lng: 0 };
    this.dropoff = { lat: 0, lng: 0 };
    this.pickup_address = '';
    this.dropoff_address = '';
    this.distanceKm = 0;
    this.fare = 0;
    this.step = 0;
    setTimeout(() => this.initMap(), 100);
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }
}