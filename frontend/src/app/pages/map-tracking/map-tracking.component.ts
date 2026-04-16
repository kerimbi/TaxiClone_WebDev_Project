import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { WebSocketService } from '../../services/websocket.service';
import { TripService } from '../../services/trip.service';
import { Subscription } from 'rxjs';
import { Trip } from '../../models/trip.model';

@Component({
  selector: 'app-map-tracking',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
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
        }
      </div>

      <google-map
        height="500px"
        width="100%"
        [center]="mapCenter"
        [zoom]="14"
        [options]="mapOptions">

        @if (driverMarker) {
          <map-marker
            [position]="driverMarker"
            [options]="{ icon: { url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' } }"
            [title]="'Driver Location'">
          </map-marker>
        }

        @if (pickupMarker) {
          <map-marker
            [position]="pickupMarker"
            [options]="{ icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' } }"
            [title]="'Pickup'">
          </map-marker>
        }
      </google-map>

      <div class="ws-log card">
        <h4>Live Updates</h4>
        @for (msg of messages; track $index) {
          <div class="log-entry">
            <span class="log-type">{{ msg.type }}</span>
            @if (msg.latitude) {
              <span>📍 {{ msg.latitude | number:'1.4-4' }}, {{ msg.longitude | number:'1.4-4' }}</span>
            }
            @if (msg.status) {
              <span>Status → {{ msg.status }}</span>
            }
          </div>
        }
        @empty {
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
    .arrow { color:#38bdf8; }
    .status-badge { border-radius:20px; padding:4px 12px; font-size:12px; font-weight:600; }
    .status-accepted{background:#14532d;color:#4ade80}
    .status-in_transit{background:#3b1f00;color:#fbbf24}
    .status-completed{background:#1a2e1a;color:#86efac}
    google-map { border-radius:16px; overflow:hidden; }
    .ws-log { max-height:200px; overflow-y:auto; }
    .ws-log h4 { font-weight:600; margin-bottom:12px; }
    .log-entry { display:flex; gap:12px; align-items:center; padding:6px 0;
                 border-bottom:1px solid #334155; font-size:13px; }
    .log-type { background:#1e3a5f; color:#60a5fa; border-radius:8px;
                padding:2px 8px; font-size:11px; font-weight:600; }
    .no-updates { color:#94a3b8; font-style:italic; }
  `]
})
export class MapTrackingComponent implements OnInit, OnDestroy {
  trip: Trip | null = null;
  tripId!: number;
  driverMarker: google.maps.LatLngLiteral | null = null;
  pickupMarker:  google.maps.LatLngLiteral | null = null;
  messages: any[] = [];
  private sub!: Subscription;

  mapCenter: google.maps.LatLngLiteral = { lat: 43.238, lng: 76.945 }; // Almaty
  mapOptions: google.maps.MapOptions = {
    styles: [
      { elementType:'geometry', stylers:[{ color:'#1e293b' }] },
      { elementType:'labels.text.fill', stylers:[{ color:'#94a3b8' }] },
      { featureType:'road', elementType:'geometry', stylers:[{ color:'#334155' }] },
      { featureType:'water', stylers:[{ color:'#0f172a' }] },
    ]
  };

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
        this.driverMarker = { lat: msg.latitude, lng: msg.longitude };
        this.mapCenter    = { lat: msg.latitude, lng: msg.longitude };
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.ws.disconnect();
  }
}
