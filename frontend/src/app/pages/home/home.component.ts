import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TripService } from '../../services/trip.service';
import { Trip } from '../../models/trip.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="hero">
      <h1>Hello, {{ user?.username }} 👋</h1>
      <p class="role-badge">{{ user?.role | titlecase }}</p>
    </div>

    <div class="stats-row">
      <div class="card stat-card">
        <span class="stat-num">{{ trips.length }}</span>
        <span class="stat-label">Total Trips</span>
      </div>
      <div class="card stat-card">
        <span class="stat-num">⭐ {{ user?.rating }}</span>
        <span class="stat-label">Your Rating</span>
      </div>
      <div class="card stat-card">
        <span class="stat-num">{{ activeTrips }}</span>
        <span class="stat-label">Active Trips</span>
      </div>
    </div>

    @if (user?.role === 'rider') {
      <div class="cta-section card">
        <h3>Where are you going?</h3>
        <p>Book a safe and affordable ride in seconds.</p>
        <a routerLink="/book" class="btn-primary" style="display:inline-block; margin-top:16px;">
          Book a Ride →
        </a>
      </div>
    }

    @if (user?.role === 'driver') {
      <div class="cta-section card">
        <h3>Available trips </h3>
        <p>Take orders and earn money.</p>
        <a routerLink="/trips" class="btn-primary" style="display:inline-block; margin-top:16px;">
          View orders →
        </a>
      </div>
    }
    
    <h3 class="section-title">Recent Trips</h3>
    <div class="trips-list">
      @for (trip of trips.slice(0, 5); track trip.id) {
        <div class="card trip-card">
          <div class="trip-info">
            <span class="trip-route">{{ trip.pickup_address }} → {{ trip.dropoff_address }}</span>
            <span class="trip-date">{{ trip.requested_at | date:'short' }}</span>
          </div>
          <span class="status-badge" [class]="'status-' + trip.status">{{ trip.status }}</span>
        </div>
      } @empty {
        <p class="empty">No trips yet. Book your first ride!</p>
      }
    </div>
  `,
  styles: [`
    .hero { margin-bottom:32px; }
    .hero h1 { font-size:32px; font-weight:700; margin-bottom:8px; }
    .role-badge { background:#0ea5e920; color:#38bdf8; border-radius:20px;
                  display:inline-block; padding:4px 14px; font-size:13px; font-weight:600; }
    .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:32px; }
    .stat-card { text-align:center; }
    .stat-num { display:block; font-size:28px; font-weight:700; color:#38bdf8; }
    .stat-label { font-size:13px; color:#94a3b8; }
    .cta-section { margin-bottom:32px; }
    .cta-section h3 { font-size:20px; font-weight:600; }
    .cta-section p { color:#94a3b8; margin-top:4px; }
    .section-title { font-size:18px; font-weight:600; margin-bottom:16px; }
    .trips-list { display:flex; flex-direction:column; gap:12px; }
    .trip-card { display:flex; justify-content:space-between; align-items:center; }
    .trip-info { display:flex; flex-direction:column; gap:4px; }
    .trip-route { font-weight:500; }
    .trip-date { font-size:12px; color:#94a3b8; }
    .status-badge { border-radius:20px; padding:4px 12px; font-size:12px; font-weight:600; text-transform:uppercase; }
    .status-requested  { background:#1e3a5f; color:#60a5fa; }
    .status-accepted   { background:#14532d; color:#4ade80; }
    .status-completed  { background:#1a2e1a; color:#86efac; }
    .status-cancelled  { background:#450a0a; color:#f87171; }
    .status-in_transit { background:#3b1f00; color:#fbbf24; }
    .empty { color:#94a3b8; font-style:italic; }
  `]
})
export class HomeComponent implements OnInit {
  trips: Trip[] = [];
  get user() { return this.auth.currentUser(); }
  get activeTrips() { return this.trips.filter(t => ['requested','accepted','in_transit'].includes(t.status)).length; }

  constructor(private auth: AuthService, private tripService: TripService) {}

  ngOnInit() {
    this.tripService.getMyTrips().subscribe({
      next: (res: any) => {
        this.trips = Array.isArray(res) ? res : (res.results || []);
      }
    });
  }
}
