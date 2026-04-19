import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TripService } from '../../services/trip.service';
import { Trip } from '../../models/trip.model';

@Component({
    selector: 'app-driver-trips',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <h2>🚗 Driver Dashboard</h2>

    <div class="tabs">
      <button [class.active]="tab === 'available'" (click)="tab = 'available'; loadAvailable()">
        Available Orders
      </button>
      <button [class.active]="tab === 'my'" (click)="tab = 'my'; loadMyTrips()">
        My Trips
      </button>
    </div>

    @if (tab === 'available') {
      <div class="trips-grid">
        @for (trip of availableTrips; track trip.id) {
          <div class="card trip-card">
            <div class="trip-header">
              <span class="trip-id">#{{ trip.id }}</span>
              <span class="fare">{{ trip.fare_estimate | currency:'KZT':'symbol':'1.0-0' }}</span>
            </div>
            <div class="trip-body">
              <div class="location">
                <span class="dot pickup"></span>
                <span>{{ trip.pickup_address }}</span>
              </div>
              <div class="arrow-down">↓ {{ trip.distance_km }} km</div>
              <div class="location">
                <span class="dot dropoff"></span>
                <span>{{ trip.dropoff_address }}</span>
              </div>
            </div>
            <button class="btn-accept" (click)="acceptTrip(trip.id)" [disabled]="accepting === trip.id">
              {{ accepting === trip.id ? 'Accepting...' : '✅ Accept Trip' }}
            </button>
          </div>
        } @empty {
          <div class="card empty-state">
            <p>🎉 No available orders</p>
            <p class="sub">New orders will appear here</p>
            <button class="btn-refresh" (click)="loadAvailable()">🔄 Refresh</button>
          </div>
        }
      </div>
    }

    @if (tab === 'my') {
      <div class="trips-grid">
        @for (trip of myTrips; track trip.id) {
          <div class="card trip-card">
            <div class="trip-header">
              <span class="trip-id">#{{ trip.id }}</span>
              <span class="status-badge" [class]="'status-' + trip.status">{{ trip.status }}</span>
            </div>
            <div class="trip-body">
              <div class="location">
                <span class="dot pickup"></span>
                <span>{{ trip.pickup_address }}</span>
              </div>
              <div class="location">
                <span class="dot dropoff"></span>
                <span>{{ trip.dropoff_address }}</span>
              </div>
            </div>
            <div class="trip-footer">
              <span class="fare">{{ trip.fare_estimate | currency:'KZT':'symbol':'1.0-0' }}</span>
              @if (trip.status === 'accepted' || trip.status === 'in_transit') {
                <button class="btn-complete" (click)="completeTrip(trip.id)">
                  🏁 Complete Trip
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="card empty-state">
            <p>No active trips</p>
          </div>
        }
      </div>
    }

    @if (successMsg) {
      <div class="toast">{{ successMsg }}</div>
    }
  `,
    styles: [`
    h2 { font-size:26px; font-weight:700; margin-bottom:24px; }
    .tabs { display:flex; gap:12px; margin-bottom:24px; }
    .tabs button { background:transparent; border:1px solid #334155; border-radius:10px;
      color:#94a3b8; padding:10px 20px; font-size:14px; font-weight:600; transition:all .2s; }
    .tabs button.active { background:#0ea5e9; border-color:#0ea5e9; color:#fff; }
    .trips-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
    .trip-card { display:flex; flex-direction:column; gap:14px; }
    .trip-header { display:flex; justify-content:space-between; align-items:center; }
    .trip-id { font-weight:700; color:#38bdf8; font-size:16px; }
    .fare { font-weight:700; color:#4ade80; font-size:18px; }
    .trip-body { display:flex; flex-direction:column; gap:8px; }
    .location { display:flex; align-items:center; gap:10px; font-size:14px; }
    .dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .pickup { background:#38bdf8; }
    .dropoff { background:#f43f5e; }
    .arrow-down { color:#94a3b8; font-size:13px; padding-left:20px; }
    .btn-accept { background:linear-gradient(135deg,#10b981,#059669); border:none;
      border-radius:10px; color:#fff; padding:12px; font-size:15px; font-weight:700;
      transition:opacity .2s; }
    .btn-accept:hover { opacity:.85; }
    .btn-accept:disabled { opacity:.5; }
    .trip-footer { display:flex; justify-content:space-between; align-items:center;
      padding-top:8px; border-top:1px solid #334155; }
    .btn-complete { background:#6366f1; border:none; border-radius:8px;
      color:#fff; padding:8px 16px; font-weight:600; }
    .btn-refresh { background:#334155; border:none; border-radius:8px;
      color:#f1f5f9; padding:10px 20px; font-weight:600; margin-top:12px; }
    .status-badge { border-radius:20px; padding:4px 12px; font-size:12px; font-weight:600; }
    .status-accepted{background:#14532d;color:#4ade80}
    .status-completed{background:#1a2e1a;color:#86efac}
    .status-in_transit{background:#3b1f00;color:#fbbf24}
    .empty-state { text-align:center; padding:40px; }
    .empty-state p { font-size:18px; margin-bottom:8px; }
    .sub { color:#94a3b8; font-size:14px; }
    .toast { position:fixed; bottom:32px; right:32px; background:#10b981;
      color:#fff; padding:14px 24px; border-radius:12px; font-weight:600; }
  `]
})
export class DriverTripsComponent implements OnInit {
    tab = 'available';
    availableTrips: Trip[] = [];
    myTrips: Trip[] = [];
    accepting: number | null = null;
    successMsg = '';

    constructor(
        private http: HttpClient,
        private tripService: TripService,
        public auth: AuthService
    ) {}

    ngOnInit() {
        this.loadAvailable();
    }

    loadAvailable() {
        this.http.get<Trip[]>('http://localhost:8000/api/trips/available/').subscribe({
            next: (trips) => this.availableTrips = trips,
            error: () => this.availableTrips = []
        });
    }

    loadMyTrips() {
        this.tripService.getMyTrips().subscribe(trips => this.myTrips = trips);
    }

    acceptTrip(id: number) {
        this.accepting = id;
        this.tripService.acceptTrip(id).subscribe({
            next: () => {
                this.accepting = null;
                this.showToast('✅ Trip accepted!');
                this.loadAvailable();
                this.tab = 'my';
                this.loadMyTrips();
            },
            error: () => { this.accepting = null; }
        });
    }

    completeTrip(id: number) {
        this.tripService.completeTrip(id).subscribe({
            next: () => {
                this.showToast('🏁 Trip completed!');
                this.loadMyTrips();
            }
        });
    }

    showToast(msg: string) {
        this.successMsg = msg;
        setTimeout(() => this.successMsg = '', 3000);
    }
}