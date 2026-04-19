import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [CommonModule],
    template: `
      <h2>💳 Payment History</h2>
    
      <button class="btn-refresh" (click)="load()">🔄 Refresh</button>
    
      @if (loading) {
        <p class="muted">Loading...</p>
      }
    
      @if (payments.length > 0) {
        <div class="total-card card">
          <span class="total-label">Total Spent</span>
          <span class="total-amount">{{ totalSpent | currency:'KZT':'symbol':'1.0-0' }}</span>
        </div>
      }
    
      <div class="list">
        @for (p of payments; track p.id) {
          <div class="card payment-card">
            <div class="left">
              <span class="trip-id">Trip #{{ p.trip }}</span>
              <span class="method">💵 Cash Payment</span>
              <span class="date">{{ p.created_at | date:'dd MMM yyyy, HH:mm' }}</span>
            </div>
            <div class="right">
              <span class="amount">{{ p.amount | currency:'KZT':'symbol':'1.0-0' }}</span>
              <span class="status-badge s-succeeded">✅ Paid</span>
            </div>
          </div>
        } @empty {
          <div class="card empty">
            <p>No payments yet</p>
            <p class="sub">Payments appear here after trip is completed</p>
          </div>
        }
      </div>
    `,

    styles: [`
        h2 { font-size:26px; font-weight:700; margin-bottom:16px; }
        .btn-refresh { background:#1e293b; border:1px solid #334155; border-radius:8px;
            color:#94a3b8; padding:8px 16px; font-size:13px; cursor:pointer; margin-bottom:20px; }
        .muted { color:#94a3b8; }
        .total-card { display:flex; justify-content:space-between; align-items:center;
            margin-bottom:16px; background:linear-gradient(135deg,#14532d,#166534); border:none; }
        .total-label { font-size:14px; color:#86efac; }
        .total-amount { font-size:28px; font-weight:800; color:#4ade80; }
        .list { display:flex; flex-direction:column; gap:12px; }
        .payment-card { display:flex; justify-content:space-between; align-items:center; }
        .left { display:flex; flex-direction:column; gap:4px; }
        .trip-id { font-weight:600; color:#38bdf8; }
        .method { font-size:12px; color:#94a3b8; }
        .date { font-size:12px; color:#64748b; }
        .right { display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
        .amount { font-size:20px; font-weight:700; color:#4ade80; }
        .status-badge { border-radius:20px; padding:3px 10px; font-size:11px; font-weight:600; }
        .s-succeeded { background:#14532d; color:#4ade80; }
        .empty { text-align:center; color:#94a3b8; padding:32px; }
        .sub { font-size:13px; margin-top:6px; }
    `],
})
export class PaymentsComponent implements OnInit {
    payments: any[] = [];
    loading = true;

    get totalSpent() {
        return this.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    }

    constructor(private paymentService: PaymentService) {}

    ngOnInit() { this.load(); }

    load() {
        this.loading = true;
        this.paymentService.getPaymentHistory().subscribe({
            next: (data: any) => {
                this.payments = Array.isArray(data) ? data : (data.results || []);
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }
}