import { useEffect, useState } from "react";
import supabase from "../lib/supabase-client";
import exifr from "exifr";
import styles from "../styles/Albums.module.css"; // Import the CSS module

export default function Albums() {
  const [albums, setAlbums] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // Stores the URL of the selected image
  const [selectedImageDetails, setSelectedImageDetails] = useState(null); // Stores full photo object for modal

  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  /**
   * Checks if a given filename has a supported image extension.
   * @param {string} filename - The name of the file.
   * @returns {boolean} - True if it's a supported image file, false otherwise.
   */
  const isImageFile = (filename) => {
    return imageExtensions.some((ext) =>
      filename.toLowerCase().endsWith(ext)
    );
  };

  useEffect(() => {
    /**
     * Fetches photos from Supabase, enriches them with public URLs and EXIF data,
     * then groups them into albums by date.
     */
    const fetchAndGroupPhotos = async () => {
      setLoading(true); // Start loading state

      // Get current user data
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        // Handle no user case, maybe redirect to login or show a message
        console.log("No user logged in. Cannot fetch photos.");
        return;
      }

      // Fetch all photos for the current user
      const { data: photoList, error } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", userData.user.id);

      if (error) {
        console.error("Błąd pobierania zdjęć:", error.message);
        setLoading(false);
        return;
      }

      // Filter for image files and enrich photo data (public URL, EXIF date, visibility)
      const enrichedPhotos = await Promise.all(
        photoList
          .filter((photo) => isImageFile(photo.file_path)) // Only process actual image files
          .map(async (photo) => {
            // Get public URL for the photo from Supabase Storage
            const { data } = supabase.storage
              .from("photos")
              .getPublicUrl(photo.file_path);
            const url = data?.publicUrl;

            let date;
            try {
              // Try to parse EXIF DateTimeOriginal for more accurate date
              // Note: exifr.parse directly on URL might have CORS issues in some environments.
              // A more robust solution might involve a server-side proxy or fetching the blob first.
              const exif = await exifr.parse(url);
              date = exif?.DateTimeOriginal || null;
            } catch (err) {
              console.warn(
                `Nie udało się pobrać EXIF dla ${photo.title} (${url}):`,
                err
              );
              date = null; // Reset date if EXIF fails
            }

            // Determine the album key (date part of ISO string)
            const finalDate = date ? new Date(date) : new Date(photo.created_at);
            const albumKey = finalDate.toISOString().split("T")[0]; // YYYY-MM-DD

            // Fetch visibility for each photo
            const { data: visibilityData, error: visError } = await supabase
              .from("photo_visibility")
              .select("is_private")
              .eq("photo_id", photo.id)
              .single();

            if (visError) {
              console.warn(
                `Nie udało się pobrać visibility dla ${photo.title}:`,
                visError.message
              );
            }

            // Return enriched photo object
            return {
              ...photo,
              url,
              albumKey,
              is_private: visibilityData ? visibilityData.is_private : false,
            };
          })
      );

      // Group photos by their albumKey (date)
      const grouped = {};
      enrichedPhotos.forEach((photo) => {
        if (!grouped[photo.albumKey]) {
          grouped[photo.albumKey] = [];
        }
        grouped[photo.albumKey].push(photo);
      });

      setAlbums(grouped);
      setLoading(false); // End loading state
    };

    fetchAndGroupPhotos();

    // Cleanup function for the effect
    return () => {
      // Any cleanup if needed, e.g., unsubscribing from real-time listeners if added
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // 🔒 Effect to disable right-click context menu to prevent image saving
  useEffect(() => {
    const disableContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", disableContextMenu);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  /**
   * Handles opening the image modal.
   * @param {object} photo - The photo object to display in the modal.
   */
  const openImageModal = (photo) => {
    setSelectedImage(photo.url);
    setSelectedImageDetails(photo);
  };

  /**
   * Handles closing the image modal.
   */
  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedImageDetails(null);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Moje Albumy Zdjęć</h1>

      {loading ? (
        <p className={styles.loadingMessage}>Ładowanie zdjęć, proszę czekać...</p>
      ) : Object.keys(albums).length === 0 ? (
        <p className={styles.noPhotosMessage}>Brak zdjęć w Twoich albumach. Dodaj nowe zdjęcia!</p>
      ) : (
        Object.entries(albums)
          .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) // Sort albums by date, newest first
          .map(([date, photos]) => (
            <section key={date} className={styles.albumSection}>
              <h2 className={styles.albumDate}>{date}</h2>
              <div className={styles.photoGrid}>
                {photos.map((photo) => (
                  <div key={photo.id} className={styles.photoCard}>
                    <div className={styles.imageWrapper}>
                      <img
                        src={photo.url}
                        alt={photo.title || "Zdjęcie z albumu"}
                        onClick={() => openImageModal(photo)}
                        draggable="false" // Disable dragging the image
                        className={styles.thumbnail}
                      />
                      <div className={styles.visibilityTag}>
                        {photo.is_private ? "Prywatne" : "Publiczne"}
                      </div>
                    </div>
                    <p className={styles.photoTitle}>{photo.title}</p>
                  </div>
                ))}
              </div>
            </section>
          ))
      )}

      {/* MODAL for enlarged image with watermark */}
      {selectedImage && (
        <div className={styles.modalOverlay} onClick={closeImageModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Powiększone zdjęcie"
              draggable="false"
              className={styles.modalImage}
            />
            {/* WATERMARK */}
            <div className={styles.watermark}>
              © ??? App
            </div>
          </div>
          <button className={styles.closeButton} onClick={closeImageModal}>
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
