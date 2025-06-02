import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";
import exifr from "exifr";
import styles from "../styles/albums.module.css";

export default function Albums() {
  const [albums, setAlbums] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const isImageFile = (filename) => {
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  useEffect(() => {
    const fetchAndGroupPhotos = async () => {
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
        console.error("B\u0142\u0105d pobierania zdj\u0119\u0107:", error);
        setLoading(false);
        return;
      }

      const enrichedPhotos = await Promise.all(
        photoList
          .filter((photo) => isImageFile(photo.file_path))
          .map(async (photo) => {
            const { data } = supabase.storage
              .from("photos")
              .getPublicUrl(photo.file_path);
            const url = data?.publicUrl;

            let date;
            try {
              const exif = await exifr.parse(url);
              date = exif?.DateTimeOriginal || null;
            } catch (err) {
              console.warn(
                "Nie uda\u0142o si\u0119 pobra\u0107 EXIF dla",
                photo.title,
                err
              );
            }

            const finalDate = date
              ? new Date(date)
              : new Date(photo.created_at);
            const albumKey = finalDate.toISOString().split("T")[0];

            return { ...photo, url, albumKey };
          })
      );

      const grouped = {};
      enrichedPhotos.forEach((photo) => {
        if (!grouped[photo.albumKey]) {
          grouped[photo.albumKey] = [];
        }
        grouped[photo.albumKey].push(photo);
      });

      setAlbums(grouped);
      setLoading(false);
    };

    fetchAndGroupPhotos();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Albumy wg daty</h1>
      {loading ? (
        <p className={styles.loading}>\u0141adowanie...</p>
      ) : (
        Object.entries(albums).map(([date, photos]) => (
          <div key={date} className={styles.albumBlock}>
            <h2 className={styles.albumDate}>{date}</h2>
            <div className={styles.photoGrid}>
              {photos.map((photo) => (
                <div key={photo.id} className={styles.photoItem}>
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className={styles.thumbnail}
                    onClick={() => setSelectedImage(photo.url)}
                  />
                  <p className={styles.caption}>{photo.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {selectedImage && (
        <div className={styles.overlay} onClick={() => setSelectedImage(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Powi\u0119kszone zdj\u0119cie"
              className={styles.modalImage}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className={styles.closeButton}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
