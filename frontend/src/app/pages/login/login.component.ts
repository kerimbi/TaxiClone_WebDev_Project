import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="card auth-card">
        <h2>Welcome back 👋</h2>
        <p class="subtitle">Sign in to continue</p>

        @if (error) {
          <div class="error-box">{{ error }}</div>
        }

        <div class="form-group">
          <label>Username</label>
          <input [(ngModel)]="username" type="text" placeholder="your_username">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input [(ngModel)]="password" type="password" placeholder="••••••••">
        </div>
        <button class="btn-primary" (click)="login()" [disabled]="loading">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
        <p class="switch-link">No account? <a routerLink="/register">Register</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { display:flex; justify-content:center; align-items:center; min-height:80vh; }
    .auth-card { width:100%; max-width:420px; }
    h2 { font-size:28px; font-weight:700; margin-bottom:4px; }
    .subtitle { color:#94a3b8; margin-bottom:24px; }
    .form-group { margin-bottom:16px; }
    .form-group label { display:block; margin-bottom:6px; font-size:13px; color:#94a3b8; }
    .btn-primary { width:100%; margin-top:8px; }
    .switch-link { text-align:center; margin-top:16px; color:#94a3b8; font-size:14px; }
    .error-box { background:#450a0a; border:1px solid #ef4444; border-radius:8px;
                 padding:10px 14px; color:#fca5a5; margin-bottom:16px; font-size:14px; }
  `]
})
export class LoginComponent {
  username = ''; password = ''; error = ''; loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true; this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (e) => { this.error = e.error?.detail || 'Login failed'; this.loading = false; }
    });
  }
}
