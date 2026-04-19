import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

const authGuard = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  return true;
};

export const routes: Routes = [
  { path: '',        redirectTo: 'home', pathMatch: 'full' },
  { path: 'login',   loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register',loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'home',    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), canActivate: [authGuard] },
  { path: 'book',    loadComponent: () => import('./pages/book-trip/book-trip.component').then(m => m.BookTripComponent), canActivate: [authGuard] },
  { path: 'trips',   loadComponent: () => import('./pages/trips/trips.component').then(m => m.TripsComponent), canActivate: [authGuard] },
  { path: 'map/:id', loadComponent: () => import('./pages/map-tracking/map-tracking.component').then(m => m.MapTrackingComponent), canActivate: [authGuard] },
  { path: 'driver', loadComponent: () => import('./pages/driver-trips/driver-trips.component').then(m => m.DriverTripsComponent), canActivate: [authGuard] },
  { path: 'driver-profile', loadComponent: () => import('./pages/driver-profile/driver-profile.component').then(m => m.DriverProfileComponent), canActivate: [authGuard] },
  { path: 'payments', loadComponent: () => import('./pages/payments/payments.component').then(m => m.PaymentsComponent), canActivate: [authGuard] },
];
