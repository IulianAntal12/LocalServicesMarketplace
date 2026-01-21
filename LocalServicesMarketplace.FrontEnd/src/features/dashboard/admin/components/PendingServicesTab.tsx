import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Loader2,
  AlertCircle,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { Button } from "../../../../components/common/Button";
import {
  adminService,
  type ServiceModerationDto,
} from "../../../../services/adminService";
import { ModerationModal } from "./ModerationModal";
import toast from "react-hot-toast";
import styles from "./PendingServicesTab.module.css";

export function PendingServicesTab() {
  const [services, setServices] = useState<ServiceModerationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceModerationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingServices({
        page: currentPage,
        pageSize: 10,
        sortBy: "newest",
      });
      setServices(response.services);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching pending services:", err);
      toast.error("Failed to load pending services");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleViewService = (service: ServiceModerationDto) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleQuickApprove = async (service: ServiceModerationDto) => {
    try {
      await adminService.moderateService(service.id, { action: "approve" });
      toast.success(`"${service.name}" approved successfully`);
      fetchServices();
    } catch (err) {
      console.error("Error approving service:", err);
      toast.error("Failed to approve service");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleModerationComplete = () => {
    handleModalClose();
    fetchServices();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number, priceType: string): string => {
    if (priceType === "Quote") return "Request Quote";
    const suffix = priceType === "Hourly" ? "/hr" : "";
    return `$${price.toFixed(2)}${suffix}`;
  };

  if (loading && services.length === 0) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={32} />
        <p>Loading pending services...</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Clock size={48} />
        <h3>No pending services</h3>
        <p>All services have been reviewed. Check back later for new submissions.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.count}>{totalCount} pending service(s)</span>
      </div>

      <div className={styles.servicesList}>
        {services.map((service) => (
          <div key={service.id} className={styles.serviceCard}>
            <div className={styles.serviceMain}>
              <div className={styles.serviceIcon}>
                <Briefcase size={20} />
              </div>
              <div className={styles.serviceInfo}>
                <h3 className={styles.serviceName}>{service.name}</h3>
                <p className={styles.serviceDescription}>
                  {service.description.length > 150
                    ? `${service.description.substring(0, 150)}...`
                    : service.description}
                </p>
                <div className={styles.serviceMeta}>
                  <span className={styles.metaItem}>
                    <strong>Category:</strong> {service.categoryName}
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Price:</strong> {formatPrice(service.price, service.priceType)}
                  </span>
                  <span className={styles.metaItem}>
                    <strong>Provider:</strong> {service.providerBusinessName || service.providerName}
                  </span>
                </div>
                <span className={styles.serviceDate}>
                  Submitted: {formatDate(service.createdAt)}
                </span>
              </div>
            </div>

            <div className={styles.serviceActions}>
              <Button
                variant="outline"
                size="small"
                onClick={() => handleViewService(service)}
              >
                <Eye size={16} />
                Review
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={() => handleQuickApprove(service)}
              >
                <Check size={16} />
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            variant="outline"
            size="small"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="small"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Moderation Modal */}
      {selectedService && (
        <ModerationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          service={selectedService}
          onComplete={handleModerationComplete}
        />
      )}
    </div>
  );
}
