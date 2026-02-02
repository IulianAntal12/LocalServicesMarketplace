import { useState, useRef } from "react";
import { Upload, Trash2, Image, Loader2, X, AlertTriangle } from "lucide-react";
import type { PortfolioImageDto } from "../../../../services/providerService";
import { portfolioService } from "../../../../services/portfolioService";
import { Button } from "../../../../components/common/Button";
import { Modal } from "../../../../components/common/Modal";
import { Input } from "../../../../components/common/Input";
import toast from "react-hot-toast";
import axios from "axios";
import styles from "./PortfolioTab.module.css";

interface PortfolioTabProps {
  images: PortfolioImageDto[];
  onUpdate: () => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "https://localhost:5001";

export function PortfolioTab({ images, onUpdate }: PortfolioTabProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [viewingImage, setViewingImage] = useState<PortfolioImageDto | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Error modal state
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploadModalOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await portfolioService.uploadImage(
        selectedFile,
        description || undefined,
      );
      toast.success("Image uploaded successfully!");
      handleCloseUploadModal();
      onUpdate();
    } catch (err) {
      console.error("Error uploading image:", err);

      // Extract error message from backend response
      let message = "Failed to upload image. Please try again.";

      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;

        // Handle different error response formats
        if (typeof responseData === "string") {
          message = responseData;
        } else if (responseData?.message) {
          message = responseData.message;
        } else if (responseData?.errors && Array.isArray(responseData.errors)) {
          message = responseData.errors.join("\n");
        } else if (responseData?.title) {
          message = responseData.title;
        }
      }

      // Close upload modal and show error modal
      handleCloseUploadModal();
      setErrorMessage(message);
      setIsErrorModalOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      setDeletingId(imageId);
      await portfolioService.deleteImage(imageId);
      toast.success("Image deleted successfully!");
      onUpdate();
    } catch (err) {
      toast.error("Failed to delete image. Please try again.");
      console.error("Error deleting image:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setDescription("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
    setErrorMessage("");
  };

  const handleImageClick = (image: PortfolioImageDto) => {
    setViewingImage(image);
  };

  const getImageUrl = (imageUrl: string): string => {
    // If already absolute URL, return as-is
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    // Remove leading slash if present and construct full URL
    const cleanPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const maxImages = 20;
  const canUpload = images.length < maxImages;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Portfolio Images</h2>
          <p className={styles.subtitle}>
            Showcase your best work to attract customers ({images.length}/
            {maxImages})
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className={styles.fileInput}
            id="portfolio-upload"
            disabled={!canUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={!canUpload}
          >
            <Upload size={18} />
            Upload Image
          </Button>
        </div>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Image size={48} />
          </div>
          <h3 className={styles.emptyTitle}>No portfolio images yet</h3>
          <p className={styles.emptyText}>
            Upload photos of your completed work to showcase your skills and
            attract more customers.
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} />
            Upload Your First Image
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {images.map((image) => (
            <div key={image.id} className={styles.imageCard}>
              <div
                className={styles.imageWrapper}
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={getImageUrl(image.imageUrl)}
                  alt={image.description || "Portfolio image"}
                  className={styles.image}
                  loading="lazy"
                />
                <div className={styles.imageOverlay}>
                  <span className={styles.viewText}>Click to view</span>
                </div>
              </div>
              <div className={styles.imageInfo}>
                <p className={styles.imageDescription}>
                  {image.description || "No description"}
                </p>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingId === image.id}
                  aria-label="Delete image"
                >
                  {deletingId === image.id ? (
                    <Loader2 size={16} className={styles.spinner} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        title="Upload Portfolio Image"
        size="medium"
      >
        <div className={styles.uploadModal}>
          {previewUrl && (
            <div className={styles.previewWrapper}>
              <img
                src={previewUrl}
                alt="Preview"
                className={styles.previewImage}
              />
            </div>
          )}

          <div className={styles.uploadForm}>
            <div className={styles.formGroup}>
              <label htmlFor="image-description" className={styles.label}>
                Description (optional)
              </label>
              <Input
                id="image-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this work..."
                maxLength={500}
              />
              <span className={styles.charCount}>{description.length}/500</span>
            </div>

            <div className={styles.uploadActions}>
              <Button variant="outline" onClick={handleCloseUploadModal}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} />
                    Analyzing & Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Error Modal - for AI rejection messages */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        title="Image Upload Failed"
        size="medium"
      >
        <div className={styles.errorModal}>
          <div className={styles.errorIconWrapper}>
            <AlertTriangle size={48} className={styles.errorIcon} />
          </div>
          <div className={styles.errorContent}>
            <p className={styles.errorText}>{errorMessage}</p>
            <p className={styles.errorHint}>
              Please upload an image that shows your work, completed projects,
              tools, or equipment related to home services.
            </p>
          </div>
          <div className={styles.errorActions}>
            <Button onClick={handleCloseErrorModal}>
              Got it, I'll try another image
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Image Modal */}
      {viewingImage && (
        <div className={styles.lightbox} onClick={() => setViewingImage(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setViewingImage(null)}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <img
            src={getImageUrl(viewingImage.imageUrl)}
            alt={viewingImage.description || "Portfolio image"}
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
          {viewingImage.description && (
            <p className={styles.lightboxCaption}>{viewingImage.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
