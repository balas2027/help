// "use client";
// import { useEffect, useRef } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// export default function RoutingMap({ from, to, fromname, toname }) {
//   const mapRef = useRef(null);
//   const markersRef = useRef([]); // store markers to remove later
//   const routeLayersRef = useRef([]); // store route layers to remove later

//   delete L.Icon.Default.prototype._getIconUrl;
//   L.Icon.Default.mergeOptions({
//     iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//     iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//   });

//   // Function to clear all routes and markers
//   const clearAllLayers = () => {
//     if (!mapRef.current) return;
    
//     // Clear tracked markers
//     markersRef.current.forEach((marker) => mapRef.current.removeLayer(marker));
//     markersRef.current = [];
    
//     // Clear tracked route layers
//     routeLayersRef.current.forEach((layer) => mapRef.current.removeLayer(layer));
//     routeLayersRef.current = [];

//     // Comprehensive cleanup of all non-tile layers
//     mapRef.current.eachLayer((layer) => {
//       // Remove everything except the base tile layer
//       if (!(layer instanceof L.TileLayer)) {
//         mapRef.current.removeLayer(layer);
//       }
//     });
//   };

//   useEffect(() => {
//     // Initialize map only once
//     if (!mapRef.current) {
//       mapRef.current = L.map("map").setView([13.0827, 80.2707], 11)

//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution: "&copy; OpenStreetMap contributors",
//       }).addTo(mapRef.current)
//     }

//     // Always clear everything first
//     clearAllLayers()

//     // If both coordinates are null, just show default view
//     if (!from || !to) {
//       mapRef.current.setView([13.0827, 80.2707], 11)
//       return
//     }

//     // If both from and to coordinates are provided, show route
//     if (from && to && from.length === 2 && to.length === 2) {
//       const [fromLat, fromLng] = from
//       const [toLat, toLng] = to

//       // Add markers
//       const fromMarker = L.marker([fromLat, fromLng]).addTo(mapRef.current).bindPopup(`From: ${fromname}`)
//       const toMarker = L.marker([toLat, toLng]).addTo(mapRef.current).bindPopup(`To: ${toname}`)
//       markersRef.current.push(fromMarker, toMarker)

//       // Fetch and draw route
//       const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
//       fetch(url)
//         .then((res) => res.json())
//         .then((result) => {
//           if (!result.routes || result.routes.length === 0) return
//           const route = result.routes[0].geometry
//           const geojson = L.geoJSON(route, {
//             style: {
//               color: '#000',
//               weight: 4,
//               opacity: 0.7
//             }
//           }).addTo(mapRef.current)
          
//           routeLayersRef.current.push(geojson)
//           mapRef.current.fitBounds(geojson.getBounds())
//         })
//         .catch((err) => console.error("Routing error", err))
//     }

//   }, [from, to, fromname, toname])

//   return <div id="map" style={{ height: "100%", width: "100%" }}></div>;
// }

"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function RoutingMap({ from, to, fromname, toname , handleDistanceUpdate }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayersRef = useRef([]);
  const [distance, setDistance] = useState(null);
 
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });



  const clearAllLayers = () => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    markersRef.current = [];
    routeLayersRef.current.forEach((l) => mapRef.current.removeLayer(l));
    routeLayersRef.current = [];
    mapRef.current.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        mapRef.current.removeLayer(layer);
      }
    });
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([13.0827, 80.2707], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    clearAllLayers();

    if (!from || !to) {
      mapRef.current.setView([13.0827, 80.2707], 11);
      return;
    }

    if (from && to && from.length === 2 && to.length === 2) {
      const [fromLat, fromLng] = from;
      const [toLat, toLng] = to;

      const fromMarker = L.marker([fromLat, fromLng]).addTo(mapRef.current).bindPopup(`From: ${fromname}`);
      const toMarker = L.marker([toLat, toLng]).addTo(mapRef.current).bindPopup(`To: ${toname}`);
      markersRef.current.push(fromMarker, toMarker);

      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      fetch(url)
        .then((res) => res.json())
        .then((result) => {
          if (!result.routes || result.routes.length === 0) return;
          const route = result.routes[0].geometry;

          // 🚀 Get distance (meters) and convert to km
          const distMeters = result.routes[0].distance;
          const distKm = (distMeters / 1000).toFixed(2);
          setDistance(distKm);
           
          


          const geojson = L.geoJSON(route, {
            style: { color: "#000", weight: 4, opacity: 0.7 },
          }).addTo(mapRef.current);

          routeLayersRef.current.push(geojson);
          mapRef.current.fitBounds(geojson.getBounds());
        })
        .catch((err) => console.error("Routing error", err));
    }
  }, [from, to, fromname, toname]);
  useEffect(() => {
    
      handleDistanceUpdate(distance);
    
  }, [distance, handleDistanceUpdate]);
  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <div id="map" className="z-index-0" style={{ height: "100%", width: "100%" }}></div>

      
        
      
    </div>
  );
}
