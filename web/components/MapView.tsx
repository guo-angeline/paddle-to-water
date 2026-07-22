"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import type { Spot } from "@/lib/types";
import { DIFFICULTY_COLOR } from "@/lib/types";
import type { SpotViewedSource } from "@/lib/analytics";
import "leaflet/dist/leaflet.css";

// Item 108 (2026-07-22): the cold, no-location, unfiltered default frames the
// whole STATE, not the Bay. The site rebranded to "across California" the same
// week 29 SoCal spots (LA, San Diego, Orange County, Ventura) landed, but the
// map still opened on [37.55, -122.25] zoom 9, so a first-time SoCal visitor,
// exactly the audience the expansion was for, saw a Bay-only map that
// contradicted the headline. Spots run lat 32.6 to 41.2, lng -124.2 to -117.1;
// this center at zoom 6 shows every cluster. A granted location still overrides
// via FlyToUser (zoom 11), and any filter/search tightens via FitBounds, so this
// only sets the "just landed, no signal yet" frame.
//
// Center longitude is the spot centroid (~-120.5), NOT biased inland: at zoom 6
// a 375px mobile viewport only spans ~8.2deg of longitude, and an inland center
// (-119.7 was the first try) clipped the westernmost coast spots (-124.2) off
// the left edge. -120.5 keeps both the outer coast and the eastern Sierra in
// frame on mobile and desktop (verified with the Mercator viewport math, since
// a concurrent dev server blocked a live browser check).
const CA_CENTER: [number, number] = [37.0, -120.5];
const CA_ZOOM = 6;

function FlyTo({ spot }: { spot: Spot | null }) {
  const map = useMap();
  useEffect(() => {
    // Non-destructive selection: pan to the spot but never overshoot the zoom
    // the user is already at. Tapping pin after pin used to slam every selection
    // to zoom 13, so a Bay-overview browser got yanked in 7 levels each tap and
    // gave up for the list. Keep their zoom (floor of 11 so a far-out view still
    // gets close enough to read context).
    // Guard against a hidden (zero-size) container. On mobile the map panel is
    // display:none while the List tab is active but MapView stays mounted, so a
    // list tap changes `selected` and fires flyTo on a 0x0 map. Leaflet derives
    // the target center from the container's pixel size; dividing by zero yields
    // (NaN, NaN), which it throws as an uncaught "Invalid LatLng". That throw also
    // blanked the conditions panel on the same commit. When the Map tab becomes
    // visible, ResizeHandler re-centers on the current selection.
    if (spot && map.getSize().x > 0) map.flyTo([spot.lat, spot.lng], Math.max(map.getZoom(), 11), { duration: 0.4 });
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
    // On the unfiltered full set we do NOT fit: that would force a zoom where
    // the Bay and SoCal clusters overlap into an untappable blob. The static
    // CA_CENTER/CA_ZOOM default (item 108) already frames the whole state for a
    // cold visitor, and the list panel is the tap surface at that overview zoom;
    // fitting only kicks in once a filter or search narrows the set.
    if (!enabled) return;
    // Don't fight FlyTo when a spot is selected (e.g. landing on a /spot URL).
    if (hasSelection) return;
    // Hidden container (mobile List tab): flyToBounds divides by a 0x0 size and
    // throws Invalid LatLng, same as FlyTo above. Skip; ResizeHandler recomputes.
    if (map.getSize().x === 0) return;
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
    if (location && map.getSize().x > 0) map.flyTo([location.lat, location.lng], 11, { duration: 0.6 });
  }, [location, map]);
  return null;
}

// When the map container transitions from hidden (0x0, the mobile List tab) to
// visible (Map tab shown), Leaflet still holds the stale zero size and paints
// gray tiles. Recompute the size, then re-center on the current selection so the
// "tap a spot in the List, switch to Map" path lands on that spot instead of the
// default statewide overview. `selected` is read through a ref so the observer is set
// up once per map, not re-subscribed on every selection change.
function ResizeHandler({ selected }: { selected: Spot | null }) {
  const map = useMap();
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const wasHidden = useRef(true);
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => {
      const visible = map.getSize().x > 0;
      if (visible && wasHidden.current) {
        wasHidden.current = false;
        map.invalidateSize();
        const spot = selectedRef.current;
        if (spot) map.flyTo([spot.lat, spot.lng], Math.max(map.getZoom(), 11), { duration: 0 });
      } else if (!visible) {
        wasHidden.current = true;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

interface Props {
  spots: Spot[];
  selected: Spot | null;
  onSelect: (spot: Spot, source?: SpotViewedSource) => void;
  userLocation?: UserLocation | null;
  fitToSpots?: boolean;
}

export default function MapView({ spots, selected, onSelect, userLocation, fitToSpots = false }: Props) {
  // One shared Canvas renderer for all pins. Canvas repaints the whole spot layer
  // in a single draw call on pan/zoom, vs. SVG mutating one DOM node per marker
  // (the slow path that made moving the map stutter). `tolerance` adds a click
  // buffer around each circle, so a small visible pin still has a finger-sized hit
  // area without needing a second invisible marker. `padding` pre-renders a margin
  // beyond the viewport so edge pins don't pop in mid-pan.
  const renderer = useMemo(() => L.canvas({ tolerance: 12, padding: 0.5 }), []);

  return (
    <MapContainer
      center={CA_CENTER}
      zoom={CA_ZOOM}
      className="h-full w-full isolate"
      zoomControl={false}
      preferCanvas={true}
    >
      {/* Zoom control on the right (owner request, item 33). Top-right is clear
          of the bottom-left legend, the mobile bottom sheet, and the desktop
          drawer (a sibling panel to the right of the map, not an overlay). */}
      <ZoomControl position="topright" />

      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
        keepBuffer={4}
        updateWhenZooming={false}
      />

      <FlyTo spot={selected} />
      <ResizeHandler selected={selected} />
      <FitBounds spots={spots} hasSelection={!!selected} enabled={fitToSpots} />
      <FlyToUser location={userLocation ?? null} />

      {/* User location — halo + dot. Must use the SAME shared `renderer` as the
          spot pins. Without an explicit renderer these markers spin up Leaflet's
          default preferCanvas renderer, adding a SECOND canvas to the overlay
          pane. Because it mounts after the spot canvas (location resolves async),
          it stacks on top and swallows every click — pins became unclickable and
          the cursor stuck on grab for anyone with location granted (auto-center)
          or who tapped Near Me. One renderer, one canvas, one hit-test surface. */}
      {userLocation && (
        <>
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={18}
            renderer={renderer}
            pathOptions={{ color: "transparent", fillColor: "#0E6FD1", fillOpacity: 0.18, weight: 0 }}
          />
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={7}
            renderer={renderer}
            pathOptions={{ color: "#fff", fillColor: "#0E6FD1", fillOpacity: 1, weight: 3 }}
          />
        </>
      )}

      {spots.map((spot) => {
        const isSelected = selected?.id === spot.id;
        const color = DIFFICULTY_COLOR[spot.difficulty] ?? "#8AA0B4";
        return (
          <CircleMarker
            key={spot.id}
            center={[spot.lat, spot.lng]}
            radius={isSelected ? 13 : 10}
            renderer={renderer}
            pathOptions={{
              color: isSelected ? "#0B2A47" : color,
              fillColor: color,
              fillOpacity: isSelected ? 1 : 0.75,
              weight: isSelected ? 3 : 2,
            }}
            eventHandlers={{ click: () => onSelect(spot, "map") }}
          />
        );
      })}
    </MapContainer>
  );
}
