"use client";

import { Fragment, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import type { Spot } from "@/lib/types";
import { DIFFICULTY_COLOR } from "@/lib/types";
import "leaflet/dist/leaflet.css";

const BAY_CENTER: [number, number] = [37.55, -122.25];

function FlyTo({ spot }: { spot: Spot | null }) {
  const map = useMap();
  useEffect(() => {
    // Non-destructive selection: pan to the spot but never overshoot the zoom
    // the user is already at. Tapping pin after pin used to slam every selection
    // to zoom 13, so a Bay-overview browser got yanked in 7 levels each tap and
    // gave up for the list. Keep their zoom (floor of 11 so a far-out view still
    // gets close enough to read context).
    if (spot) map.flyTo([spot.lat, spot.lng], Math.max(map.getZoom(), 11), { duration: 0.4 });
  }, [spot, map]);
  return null;
}

function FitBounds({ spots, hasSelection, enabled }: { spots: Spot[]; hasSelection: boolean; enabled: boolean }) {
  const map = useMap();
  // Intentionally depend only on [spots, map], NOT hasSelection. Closing a spot
  // (hasSelection true -> false) must not refit all pins and wipe the zoom the
  // user set while exploring nearby spots. We only refit when the spots set
  // itself changes (filters), and filter changes already clear the selection
  // upstream, so the latest closure's hasSelection is current on that re-run.
  useEffect(() => {
    // Only fit when the user has actually narrowed the set (a filter or search).
    // On the unfiltered full set, fitting all 140 spots spans Tahoe to Bakersfield
    // and forces zoom 6 — a statewide blob of overlapping pins nobody can tap. In
    // that case we keep the configured Bay center/zoom instead.
    if (!enabled) return;
    // Don't fight FlyTo when a spot is selected (e.g. landing on a /spot URL).
    if (hasSelection) return;
    if (spots.length === 0) return;
    if (spots.length === 1) {
      map.flyTo([spots[0].lat, spots[0].lng], 13, { duration: 0.4 });
      return;
    }
    const bounds = spots.map((s) => [s.lat, s.lng] as [number, number]);
    map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 13, duration: 0.5 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots, map, enabled]);
  return null;
}

type UserLocation = { lat: number; lng: number };

function FlyToUser({ location }: { location: UserLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 11, { duration: 0.6 });
  }, [location, map]);
  return null;
}

interface Props {
  spots: Spot[];
  selected: Spot | null;
  onSelect: (spot: Spot) => void;
  userLocation?: UserLocation | null;
  fitToSpots?: boolean;
}

export default function MapView({ spots, selected, onSelect, userLocation, fitToSpots = false }: Props) {
  return (
    <MapContainer
      center={BAY_CENTER}
      zoom={9}
      className="h-full w-full"
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
      />

      <FlyTo spot={selected} />
      <FitBounds spots={spots} hasSelection={!!selected} enabled={fitToSpots} />
      <FlyToUser location={userLocation ?? null} />

      {/* User location — halo + dot */}
      {userLocation && (
        <>
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={18}
            pathOptions={{ color: "transparent", fillColor: "#1A73E8", fillOpacity: 0.18, weight: 0 }}
          />
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={7}
            pathOptions={{ color: "#fff", fillColor: "#1A73E8", fillOpacity: 1, weight: 3 }}
          />
        </>
      )}

      {spots.map((spot) => {
        const isSelected = selected?.id === spot.id;
        const color = DIFFICULTY_COLOR[spot.difficulty] ?? "#6B7280";
        return (
          <Fragment key={spot.id}>
            {/* Invisible larger hit target so a finger can land on the pin. The
                visible 10px circle is far below a 44px touch target; this 20px
                transparent circle catches the tap. */}
            <CircleMarker
              center={[spot.lat, spot.lng]}
              radius={20}
              pathOptions={{ color: "transparent", fillColor: "transparent", fillOpacity: 0, weight: 0 }}
              eventHandlers={{ click: () => onSelect(spot) }}
            />
            <CircleMarker
              center={[spot.lat, spot.lng]}
              radius={isSelected ? 13 : 10}
              interactive={false}
              pathOptions={{
                color: isSelected ? "#1B2A16" : color,
                fillColor: color,
                fillOpacity: isSelected ? 1 : 0.75,
                weight: isSelected ? 3 : 2,
              }}
            />
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
