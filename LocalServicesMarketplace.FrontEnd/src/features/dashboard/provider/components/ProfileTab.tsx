import { useState } from "react";
import { Save, Loader2, Plus, X } from "lucide-react";
import { Button } from "../../../../components/common/Button";
import { Input } from "../../../../components/common/Input";
import { SearchableSelect } from "../../../../components/common/SearchableSelect";
import {
  providerService,
  type ProviderProfile,
  type UpdateProfileRequest,
} from "../../../../services/providerService";
import { countries } from "../../../../data/romania-locations";
import toast from "react-hot-toast";
import styles from "./ProfileTab.module.css";

interface ProfileTabProps {
  profile: ProviderProfile;
  onUpdate: () => void;
}

export function ProfileTab({ profile, onUpdate }: ProfileTabProps) {
  const [loading, setLoading] = useState(false);
  const [newServiceArea, setNewServiceArea] = useState("");

  const [formData, setFormData] = useState({
    businessName: profile.businessName || "",
    businessDescription: profile.businessDescription || "",
    phoneNumber: profile.phoneNumber || "",
    hourlyRate: profile.hourlyRate || undefined,
    serviceAreas: profile.serviceAreas || [],
    address: profile.address || "",
    city: profile.city || "",
    postalCode: profile.postalCode || "",
  });

  // Build city options from counties
  const cityOptions = countries.flatMap((county) =>
    county.cities.map((city) => ({
      value: city.name,
      label: city.name,
      group: county.name,
    }))
  );

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

  const handleCityChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      city: value,
    }));
  };

  const handleAddServiceArea = () => {
    if (!newServiceArea.trim()) return;
    if (formData.serviceAreas.includes(newServiceArea.trim())) {
      toast.error("This service area is already added");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, newServiceArea.trim()],
    }));
    setNewServiceArea("");
  };

  const handleRemoveServiceArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((a) => a !== area),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const updateData: UpdateProfileRequest = {
        businessName: formData.businessName || undefined,
        businessDescription: formData.businessDescription || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        hourlyRate: formData.hourlyRate,
        serviceAreas: formData.serviceAreas,
        address: formData.address || undefined,
        city: formData.city || undefined,
        postalCode: formData.postalCode || undefined,
      };

      await providerService.updateProfile(updateData);
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
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Business Information */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Business Information</h3>

          <div className={styles.formGroup}>
            <label htmlFor="businessName" className={styles.label}>
              Business Name
            </label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Your business name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="businessDescription" className={styles.label}>
              Business Description
            </label>
            <textarea
              id="businessDescription"
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleChange}
              placeholder="Describe your services and experience..."
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber" className={styles.label}>
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g., 0740 123 456"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="hourlyRate" className={styles.label}>
                Hourly Rate (RON)
              </label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.hourlyRate || ""}
                onChange={handleChange}
                placeholder="e.g., 50.00"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Location</h3>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <SearchableSelect
                id="city"
                label="City"
                options={cityOptions}
                value={formData.city}
                onChange={handleCityChange}
                placeholder="Select your city..."
                groupBy
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="postalCode" className={styles.label}>
                Postal Code
              </label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="e.g., 700001"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Street Address
            </label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your business address"
            />
          </div>
        </div>

        {/* Service Areas */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Service Areas</h3>
          <p className={styles.sectionDescription}>
            Add the areas where you provide services
          </p>

          <div className={styles.serviceAreasInput}>
            <Input
              value={newServiceArea}
              onChange={(e) => setNewServiceArea(e.target.value)}
              placeholder="Add a service area (e.g., Downtown, Northside)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddServiceArea();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddServiceArea}
            >
              <Plus size={18} />
              Add
            </Button>
          </div>

          {formData.serviceAreas.length > 0 && (
            <div className={styles.serviceAreasTags}>
              {formData.serviceAreas.map((area) => (
                <span key={area} className={styles.serviceAreaTag}>
                  {area}
                  <button
                    type="button"
                    onClick={() => handleRemoveServiceArea(area)}
                    className={styles.removeTagButton}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
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

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>Profile Tips</h3>
          <ul className={styles.infoList}>
            <li>Add a detailed business description</li>
            <li>Set competitive hourly rates</li>
            <li>List all areas you serve</li>
            <li>Keep your contact info up to date</li>
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
          {profile.phoneNumber && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{profile.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
