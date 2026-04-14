import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="card auth-card">
        <h2>Create Account</h2>
        <p class="subtitle">Join TaxiApp today</p>

        @if (error) {
          <div class="error-box">{{ error }}</div>
        }

        <div class="form-group">
          <label>Username</label>
          <input [(ngModel)]="form.username" placeholder="johndoe">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input [(ngModel)]="form.email" type="email" placeholder="john@example.com">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input [(ngModel)]="form.phone" placeholder="+7 701 000 0000">
        </div>
        <div class="form-group">
          <label>Role</label>
          <select [(ngModel)]="form.role">
            <option value="rider">Rider</option>
            <option value="driver">Driver</option>
          </select>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input [(ngModel)]="form.password" type="password" placeholder="Min 8 characters">
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input [(ngModel)]="form.password2" type="password" placeholder="Repeat password">
        </div>

        <button class="btn-primary" (click)="register()" [disabled]="loading">
          {{ loading ? 'Creating…' : 'Create Account' }}
        </button>
        <p class="switch-link">Already have an account? <a routerLink="/login">Sign in</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { display:flex; justify-content:center; padding:40px 16px; }
    .auth-card { width:100%; max-width:440px; }
    h2 { font-size:28px; font-weight:700; margin-bottom:4px; }
    .subtitle { color:#94a3b8; margin-bottom:24px; }
    .form-group { margin-bottom:14px; }
    .form-group label { display:block; margin-bottom:6px; font-size:13px; color:#94a3b8; }
    .btn-primary { width:100%; margin-top:8px; }
    .switch-link { text-align:center; margin-top:16px; color:#94a3b8; font-size:14px; }
    .error-box { background:#450a0a; border:1px solid #ef4444; border-radius:8px;
                 padding:10px 14px; color:#fca5a5; margin-bottom:16px; font-size:14px; }
  `]
})
export class RegisterComponent {
  form = { username:'', email:'', phone:'', role:'rider', password:'', password2:'' };
  error = ''; loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.loading = true; this.error = '';
    this.auth.register(this.form).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (e) => {
        const errs = e.error;
        this.error = Object.values(errs).flat().join(' ') || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
