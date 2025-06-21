import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import supabase from "../lib/supabase-client";
import exifr from "exifr";
import styles from "../styles/map.module.css";

<<<<<<< Updated upstream
// Fix for default marker icons
=======
// Naprawa ikon Leaflet (wymagane!)
>>>>>>> Stashed changes
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapWithMetadata() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotosWithMetadata = async () => {
      setLoading(true);

<<<<<<< Updated upstream
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
=======
      // Pobierz aktualnie zalogowanego użytkownika
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) {
        console.error("Brak użytkownika:", userError);
>>>>>>> Stashed changes
        setLoading(false);
        return;
      }

<<<<<<< Updated upstream
      const { data: photoList, error } = await supabase
=======
      // Pobierz photo_info ze współrzędnymi
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

      // Pobierz zdjęcia użytkownika pasujące do tych ID
      const photoIds = photoInfoList.map((info) => info.photo_id);

      const { data: photoList, error: photoError } = await supabase
>>>>>>> Stashed changes
        .from("photos")
        .select("*")
        .eq("user_id", userData.user.id);

      if (error) {
        console.error("B\u0142\u0105d pobierania zdj\u0119\u0107:", error);
        setLoading(false);
        return;
      }

<<<<<<< Updated upstream
      const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];

      const enrichedPhotos = await Promise.all(
        photoList
          .filter((photo) => {
            const ext = photo.title.split(".").pop().toLowerCase();
            return imageExtensions.includes(ext);
          })
          .map(async (photo) => {
            const { data } = supabase.storage
              .from("photos")
              .getPublicUrl(photo.file_path);
            const url = data?.publicUrl;
=======
      // Połącz dane
      const mergedPhotos = photoInfoList
        .map((info) => {
          const photo = photoList.find((p) => p.id === info.photo_id);
          if (!photo) return null;

          const { data } = supabase.storage.from("photos").getPublicUrl(photo.file_path);
          return {
            id: info.id,
            title: photo.title,
            url: data?.publicUrl,
            latitude: info.latitude,
            longitude: info.longitude,
          };
        })
        .filter(Boolean);
>>>>>>> Stashed changes

            try {
              const exifData = await exifr.parse(url, { gps: true });
              return {
                ...photo,
                url,
                metadata: {
                  date: exifData?.DateTimeOriginal || null,
                  lat: exifData?.latitude,
                  lng: exifData?.longitude,
                },
              };
            } catch (err) {
              console.warn(
                "Nie uda\u0142o si\u0119 pobra\u0107 EXIF dla",
                photo.title,
                err
              );
              return {
                ...photo,
                url,
                metadata: null,
              };
            }
          })
      );

      setPhotos(enrichedPhotos);
      setLoading(false);
    };

    fetchPhotosWithMetadata();
  }, []);

  const photosWithLocation = photos.filter(
    (p) => p.metadata?.lat && p.metadata?.lng
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Mapa zdjęć z lokalizacją GPS</h1>

      {loading ? (
        <p className={styles.message}>\u0141adowanie zdj\u0119\u0107...</p>
      ) : (
        <>
          <MapContainer
            center={[52.22977, 21.01178]} // domyślnie Warszawa
            zoom={6}
            scrollWheelZoom={true}
            className={styles.map}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {photosWithLocation.map((photo) => {
              const icon = new L.Icon({
                iconUrl: photo.url,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
              });

              return (
                <Marker
                  key={photo.id}
                  position={[photo.metadata.lat, photo.metadata.lng]}
                  icon={icon}
                >
                  <Popup>
<<<<<<< Updated upstream
                    <strong>{photo.title}</strong>
                    <br />
                    {photo.metadata.date
                      ? new Date(photo.metadata.date).toLocaleString()
                      : "Brak daty"}
=======
                    <strong>{photo.title || "Bez tytułu"}</strong>
>>>>>>> Stashed changes
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          <h2 className={styles.subheading}>Zdjęcia z danymi lokalizacji:</h2>
          {photosWithLocation.length === 0 ? (
            <p className={styles.message}>
              Brak zdjęć z informacją o lokalizacji GPS.
            </p>
          ) : (
            <div className={styles.photoGrid}>
              {photosWithLocation.map((photo) => (
                <div key={photo.id} className={styles.photoCard}>
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className={styles.photoThumb}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <p className={styles.caption}>{photo.title}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
