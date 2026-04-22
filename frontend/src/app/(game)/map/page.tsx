import { MapContainer } from "@/components/map/MapContainer";

/**
 * Karte — Map Screen (F5)
 * Nutzt den interaktiven MapContainer mit Pinch-To-Zoom und Panning.
 */
export default function MapPage() {
  return (
    <div className="w-full h-full relative">
      <MapContainer />
    </div>
  );
}
