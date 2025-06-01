import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";

export default function PublicGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [savingId, setSavingId] = useState(null);

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        return;
      }

      const { data: photoList, error } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", userData.user.id);

      if (error) {
        console.error("Błąd pobierania zdjęć:", error);
        setLoading(false);
        return;
      }

      const photosWithUrls = await Promise.all(
        photoList
          .filter((photo) => {
            const ext = photo.title?.split(".").pop()?.toLowerCase();
            return ext && imageExtensions.includes(ext);
          })
          .map(async (photo) => {
            const { data } = supabase.storage.from("photos").getPublicUrl(photo.file_path);
            return {
              ...photo,
              url: data.publicUrl,
            };
          })
      );

      setPhotos(photosWithUrls);
      setLoading(false);
    };

    fetchPhotos();
  }, []);

  const handleChange = (id, field, value) => {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (photo) => {
    const edited = editing[photo.id];
    if (!edited) return;

    setSavingId(photo.id);

    const updates = {
      title: edited.title ?? photo.title,
      description: edited.description ?? photo.description,
      tags: edited.tags ?? photo.tags,
      gps_lat: edited.gps_lat ?? photo.gps_lat,
      gps_lng: edited.gps_lng ?? photo.gps_lng,
    };

    const { error } = await supabase
      .from("photos")
      .update(updates)
      .eq("id", photo.id);

    if (error) {
      alert("Błąd zapisu metadanych");
    } else {
      alert("Zapisano zmiany");
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, ...updates } : p))
      );
      setEditing((prev) => ({ ...prev, [photo.id]: {} }));
    }

    setSavingId(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Podgląd i Edycja Metadanych</h1>

      {loading ? (
        <p>Ładowanie zdjęć...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {photos.map((photo) => {
            const edit = editing[photo.id] || {};
            return (
              <div
                key={photo.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  style={{ width: "100%", borderRadius: "6px" }}
                />
                <div style={{ marginTop: "10px" }}>
                  <label>
                    Tytuł:
                    <input
                      type="text"
                      value={edit.title ?? photo.title ?? ""}
                      onChange={(e) => handleChange(photo.id, "title", e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </label>
                  <label>
                    Opis:
                    <textarea
                      value={edit.description ?? photo.description ?? ""}
                      onChange={(e) => handleChange(photo.id, "description", e.target.value)}
                      style={{ width: "100%", minHeight: "60px" }}
                    />
                  </label>
                  <label>
                    Tagi (oddziel przecinkami):
                    <input
                      type="text"
                      value={edit.tags ?? photo.tags ?? ""}
                      onChange={(e) => handleChange(photo.id, "tags", e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </label>
                  <label>
                    GPS Latitude:
                    <input
                      type="number"
                      step="any"
                      value={edit.gps_lat ?? photo.gps_lat ?? ""}
                      onChange={(e) => handleChange(photo.id, "gps_lat", e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </label>
                  <label>
                    GPS Longitude:
                    <input
                      type="number"
                      step="any"
                      value={edit.gps_lng ?? photo.gps_lng ?? ""}
                      onChange={(e) => handleChange(photo.id, "gps_lng", e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </label>

                  <button
                    onClick={() => handleSave(photo)}
                    disabled={savingId === photo.id}
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {savingId === photo.id ? "Zapisywanie..." : "Zapisz zmiany"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
