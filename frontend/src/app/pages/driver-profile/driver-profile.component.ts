import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-driver-profile',
    standalone: true,
    imports: [FormsModule, CommonModule],
    template: `
    <div class="profile-page">
      <h2>🚗 Driver Profile</h2>

      @if (profile) {
        <div class="card profile-card">
          <div class="avatar">{{ profile.user?.username?.charAt(0)?.toUpperCase() }}</div>
          <h3>{{ profile.user?.username }}</h3>
          <p class="rating">⭐ {{ profile.user?.rating }}</p>
          <span class="status-badge" [class]="'status-' + profile.status">{{ profile.status }}</span>
        </div>

        <div class="card">
          <h4>Car Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Car Model</span>
              <span class="value">{{ profile.car_model }}</span>
            </div>
            <div class="info-item">
              <span class="label">Plate Number</span>
              <span class="value">{{ profile.car_plate }}</span>
            </div>
            <div class="info-item">
              <span class="label">Car Color</span>
              <span class="value">{{ profile.car_color }}</span>
            </div>
            <div class="info-item">
              <span class="label">Total Trips</span>
              <span class="value highlight">{{ profile.total_trips }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h4>Update Car Info</h4>
          <div class="form-group">
            <label>Car Model</label>
            <input [(ngModel)]="form.car_model" placeholder="e.g. Toyota Camry">
          </div>
          <div class="form-group">
            <label>Plate Number</label>
            <input [(ngModel)]="form.car_plate" placeholder="e.g. 777 ABC 02">
          </div>
          <div class="form-group">
            <label>Car Color</label>
            <input [(ngModel)]="form.car_color" placeholder="e.g. Black">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="form.status">
              <option value="offline">Offline</option>
              <option value="available">Available</option>
            </select>
          </div>
          @if (success) {
            <div class="success-box">✅ Profile updated!</div>
          }
          @if (error) {
            <div class="error-box">{{ error }}</div>
          }
          <button class="btn-primary" (click)="updateProfile()" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

        <div class="card stats-card">
          <h4>📊 Stats</h4>
          <div class="stats-row">
            <div class="stat">
              <span class="stat-num">{{ profile.total_trips }}</span>
              <span class="stat-label">Total Trips</span>
            </div>
            <div class="stat">
              <span class="stat-num">⭐ {{ profile.user?.rating }}</span>
              <span class="stat-label">Rating</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ profile.total_trips * 450 | number:'1.0-0' }} ₸</span>
              <span class="stat-label">Est. Earned</span>
            </div>
          </div>
        </div>
      } @else {
        <div class="loading">Loading profile...</div>
      }
    </div>
  `,
    styles: [`
    .profile-page { display:flex; flex-direction:column; gap:20px; max-width:600px; }
    h2 { font-size:26px; font-weight:700; margin-bottom:4px; }
    .profile-card { text-align:center; }
    .avatar { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#0ea5e9,#6366f1);
      display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:700;
      margin:0 auto 12px; }
    .profile-card h3 { font-size:22px; font-weight:700; }
    .rating { color:#fbbf24; font-size:16px; margin:4px 0 12px; }
    .status-badge { border-radius:20px; padding:6px 16px; font-size:13px; font-weight:600; }
    .status-offline{background:#1e293b;color:#94a3b8}
    .status-available{background:#14532d;color:#4ade80}
    .status-on_trip{background:#3b1f00;color:#fbbf24}
    .card h4 { font-size:16px; font-weight:600; margin-bottom:16px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .info-item { display:flex; flex-direction:column; gap:4px; }
    .label { font-size:12px; color:#94a3b8; }
    .value { font-size:15px; font-weight:600; }
    .highlight { color:#38bdf8; }
    .form-group { margin-bottom:14px; }
    .form-group label { display:block; margin-bottom:6px; font-size:13px; color:#94a3b8; }
    .btn-primary { width:100%; margin-top:8px; }
    .success-box { background:#14532d; border:1px solid #4ade80; border-radius:8px;
      padding:10px 14px; color:#4ade80; margin-bottom:12px; }
    .error-box { background:#450a0a; border:1px solid #ef4444; border-radius:8px;
      padding:10px 14px; color:#fca5a5; margin-bottom:12px; }
    .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; text-align:center; }
    .stat-num { display:block; font-size:24px; font-weight:700; color:#38bdf8; }
    .stat-label { font-size:12px; color:#94a3b8; }
    .loading { color:#94a3b8; }
  `]
})
export class DriverProfileComponent implements OnInit {
    profile: any = null;
    form = { car_model: '', car_plate: '', car_color: '', status: 'available' };
    saving = false; success = false; error = '';

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.http.get('http://localhost:8000/api/drivers/profile/').subscribe({
            next: (data: any) => {
                this.profile = data;
                this.form.car_model = data.car_model;
                this.form.car_plate = data.car_plate;
                this.form.car_color = data.car_color;
                this.form.status    = data.status;
            }
        });
    }

    updateProfile() {
        this.saving = true; this.error = ''; this.success = false;
        this.http.patch('http://localhost:8000/api/drivers/profile/', this.form).subscribe({
            next: (data: any) => {
                this.profile = data; this.saving = false; this.success = true;
                setTimeout(() => this.success = false, 3000);
            },
            error: () => { this.error = 'Failed to update.'; this.saving = false; }
        });
    }
}