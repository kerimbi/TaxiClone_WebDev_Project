@api_view(["GET"])
@permission_classes([IsAuthenticated])
def nearby_drivers(request):
    lat    = float(request.query_params["lat"])
    lng    = float(request.query_params["lng"])
    radius = float(request.query_params.get("radius", 5))

    user_location = Point(lng, lat, srid=4326)

    drivers = (
        DriverProfile.objects
        .filter(status=DriverProfile.Status.AVAILABLE, location__isnull=False)
        .filter(location__distance_lte=(user_location, D(km=radius)))
        .annotate(distance=Distance("location", user_location))
        .order_by("distance")[:20]
    )
    return Response(DriverProfileSerializer(drivers, many=True).data)