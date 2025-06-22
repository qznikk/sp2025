import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import supabase from "../lib/supabase-client";

// Naprawa ikon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapWithMetadata() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: photoInfoList, error: infoError } = await supabase
        .from("photo_info")
        .select("id, photo_id, latitude, longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (infoError) {
        console.error("Błąd pobierania photo_info:", infoError);
        setLoading(false);
        return;
      }

      const photoIds = photoInfoList.map((info) => info.photo_id);

      const { data: photoList, error: photoError } = await supabase
        .from("photos")
        .select("id, file_path, title")
        .in("id", photoIds)
        .eq("user_id", user.id);

      if (photoError) {
        console.error("Błąd pobierania photos:", photoError);
        setLoading(false);
        return;
      }

      const mergedPhotos = photoInfoList.map((info) => {
        const matchingPhoto = photoList.find((photo) => photo.id === info.photo_id);
        if (!matchingPhoto) return null;

        const { data } = supabase.storage.from("photos").getPublicUrl(matchingPhoto.file_path);
        return {
          id: info.id,
          title: matchingPhoto.title,
          url: data?.publicUrl,
          latitude: info.latitude,
          longitude: info.longitude,
        };
      }).filter(Boolean);

      setPhotos(mergedPhotos);
      setLoading(false);
    };

    fetchPhotos();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
        Mapa zdjęć z lokalizacją GPS
      </h1>

      {loading ? (
        <p>Ładowanie zdjęć...</p>
      ) : (
        <>
          <MapContainer
            center={[52.22977, 21.01178]}
            zoom={6}
            scrollWheelZoom={true}
            style={{ height: "600px", width: "100%", marginBottom: "30px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {photos.map((photo) => {
              const icon = new L.Icon({
                iconUrl: photo.url,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
              });

              return (
                <Marker
                  key={photo.id}
                  position={[photo.latitude, photo.longitude]}
                  icon={icon}
                >
                  <Popup>
                    <strong>{photo.title}</strong>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>
            Zdjęcia z danymi lokalizacji:
          </h2>
          {photos.length === 0 ? (
            <p>Brak zdjęć z informacją o lokalizacji GPS.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "16px",
              }}
            >
              {photos.map((photo) => (
                <div key={photo.id} style={{ textAlign: "center" }}>
                  <img
                    src={photo.url}
                    alt={photo.title}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      pointerEvents: "none",
                    }}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                    {photo.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
