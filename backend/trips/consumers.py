import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class TripConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time trip updates.
    Riders and drivers join a trip-specific group and receive live events.
    """

    async def connect(self):
        self.trip_id    = self.scope["url_route"]["kwargs"]["trip_id"]
        self.group_name = f"trip_{self.trip_id}"

        # Join the trip channel group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(json.dumps({"type": "connection_established", "trip_id": self.trip_id}))

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
        except (json.JSONDecodeError, TypeError):
            return

        event_type = data.get("type")

        if event_type == "location_update":
            # Driver broadcasts their live GPS
            await self.channel_layer.group_send(self.group_name, {
                "type":      "driver_location",
                "latitude":  data.get("latitude"),
                "longitude": data.get("longitude"),
                "trip_id":   self.trip_id,
            })

        elif event_type == "status_update":
            await self.channel_layer.group_send(self.group_name, {
                "type":   "trip_status",
                "status": data.get("status"),
            })

        elif event_type == "chat_message":
            await self.channel_layer.group_send(self.group_name, {
                "type":    "chat_message",
                "message": data.get("message"),
                "sender":  data.get("sender"),
            })

    # ── Handlers (called by channel layer) ────────────────────────────────────

    async def driver_location(self, event):
        await self.send(json.dumps({
            "type":      "driver_location",
            "latitude":  event["latitude"],
            "longitude": event["longitude"],
        }))

    async def trip_status(self, event):
        await self.send(json.dumps({
            "type":   "trip_status",
            "status": event["status"],
        }))

    async def chat_message(self, event):
        await self.send(json.dumps({
            "type":    "chat_message",
            "message": event["message"],
            "sender":  event["sender"],
        }))


class DriverAvailabilityConsumer(AsyncWebsocketConsumer):
    """
    Broadcasts nearby driver locations to rider's map in real time.
    Group: 'riders_map'
    """

    async def connect(self):
        self.group_name = "riders_map"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        pass  # Read-only consumer; drivers push via REST

    async def driver_position(self, event):
        await self.send(json.dumps(event))
