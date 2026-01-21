import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  Tag,
  AlertTriangle,
  Bot,
  UserX,
  CheckCircle,
} from "lucide-react";
import {
  type ServiceDto,
  providerService,
} from "../../../../services/providerService";
import { Button } from "../../../../components/common/Button";
import { ServiceModal } from "./ServiceModal";
import { PRICE_TYPE_LABELS, type PriceType } from "../../../../models/provider";
import toast from "react-hot-toast";
import styles from "./ServicesTab.module.css";

interface ServicesTabProps {
  services: ServiceDto[];
  onUpdate: () => void;
}

export function ServicesTab({ services, onUpdate }: ServicesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleAddClick = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (service: ServiceDto) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (serviceId: number) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      setDeletingId(serviceId);
      await providerService.deleteService(serviceId);
      toast.success("Service deleted successfully!");
      onUpdate();
    } catch (err) {
      toast.error("Failed to delete service. Please try again.");
      console.error("Error deleting service:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    onUpdate();
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatPrice = (price: number, priceType: string): string => {
    if (priceType === "Quote") {
      return "Request Quote";
    }
    const suffix = priceType === "Hourly" ? "/hr" : "";
    return `${price.toFixed(2)} RON${suffix}`;
  };

  const getModerationStatusInfo = (service: ServiceDto) => {
    if (service.isActive && service.moderationStatus === "Approved") {
      return {
        icon: <CheckCircle size={14} />,
        label: "Active",
        className: styles.statusActive,
        reason: null,
      };
    }

    if (service.moderationStatus === "AiRejected") {
      return {
        icon: <Bot size={14} />,
        label: "Pending Review",
        className: styles.statusPending,
        reason: service.moderationReason,
        reasonLabel: "AI flagged this service:",
      };
    }

    if (service.moderationStatus === "AdminRejected") {
      return {
        icon: <UserX size={14} />,
        label: "Rejected",
        className: styles.statusRejected,
        reason: service.moderationReason,
        reasonLabel: "Rejection reason:",
      };
    }

    // Fallback for inactive without specific status
    return {
      icon: <AlertTriangle size={14} />,
      label: "Inactive",
      className: styles.statusInactive,
      reason: null,
    };
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Your Services</h2>
          <p className={styles.subtitle}>
            Manage the services you offer to customers
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus size={18} />
          Add Service
        </Button>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Tag size={48} />
          </div>
          <h3 className={styles.emptyTitle}>No services yet</h3>
          <p className={styles.emptyText}>
            Add your first service to start receiving requests from customers.
          </p>
          <Button onClick={handleAddClick}>
            <Plus size={18} />
            Add Your First Service
          </Button>
        </div>
      ) : (
        <div className={styles.servicesList}>
          {services.map((service) => {
            const statusInfo = getModerationStatusInfo(service);

            return (
              <div
                key={service.id}
                className={`${styles.serviceCard} ${
                  !service.isActive ? styles.inactive : ""
                }`}
              >
                <div className={styles.serviceHeader}>
                  <div className={styles.serviceInfo}>
                    <h3 className={styles.serviceName}>{service.name}</h3>
                    <span className={styles.serviceCategory}>
                      {service.category}
                    </span>
                  </div>
                  <div className={styles.serviceActions}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(service)}
                      aria-label="Edit service"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDeleteClick(service.id)}
                      disabled={deletingId === service.id}
                      aria-label="Delete service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className={styles.serviceDescription}>
                  {service.description}
                </p>

                {/* Moderation Status Alert */}
                {!service.isActive && statusInfo.reason && (
                  <div className={styles.moderationAlert}>
                    {statusInfo.icon}
                    <div className={styles.moderationContent}>
                      <strong>{statusInfo.reasonLabel}</strong>
                      <p>{statusInfo.reason}</p>
                      {service.moderationStatus === "AiRejected" && (
                        <span className={styles.moderationHint}>
                          An admin will review your service shortly. You can
                          edit the service to address the issues.
                        </span>
                      )}
                      {service.moderationStatus === "AdminRejected" && (
                        <span className={styles.moderationHint}>
                          Please edit your service to address the issues and
                          resubmit.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.serviceFooter}>
                  <div className={styles.serviceMeta}>
                    <span className={styles.metaItem}>
                      <DollarSign size={14} />
                      {formatPrice(service.basePrice, service.priceType)}
                    </span>
                    <span className={styles.metaItem}>
                      <Clock size={14} />
                      {formatDuration(service.estimatedDurationMinutes)}
                    </span>
                    <span className={styles.metaItem}>
                      <Tag size={14} />
                      {PRICE_TYPE_LABELS[service.priceType as PriceType] ||
                        service.priceType}
                    </span>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${statusInfo.className}`}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        service={editingService}
      />
    </div>
  );
}
