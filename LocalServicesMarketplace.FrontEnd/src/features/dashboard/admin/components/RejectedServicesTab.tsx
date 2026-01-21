import { useState, useEffect, useCallback } from "react";
import {
  XCircle,
  Loader2,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  AlertTriangle,
  Bot,
} from "lucide-react";
import { Button } from "../../../../components/common/Button";
import {
  adminService,
  type ServiceModerationDto,
  type ModerationStatus,
} from "../../../../services/adminService";
import { ModerationModal } from "./ModerationModal";
import toast from "react-hot-toast";
import styles from "./RejectedServicesTab.module.css";

type FilterStatus = "AiRejected" | "AdminRejected" | "all";

export function RejectedServicesTab() {
  const [services, setServices] = useState<ServiceModerationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("AiRejected");
  const [selectedService, setSelectedService] = useState<ServiceModerationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getRejectedServices({
        page: currentPage,
        pageSize: 10,
        status: filterStatus,
        sortBy: "newest",
      });
      setServices(response.services);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching rejected services:", err);
      toast.error("Failed to load rejected services");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

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
      toast.success(`"${service.name}" approved (AI decision overridden)`);
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

  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status);
    setCurrentPage(1);
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

  const getStatusBadge = (status: ModerationStatus) => {
    if (status === "AiRejected") {
      return (
        <span className={`${styles.statusBadge} ${styles.aiRejected}`}>
          <Bot size={12} />
          AI Rejected
        </span>
      );
    }
    return (
      <span className={`${styles.statusBadge} ${styles.adminRejected}`}>
        <X size={12} />
        Admin Rejected
      </span>
    );
  };

  if (loading && services.length === 0) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={32} />
        <p>Loading rejected services...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${filterStatus === "AiRejected" ? styles.active : ""}`}
            onClick={() => handleFilterChange("AiRejected")}
          >
            <Bot size={16} />
            AI Rejected
          </button>
          <button
            className={`${styles.filterTab} ${filterStatus === "AdminRejected" ? styles.active : ""}`}
            onClick={() => handleFilterChange("AdminRejected")}
          >
            <X size={16} />
            Admin Rejected
          </button>
          <button
            className={`${styles.filterTab} ${filterStatus === "all" ? styles.active : ""}`}
            onClick={() => handleFilterChange("all")}
          >
            All Rejected
          </button>
        </div>
        <span className={styles.count}>{totalCount} service(s)</span>
      </div>

      {services.length === 0 ? (
        <div className={styles.emptyState}>
          <XCircle size={48} />
          <h3>No rejected services</h3>
          <p>
            {filterStatus === "AiRejected"
              ? "No services have been rejected by AI. The AI is doing a good job!"
              : filterStatus === "AdminRejected"
              ? "No services have been rejected by administrators."
              : "No rejected services found."}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.servicesList}>
            {services.map((service) => (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.serviceMain}>
                  <div className={styles.serviceIcon}>
                    <Briefcase size={20} />
                  </div>
                  <div className={styles.serviceInfo}>
                    <div className={styles.serviceHeader}>
                      <h3 className={styles.serviceName}>{service.name}</h3>
                      {getStatusBadge(service.moderationStatus)}
                    </div>
                    <p className={styles.serviceDescription}>
                      {service.description.length > 150
                        ? `${service.description.substring(0, 150)}...`
                        : service.description}
                    </p>

                    {/* AI Reason */}
                    {service.aiReason && (
                      <div className={styles.reasonBox}>
                        <AlertTriangle size={14} />
                        <div>
                          <strong>AI Rejection Reason:</strong>
                          <p>{service.aiReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Admin Reason (if admin rejected) */}
                    {service.adminReason && service.moderationStatus === "AdminRejected" && (
                      <div className={`${styles.reasonBox} ${styles.adminReason}`}>
                        <X size={14} />
                        <div>
                          <strong>Admin Reason:</strong>
                          <p>{service.adminReason}</p>
                        </div>
                      </div>
                    )}

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
                  {service.moderationStatus === "AiRejected" && (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleQuickApprove(service)}
                    >
                      <Check size={16} />
                      Override & Approve
                    </Button>
                  )}
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
        </>
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
