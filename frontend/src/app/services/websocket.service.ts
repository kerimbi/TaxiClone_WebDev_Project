import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface WsMessage {
  type: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket!: WebSocket;
  private messages$ = new Subject<WsMessage>();

  constructor(private zone: NgZone) {}

  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      this.zone.run(() => {
        try {
          this.messages$.next(JSON.parse(event.data));
        } catch { /* ignore malformed frames */ }
      });
    };

    this.socket.onerror = (err) => console.error('WS error', err);
    this.socket.onclose = () => console.log('WS closed');
  }

  connectToTrip(tripId: number): void {
    this.connect(`ws://localhost:8001/ws/trip/${tripId}/`);
  }

  connectToMap(): void {
    this.connect('ws://localhost:8001/ws/map/');
  }

  send(data: object): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  sendLocation(latitude: number, longitude: number): void {
    this.send({ type: 'location_update', latitude, longitude });
  }

  getMessages(): Observable<WsMessage> {
    return this.messages$.asObservable();
  }

  disconnect(): void {
    this.socket?.close();
  }
}
