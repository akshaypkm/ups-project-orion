import React, { useMemo, useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Polyline, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "350px",
};

// ✅ Official Google polyline decode logic (clean)
function decodePolyline(encoded) {
  if (!encoded) return [];

  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates = [];

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coordinates;
}

export default function RouteMap({ encodedPolyline }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAT3JLAYrONL07aN7lyWPdTfnGg-MyGZZ8",
  });

  const [map, setMap] = useState(null);

  const path = useMemo(() => decodePolyline(encodedPolyline), [encodedPolyline]);

  // ✅ Correct fitting logic
  useEffect(() => {
    if (!map || path.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));

    // Delay ensures accordion + CSS settle
    setTimeout(() => {
      map.fitBounds(bounds);
    }, 300);
  }, [map, path]);

  if (!isLoaded) return <div className="w-full h-full bg-gray-100" />;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      onLoad={setMap}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {path.length > 1 && (
        <Polyline
          path={path}
          options={{
            strokeColor: "#059669",
            strokeOpacity: 1,
            strokeWeight: 6,
          }}
        />
      )}

      {path[0] && (
        <Marker position={path[0]} label="A" />
      )}

      {path.length > 1 && (
        <Marker position={path[path.length - 1]} label="B" />
      )}
    </GoogleMap>
  );
}
