import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../services/websocket.service';
import { TripService } from '../../services/trip.service';
import { Subscription } from 'rxjs';
import { Trip } from '../../models/trip.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tracking-page">
      <div class="trip-status-bar card">
        @if (trip) {
          <div class="status-info">
            <span>Trip #{{ trip.id }}</span>
            <span class="status-badge" [class]="'status-' + trip.status">{{ trip.status }}</span>
          </div>
          <div class="route-info">
            <span>📍 {{ trip.pickup_address }}</span>
            <span class="arrow">→</span>
            <span>🏁 {{ trip.dropoff_address }}</span>
          </div>
          <div class="fare-info">
            <span>Distance: {{ trip.distance_km }} km</span>
            <span class="fare">{{ trip.fare_estimate | currency:'KZT':'symbol':'1.0-0' }}</span>
          </div>
        }
      </div>

      <div id="map" style="height:500px; border-radius:16px; z-index:1;"></div>

      <div class="ws-log card">
        <h4>Live Updates</h4>
        @for (msg of messages; track $index) {
          <div class="log-entry">
            <span class="log-type">{{ msg.type }}</span>
            @if (msg['latitude']) {
              <span>📍 {{ msg['latitude'] | number:'1.4-4' }}, {{ msg['longitude'] | number:'1.4-4' }}</span>
            }
            @if (msg['status']) {
              <span>Status → {{ msg['status'] }}</span>
            }
          </div>
        } @empty {
          <p class="no-updates">Waiting for updates…</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .tracking-page { display:flex; flex-direction:column; gap:20px; }
    .trip-status-bar { display:flex; flex-direction:column; gap:8px; }
    .status-info { display:flex; justify-content:space-between; align-items:center; }
    .route-info { display:flex; gap:12px; align-items:center; color:#94a3b8; font-size:14px; }
    .fare-info { display:flex; justify-content:space-between; padding-top:8px; border-top:1px solid #334155; }
    .fare { color:#4ade80; font-weight:700; }
    .arrow { color:#38bdf8; }
    .status-badge { border-radius:20px; padding:4px 12px; font-size:12px; font-weight:600; }
    .status-accepted{background:#14532d;color:#4ade80}
    .status-in_transit{background:#3b1f00;color:#fbbf24}
    .status-completed{background:#1a2e1a;color:#86efac}
    .status-requested{background:#1e3a5f;color:#60a5fa}
    .ws-log { max-height:200px; overflow-y:auto; }
    .ws-log h4 { font-weight:600; margin-bottom:12px; }
    .log-entry { display:flex; gap:12px; align-items:center; padding:6px 0;
      border-bottom:1px solid #334155; font-size:13px; }
    .log-type { background:#1e3a5f; color:#60a5fa; border-radius:8px;
      padding:2px 8px; font-size:11px; font-weight:600; }
    .no-updates { color:#94a3b8; font-style:italic; }
  `]
})
export class MapTrackingComponent implements OnInit, AfterViewInit, OnDestroy {
  trip: Trip | null = null;
  tripId!: number;
  messages: any[] = [];
  private sub!: Subscription;
  private map!: L.Map;
  private driverMarker!: L.Marker;
  private pickupMarker!: L.Marker;
  private dropoffMarker!: L.Marker;

  // Almaty center
  private defaultLat = 43.238;
  private defaultLng = 76.945;

  constructor(
      private route: ActivatedRoute,
      private ws: WebSocketService,
      private tripService: TripService
  ) {}

  ngOnInit() {
    this.tripId = +this.route.snapshot.paramMap.get('id')!;
    this.tripService.getTripById(this.tripId).subscribe(trip => {
      this.trip = trip;
    });

    this.ws.connectToTrip(this.tripId);
    this.sub = this.ws.getMessages().subscribe(msg => {
      this.messages.unshift(msg);
      if (this.messages.length > 20) this.messages.pop();

      if (msg.type === 'driver_location') {
        const lat = msg['latitude'];
        const lng = msg['longitude'];
        this.updateDriverMarker(lat, lng);
      }
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    this.map = L.map('map').setView([this.defaultLat, this.defaultLng], 13);

    // OpenStreetMap tiles — no API key needed
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Fix default icon paths for webpack
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const pickupIcon = L.divIcon({
      html: '<div style="background:#38bdf8;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: ''
    });

    const dropoffIcon = L.divIcon({
      html: '<div style="background:#f43f5e;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: ''
    });

    const driverIcon = L.divIcon({
      html: '<div style="background:#fbbf24;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:12px;">🚕</div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      className: ''
    });

    // Placeholder markers at Almaty center
    this.pickupMarker = L.marker([this.defaultLat, this.defaultLng], { icon: pickupIcon })
        .addTo(this.map)
        .bindPopup('📍 Pickup point');

    this.dropoffMarker = L.marker([this.defaultLat - 0.02, this.defaultLng + 0.02], { icon: dropoffIcon })
        .addTo(this.map)
        .bindPopup('🏁 Dropoff point');

    this.driverMarker = L.marker([this.defaultLat, this.defaultLng], { icon: driverIcon })
        .addTo(this.map)
        .bindPopup('🚕 Driver');
  }

  updateDriverMarker(lat: number, lng: number) {
    if (this.driverMarker) {
      this.driverMarker.setLatLng([lat, lng]);
      this.map.panTo([lat, lng]);
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.ws.disconnect();
    if (this.map) this.map.remove();
  }
}