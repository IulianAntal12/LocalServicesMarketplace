import { useState } from "react";
import { Check, X, Briefcase, User, Tag, DollarSign, Bot } from "lucide-react";
import { Modal } from "../../../../components/common/Modal";
import { Button } from "../../../../components/common/Button";
import {
  adminService,
  type ServiceModerationDto,
} from "../../../../services/adminService";
import toast from "react-hot-toast";
import styles from "./ModerationModal.module.css";

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceModerationDto;
  onComplete: () => void;
}

export function ModerationModal({
  isOpen,
  onClose,
  service,
  onComplete,
}: ModerationModalProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState(service.aiReason || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action) {
      toast.error("Please select an action");
      return;
    }

    if (action === "reject" && !reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setLoading(true);
      await adminService.moderateService(service.id, {
        action,
        reason: action === "reject" ? reason.trim() : undefined,
      });

      toast.success(
        action === "approve"
          ? `"${service.name}" has been approved`
          : `"${service.name}" has been rejected`,
      );
      onComplete();
    } catch (err) {
      console.error("Error moderating service:", err);
      toast.error("Failed to moderate service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, priceType: string): string => {
    if (priceType === "Quote") return "Request Quote";
    const suffix = priceType === "Hourly" ? "/hr" : "";
    return `$${price.toFixed(2)}${suffix}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Service"
      size="large"
    >
      <div className={styles.container}>
        {/* Service Details */}
        <div className={styles.serviceDetails}>
          <div className={styles.serviceHeader}>
            <div className={styles.serviceIcon}>
              <Briefcase size={24} />
            </div>
            <div>
              <h2 className={styles.serviceName}>{service.name}</h2>
              <span className={styles.serviceCategory}>{service.category}</span>
            </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <User size={16} />
              <div>
                <span className={styles.detailLabel}>Provider</span>
                <span className={styles.detailValue}>
                  {service.providerBusinessName || service.providerName}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <DollarSign size={16} />
              <div>
                <span className={styles.detailLabel}>Price</span>
                <span className={styles.detailValue}>
                  {formatPrice(service.basePrice, service.priceType)}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <Tag size={16} />
              <div>
                <span className={styles.detailLabel}>Price Type</span>
                <span className={styles.detailValue}>{service.priceType}</span>
              </div>
            </div>
          </div>

          <div className={styles.descriptionSection}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <p className={styles.description}>{service.description}</p>
          </div>

          <div className={styles.metaInfo}>
            <span>Submitted: {formatDate(service.createdAt)}</span>
          </div>
        </div>

        {/* AI Reason (if rejected by AI) */}
        {service.aiReason && (
          <div className={styles.aiReasonBox}>
            <div className={styles.aiReasonHeader}>
              <Bot size={18} />
              <span>AI Rejection Reason</span>
            </div>
            <p className={styles.aiReasonText}>{service.aiReason}</p>
          </div>
        )}

        {/* Action Selection */}
        <div className={styles.actionSection}>
          <h3 className={styles.sectionTitle}>Your Decision</h3>
          <div className={styles.actionButtons}>
            <button
              className={`${styles.actionButton} ${styles.approve} ${
                action === "approve" ? styles.selected : ""
              }`}
              onClick={() => setAction("approve")}
            >
              <Check size={20} />
              <span>Approve</span>
              <small>Service will be published</small>
            </button>
            <button
              className={`${styles.actionButton} ${styles.reject} ${
                action === "reject" ? styles.selected : ""
              }`}
              onClick={() => setAction("reject")}
            >
              <X size={20} />
              <span>Reject</span>
              <small>Service will be rejected</small>
            </button>
          </div>

          {/* Rejection Reason */}
          {action === "reject" && (
            <div className={styles.reasonInput}>
              <label className={styles.reasonLabel}>
                Rejection Reason <span className={styles.required}>*</span>
              </label>
              <textarea
                className={styles.reasonTextarea}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this service is being rejected..."
                rows={4}
              />
              <small className={styles.reasonHint}>
                This will be sent to the provider so they can fix the issues.
              </small>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!action || loading}
            isLoading={loading}
          >
            {action === "approve"
              ? "Approve Service"
              : action === "reject"
                ? "Reject Service"
                : "Select Action"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
