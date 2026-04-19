import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav class="navbar">
      <a routerLink="/home" class="brand">🚕 TaxiApp</a>
      @if (auth.isLoggedIn()) {
        <div class="nav-links">
          <a routerLink="/home">Home</a>

          @if (auth.currentUser()?.role === 'rider') {
            <a routerLink="/book">Book a Ride</a>
            <a routerLink="/trips">My Trips</a>
            <a routerLink="/payments">Payments</a>
          }

          @if (auth.currentUser()?.role === 'driver') {
            <a routerLink="/driver">Orders</a>
            <a routerLink="/trips">My Trips</a>
            <a routerLink="/driver-profile">My Car</a>
          }

          <button class="btn-logout" (click)="auth.logout()">Logout</button>
        </div>
      } @else {
        <div class="nav-links">
          <a routerLink="/login">Login</a>
          <a routerLink="/register">Register</a>
        </div>
      }
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar { display:flex; justify-content:space-between; align-items:center;
              padding:16px 32px; background:#1e293b; border-bottom:1px solid #334155; }
    .brand { font-size:20px; font-weight:700; color:#38bdf8; }
    .nav-links { display:flex; gap:20px; align-items:center; }
    .nav-links a { color:#94a3b8; font-weight:500; transition:color .2s; }
    .nav-links a:hover { color:#f1f5f9; }
    .btn-logout { background:#ef4444; border:none; border-radius:8px;
                  color:#fff; padding:8px 16px; font-weight:600; cursor:pointer; }
    main { max-width:1200px; margin:0 auto; padding:32px 16px; }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}