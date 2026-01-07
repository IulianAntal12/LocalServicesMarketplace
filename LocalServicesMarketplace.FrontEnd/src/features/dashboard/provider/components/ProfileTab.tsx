import { useState } from "react";
import { Save, Plus, X, Loader2 } from "lucide-react";
import {
  type ProviderProfile,
  type UpdateProfileRequest,
  providerService,
} from "../../../../services/providerService";
import { Button } from "../../../../components/common/Button";
import { Input } from "../../../../components/common/Input";
import toast from "react-hot-toast";
import styles from "./ProfileTab.module.css";

interface ProfileTabProps {
  profile: ProviderProfile;
  onUpdate: () => void;
}

export function ProfileTab({ profile, onUpdate }: ProfileTabProps) {
  const [loading, setLoading] = useState(false);
  const [newServiceArea, setNewServiceArea] = useState("");

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    businessName: profile.businessName || "",
    businessDescription: profile.businessDescription || "",
    hourlyRate: profile.hourlyRate || undefined,
    serviceAreas: profile.serviceAreas || [],
    address: profile.address || "",
    city: profile.city || "",
    postalCode: profile.postalCode || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "hourlyRate" ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const handleAddServiceArea = () => {
    const trimmed = newServiceArea.trim();
    if (trimmed && !formData.serviceAreas?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        serviceAreas: [...(prev.serviceAreas || []), trimmed],
      }));
      setNewServiceArea("");
    }
  };

  const handleRemoveServiceArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas?.filter((a) => a !== area) || [],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddServiceArea();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await providerService.updateProfile(formData);
      toast.success("Profile updated successfully!");
      onUpdate();
    } catch (err) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Business Information</h2>
        <p className={styles.sectionDescription}>
          Update your business details to help customers find and learn about
          your services.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Business Name */}
          <div className={styles.formGroup}>
            <label htmlFor="businessName" className={styles.label}>
              Business Name
            </label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName || ""}
              onChange={handleChange}
              placeholder="Your business name"
            />
          </div>

          {/* Business Description */}
          <div className={styles.formGroup}>
            <label htmlFor="businessDescription" className={styles.label}>
              Business Description
            </label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              value={formData.businessDescription || ""}
              onChange={handleChange}
              placeholder="Describe your business and services..."
              className={styles.textarea}
              rows={4}
            />
            <span className={styles.charCount}>
              {formData.businessDescription?.length || 0}/500
            </span>
          </div>

          {/* Hourly Rate */}
          <div className={styles.formGroup}>
            <label htmlFor="hourlyRate" className={styles.label}>
              Hourly Rate (RON)
            </label>
            <Input
              id="hourlyRate"
              name="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.hourlyRate || ""}
              onChange={handleChange}
              placeholder="e.g., 75.00"
            />
          </div>

          {/* Location Section */}
          <h3 className={styles.subTitle}>Location</h3>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="city" className={styles.label}>
                City
              </label>
              <Input
                id="city"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                placeholder="Your city"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="postalCode" className={styles.label}>
                Postal Code
              </label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode || ""}
                onChange={handleChange}
                placeholder="e.g., 700505"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Address
            </label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>

          {/* Service Areas */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Service Areas</label>
            <p className={styles.fieldDescription}>
              Add the areas where you provide services
            </p>

            <div className={styles.serviceAreasInput}>
              <Input
                value={newServiceArea}
                onChange={(e) => setNewServiceArea(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a service area"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddServiceArea}
                disabled={!newServiceArea.trim()}
              >
                <Plus size={18} />
              </Button>
            </div>

            {formData.serviceAreas && formData.serviceAreas.length > 0 && (
              <div className={styles.serviceAreasTags}>
                {formData.serviceAreas.map((area) => (
                  <span key={area} className={styles.tag}>
                    {area}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      onClick={() => handleRemoveServiceArea(area)}
                      aria-label={`Remove ${area}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className={styles.formActions}>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Sidebar Info */}
      <div className={styles.sidebar}>
        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>Profile Tips</h3>
          <ul className={styles.infoList}>
            <li>Use a clear, professional business name</li>
            <li>Write a detailed description of your services</li>
            <li>Set competitive hourly rates for your area</li>
            <li>Add all areas where you can provide services</li>
          </ul>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>Account Info</h3>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{profile.email}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Full Name</span>
            <span className={styles.infoValue}>{profile.fullName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
