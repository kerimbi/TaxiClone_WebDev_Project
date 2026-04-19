export type TripStatus = 'requested' | 'accepted' | 'in_transit' | 'completed' | 'cancelled';

export interface Trip {
  id: number;
  rider: any;
  driver?: any;
  status: TripStatus;
  pickup_address: string;
  dropoff_address: string;
  fare_estimate?: number;
  fare_final?: number;
  distance_km?: number;
  requested_at: string;
}

export interface CreateTripPayload {
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  pickup_address: string;
  dropoff_address: string;
}

export interface NearbyDriver {
  id: number;
  user: any;
  car_model: string;
  car_plate: string;
  car_color: string;
  status: string;
  latitude: number;
  longitude: number;
}
