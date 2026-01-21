import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "../../../../components/common/Modal";
import { Button } from "../../../../components/common/Button";
import { Input } from "../../../../components/common/Input";
import {
  type ServiceDto,
  type CreateServiceRequest,
  providerService,
} from "../../../../services/providerService";
import {
  categoryService,
  type Category,
} from "../../../../services/categoryService";
import { PRICE_TYPES, PRICE_TYPE_LABELS } from "../../../../models/provider";
import toast from "react-hot-toast";
import styles from "./ServiceModal.module.css";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  service: ServiceDto | null;
}

const initialFormData: CreateServiceRequest = {
  name: "",
  description: "",
  category: "",
  basePrice: 0,
  priceType: "Hourly",
  estimatedDurationMinutes: 60,
};

export function ServiceModal({
  isOpen,
  onClose,
  onSuccess,
  service,
}: ServiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] =
    useState<CreateServiceRequest>(initialFormData);
  const [, setIsActive] = useState(true);

  const isEditing = !!service;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        basePrice: service.basePrice,
        priceType: service.priceType,
        estimatedDurationMinutes: service.estimatedDurationMinutes,
      });
      setIsActive(service.isActive);
    } else {
      setFormData(initialFormData);
      setIsActive(true);
    }
  }, [service, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "basePrice" || name === "estimatedDurationMinutes"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Service name is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && service) {
        // UPDATE
        const response = await providerService.updateService(service.id, {
          name: formData.name,
          description: formData.description,
          basePrice: formData.basePrice,
          priceType: formData.priceType,
          estimatedDurationMinutes: formData.estimatedDurationMinutes,
        });

        if (response.moderationStatus === "AiRejected") {
          toast.error(
            "Service updated but flagged for review: " +
              response.moderationReason,
          );
        } else {
          toast.success("Service updated and approved!");
        }
      } else {
        // CREATE
        const response = await providerService.createService(formData);

        if (response.moderationStatus === "AiRejected") {
          toast.error(
            "Service created but flagged for review: " +
              response.moderationReason,
          );
        } else {
          toast.success("Service created successfully!");
        }
      }

      onSuccess();
    } catch (err) {
      toast.error(
        isEditing ? "Failed to update service" : "Failed to create service",
      );
      console.error("Error saving service:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Service" : "Add New Service"}
      size="medium"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Service Name */}
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Service Name <span className={styles.required}>*</span>
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Pipe Repair"
            maxLength={100}
          />
        </div>

        {/* Category */}
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Category <span className={styles.required}>*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.select}
            disabled={loadingCategories || isEditing}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          {isEditing && (
            <span className={styles.fieldHint}>
              Category cannot be changed after creation
            </span>
          )}
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description <span className={styles.required}>*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what this service includes..."
            className={styles.textarea}
            rows={3}
            maxLength={500}
          />
          <span className={styles.charCount}>
            {formData.description.length}/500
          </span>
        </div>

        {/* Price Type & Base Price */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="priceType" className={styles.label}>
              Price Type
            </label>
            <select
              id="priceType"
              name="priceType"
              value={formData.priceType}
              onChange={handleChange}
              className={styles.select}
              disabled={isEditing}
            >
              {PRICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PRICE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="basePrice" className={styles.label}>
              Base Price (RON)
            </label>
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.basePrice}
              onChange={handleChange}
              placeholder="0.00"
              disabled={formData.priceType === "Quote"}
            />
          </div>
        </div>

        {/* Estimated Duration */}
        <div className={styles.formGroup}>
          <label htmlFor="estimatedDurationMinutes" className={styles.label}>
            Estimated Duration (minutes)
          </label>
          <Input
            id="estimatedDurationMinutes"
            name="estimatedDurationMinutes"
            type="number"
            min="1"
            max="480"
            value={formData.estimatedDurationMinutes}
            onChange={handleChange}
            placeholder="60"
            disabled={isEditing}
          />
          <span className={styles.fieldHint}>
            Between 1 and 480 minutes (8 hours)
          </span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Service"
            ) : (
              "Create Service"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
