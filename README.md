# TaxiClone

Managing a taxi fleet shouldn't be complicated.  
TaxiClone is a full-stack web platform that gives operators complete control over their drivers, passengers, trips and stations — all from a single intuitive dashboard.
From assigning drivers to monitoring active trips across an interactive map, TaxiClone brings structure to the chaos of urban transportation management.

### Group Members: Ulykbek Dias, Chalak Hatef, Kerimbi Zhanerke

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular, TypeScript |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL |
| Auth | JWT (SimpleJWT) |
| Map | Leaflet.js + OpenStreetMap |

---

## Features
Authentication: Secure login and logout using JWT tokens with HTTP interceptor.
Driver Management: Register, update and remove drivers. Each driver is linked to a trip.
Passenger Management: Full passenger profiles with trip assignment and booking history.
Fleet Management: Track and manage all vehicles across the fleet.
Station Management: Define pickup and drop-off points with real map coordinates.
Trip Management: Passengers can book trips between stations and get assigned a driver.
Dashboard: Live overview of total drivers, passengers, active trips and fleets.
Interactive Map: All stations are visualized on a real Almaty map using Leaflet.js. Click any marker to view station details and available trips.

---

## User Roles

| Role | Access |
|---|---|
| **Admin** | Full control — manage drivers, fleets, stations, trips |
| **Passenger** | Book trips, view history, track assigned driver |
