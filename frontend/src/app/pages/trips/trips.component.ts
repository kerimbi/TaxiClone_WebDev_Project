import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TripService } from '../../services/trip.service';
import { AuthService } from '../../services/auth.service';
import { Trip } from '../../models/trip.model';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="trips-page">
      <div class="page-header">
        <h2>My Trips</h2>
        <button class="btn-refresh" (click)="load()">🔄 Refresh</button>
      </div>

      <div class="tabs">
        <button [class.active]="tab === 'active'" (click)="tab = 'active'">
          🟢 Active ({{ activeTrips.length }})
        </button>
        <button [class.active]="tab === 'history'" (click)="tab = 'history'">
          📋 History ({{ historyTrips.length }})
        </button>
      </div>

      @if (loading) {
        <p class="muted">Loading trips…</p>
      }

      @if (tab === 'active') {
        <div class="trips-grid">
          @for (trip of activeTrips; track trip.id) {
            <div class="card trip-card">
              <div class="trip-header">
                <span class="trip-id">#{{ trip.id }}</span>
                <span class="status-badge" [class]="'status-' + trip.status">
                  {{ trip.status }}
                </span>
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

              <div class="fare-row">
                <span class="fare">{{ trip.fare_estimate | currency:'KZT':'symbol':'1.0-0' }}</span>
                <span class="dist">{{ trip.distance_km }} km</span>
              </div>

              @if (trip.driver) {
                <div class="driver-box">
                  <span>🚗 {{ trip.driver.car_model }} — {{ trip.driver.car_plate }}</span>
                  <span class="driver-name">{{ trip.driver.user?.username }}</span>
                </div>
              } @else {
                <div class="waiting">⏳ Waiting for driver...</div>
              }

              @if (isDriver) {
                <button class="btn-complete" (click)="completeTrip(trip.id)">
                  🏁 Complete Trip
                </button>
              }
            </div>
          } @empty {
            <div class="card empty-state">
              <p>No active trips</p>
              @if (!isDriver) {
                <a routerLink="/book" class="btn-primary" style="display:inline-block;margin-top:12px;">
                  Book a ride
                </a>
              }
            </div>
          }
        </div>
      }

      @if (tab === 'history') {
        <div class="trips-grid">
          @for (trip of historyTrips; track trip.id) {
            <div class="card trip-card">
              <div class="trip-header">
                <span class="trip-id">#{{ trip.id }}</span>
                <span class="status-badge" [class]="'status-' + trip.status">
                  {{ trip.status }}
                </span>
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

              <div class="fare-row">
                <span class="fare">{{ trip.fare_estimate | currency:'KZT':'symbol':'1.0-0' }}</span>
                <span class="dist">{{ trip.distance_km }} km</span>
                <span class="date">{{ trip.requested_at | date:'dd MMM, HH:mm' }}</span>
              </div>

              @if (isDriver) {
                <div class="earned">
                  💰 Earned: <strong>{{ trip.fare_estimate | currency:'KZT':'symbol':'1.0-0' }}</strong>
                </div>
              }
            </div>
          } @empty {
            <div class="card empty-state">
              <p>No completed trips yet</p>
            </div>
          }
        </div>

        @if (isDriver && historyTrips.length > 0) {
          <div class="card total-earned">
            <h3>💵 Total Earned</h3>
            <p class="big-num">{{ totalEarned | currency:'KZT':'symbol':'1.0-0' }}</p>
            <p class="muted">From {{ historyTrips.length }} completed trips</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .trips-page { display:flex; flex-direction:column; gap:20px; }
    .page-header { display:flex; justify-content:space-between; align-items:center; }
    h2 { font-size:26px; font-weight:700; }
    .btn-refresh { background:#1e293b; border:1px solid #334155; border-radius:8px;
      color:#94a3b8; padding:8px 16px; font-size:13px; cursor:pointer; }
    .tabs { display:flex; gap:12px; }
    .tabs button { background:transparent; border:1px solid #334155; border-radius:10px;
      color:#94a3b8; padding:10px 20px; font-size:14px; font-weight:600; transition:all .2s; cursor:pointer; }
    .tabs button.active { background:#0ea5e9; border-color:#0ea5e9; color:#fff; }
    .muted { color:#94a3b8; }
    .trips-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
    .trip-card { display:flex; flex-direction:column; gap:12px; }
    .trip-header { display:flex; justify-content:space-between; align-items:center; }
    .trip-id { font-weight:700; color:#38bdf8; }
    .status-badge { border-radius:20px; padding:4px 12px; font-size:12px; font-weight:600; text-transform:uppercase; }
    .status-requested{background:#1e3a5f;color:#60a5fa}
    .status-accepted{background:#14532d;color:#4ade80}
    .status-completed{background:#1a2e1a;color:#86efac}
    .status-cancelled{background:#450a0a;color:#f87171}
    .status-in_transit{background:#3b1f00;color:#fbbf24}
    .trip-body { display:flex; flex-direction:column; gap:8px; }
    .location { display:flex; align-items:center; gap:10px; font-size:14px; }
    .dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .pickup { background:#38bdf8; }
    .dropoff { background:#f43f5e; }
    .fare-row { display:flex; align-items:center; gap:12px; padding-top:8px; border-top:1px solid #334155; }
    .fare { font-weight:700; color:#4ade80; font-size:16px; }
    .dist { color:#94a3b8; font-size:13px; }
    .date { color:#94a3b8; font-size:12px; margin-left:auto; }
    .driver-box { background:#0f2438; border-radius:8px; padding:10px 12px;
      font-size:13px; display:flex; justify-content:space-between; }
    .driver-name { color:#38bdf8; font-weight:600; }
    .waiting { color:#fbbf24; font-size:13px; }
    .btn-complete { background:#6366f1; border:none; border-radius:10px;
      color:#fff; padding:10px; font-size:14px; font-weight:600; cursor:pointer; }
    .earned { background:#14532d20; border:1px solid #4ade8040; border-radius:8px;
      padding:10px 12px; font-size:14px; color:#94a3b8; }
    .earned strong { color:#4ade80; }
    .empty-state { text-align:center; padding:32px; color:#94a3b8; }
    .total-earned { text-align:center; margin-top:8px; }
    .total-earned h3 { font-size:18px; font-weight:600; margin-bottom:8px; }
    .big-num { font-size:36px; font-weight:800; color:#4ade80; }
  `]
})
export class TripsComponent implements OnInit {
  tab = 'active';
  allTrips: Trip[] = [];
  loading = false;

  get isDriver() {
    return this.auth.currentUser()?.role === 'driver';
  }

  get activeTrips() {
    return this.allTrips.filter(t =>
        ['requested', 'accepted', 'in_transit'].includes(t.status)
    );
  }

  get historyTrips() {
    return this.allTrips.filter(t =>
        ['completed', 'cancelled'].includes(t.status)
    );
  }

  get totalEarned() {
    return this.historyTrips
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.fare_estimate || 0), 0);
  }

  constructor(private tripService: TripService, public auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.tripService.getMyTrips().subscribe({
      next: (res: any) => {
        this.allTrips = Array.isArray(res) ? res : (res.results || []);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  completeTrip(id: number) {
    this.tripService.completeTrip(id).subscribe({
      next: () => {
        this.load();
        this.tab = 'history';
      }
    });
  }
}