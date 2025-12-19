import React, { useMemo, useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Polyline, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "350px",
};

function decodePolyline(encoded) {
  if (!encoded) return [];
  let index = 0, lat = 0, lng = 0;
  const coords = [];

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;

    coords.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coords;
}

export default function RouteMap({ encodedPolyline, routeStops = [] }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAT3JLAYrONL07aN7lyWPdTfnGg-MyGZZ8",
  });

  const [map, setMap] = useState(null);
  const path = useMemo(() => decodePolyline(encodedPolyline), [encodedPolyline]);

  useEffect(() => {
    if (!map || path.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    routeStops.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
    setTimeout(() => map.fitBounds(bounds), 300);
  }, [map, path, routeStops]);

  if (!isLoaded) return <div className="w-full h-full bg-gray-100" />;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      onLoad={setMap}
      options={{ disableDefaultUI: true, zoomControl: true }}
    >
      {/* ROUTE LINE */}
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

      {/* STOPS */}
      {routeStops.map((stop, idx) => {
        const isPickup = stop.stopType === "PICKUP";


       

        return (
          <Marker
            key={`${stop.orderId}-${idx}`}
            position={{ lat: stop.lat, lng: stop.lng }}
            label={{
              text: `${stop.orderCode}(${stop.sequence})`,
              color: isPickup ? "green" : "red",
              fontSize: "12px",
              fontWeight: "bold",
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: isPickup ? "#16a34a" : "#dc2626",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            }}
          />
        );
      })}

       {/* FALLBACK MARKERS FOR SINGLE ORDER */}
      {routeStops.length === 0 && path.length > 1 && (
        <>
          {/* START */}
          <Marker
            position={path[0]}
            label={{
              text: "START",
              color: "#166534",
              fontWeight: "bold",
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: "#16a34a",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            }}
          />

          {/* END */}
          <Marker
            position={path[path.length - 1]}
            label={{
              text: "END",
              color: "#7f1d1d",
              fontWeight: "bold",
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: "#dc2626",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            }}
          />
        </>
      )}
    </GoogleMap>
  );
}
