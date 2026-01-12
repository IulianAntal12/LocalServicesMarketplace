import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Modal } from "../../../../components/common/Modal";
import { Button } from "../../../../components/common/Button";
import { Input } from "../../../../components/common/Input";
import {
  bookingService,
  type TimeSlot,
  type CreateBookingRequest,
} from "../../../../services/bookingService";
import type { ServiceDto } from "../../../../services/providerService";
import toast from "react-hot-toast";
import styles from "./BookingModal.module.css";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  providerId: string;
  providerName: string;
  service: ServiceDto;
}

export function BookingModal({
  isOpen,
  onClose,
  onSuccess,
  providerId,
  providerName,
  service,
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1: Select date/time, 2: Enter details
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Date selection
  const [selectedDate, setSelectedDate] = useState<Date>(
    getNextAvailableDate()
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    postalCode: "",
    customerNotes: "",
  });

  // Get next available date (tomorrow or later)
  function getNextAvailableDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  const fetchAvailability = useCallback(async () => {
    try {
      setLoadingSlots(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await bookingService.getProviderAvailability(
        providerId,
        dateStr
      );
      setAvailableSlots(response.availableSlots);
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load available time slots");
    } finally {
      setLoadingSlots(false);
    }
  }, [providerId, selectedDate]);

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchAvailability();
    }
  }, [isOpen, selectedDate, fetchAvailability]);

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));

    // Don't allow dates before tomorrow
    const tomorrow = getNextAvailableDate();
    if (newDate >= tomorrow) {
      setSelectedDate(newDate);
      setSelectedSlot(null);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;

    try {
      setLoading(true);

      const bookingData: CreateBookingRequest = {
        providerId,
        serviceId: service.id,
        scheduledDate: selectedDate.toISOString().split("T")[0],
        scheduledTime: selectedSlot.startTime,
        address: formData.address || undefined,
        city: formData.city || undefined,
        postalCode: formData.postalCode || undefined,
        customerNotes: formData.customerNotes || undefined,
      };

      await bookingService.create(bookingData);
      toast.success("Booking request sent! Waiting for provider confirmation.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("ro-RO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string): string => {
    // timeStr is in format "HH:MM:SS" or "HH:MM"
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    return `${hours}:${minutes}`;
  };

  const formatPrice = (price: number, priceType: string): string => {
    const formatted = new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(price);

    switch (priceType) {
      case "Hourly":
        return `${formatted}/oră`;
      case "Fixed":
        return formatted;
      case "Quote":
        return "Preț la cerere";
      default:
        return formatted;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "Alege data și ora" : "Detalii programare"}
      size="medium"
    >
      <div className={styles.container}>
        {/* Service Info Header */}
        <div className={styles.serviceInfo}>
          <h3 className={styles.serviceName}>{service.name}</h3>
          <p className={styles.providerName}>{providerName}</p>
          <div className={styles.serviceDetails}>
            <span className={styles.price}>
              {formatPrice(service.basePrice, service.priceType)}
            </span>
            <span className={styles.duration}>
              ~{service.estimatedDurationMinutes} min
            </span>
          </div>
        </div>

        {step === 1 ? (
          <>
            {/* Date Selector */}
            <div className={styles.dateSelector}>
              <button
                className={styles.dateNav}
                onClick={() => handleDateChange("prev")}
                disabled={selectedDate <= getNextAvailableDate()}
              >
                <ChevronLeft size={20} />
              </button>
              <div className={styles.dateDisplay}>
                <Calendar size={18} />
                <span>{formatDate(selectedDate)}</span>
              </div>
              <button
                className={styles.dateNav}
                onClick={() => handleDateChange("next")}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Time Slots */}
            <div className={styles.slotsSection}>
              <h4 className={styles.slotsTitle}>
                <Clock size={18} />
                Ore disponibile
              </h4>

              {loadingSlots ? (
                <div className={styles.loadingSlots}>
                  <Loader2 className={styles.spinner} size={24} />
                  <span>Se încarcă...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className={styles.slotsGrid}>
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      className={`${styles.slot} ${
                        selectedSlot?.startTime === slot.startTime
                          ? styles.slotSelected
                          : ""
                      }`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {formatTime(slot.startTime)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.noSlots}>
                  <p>Nu există ore disponibile pentru această zi.</p>
                  <p>Încearcă o altă dată.</p>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <div className={styles.actions}>
              <Button variant="outline" onClick={onClose}>
                Anulează
              </Button>
              <Button onClick={handleContinue} disabled={!selectedSlot}>
                Continuă
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Selected DateTime Summary */}
            <div className={styles.selectedSummary}>
              <div className={styles.summaryItem}>
                <Calendar size={16} />
                <span>{formatDate(selectedDate)}</span>
              </div>
              <div className={styles.summaryItem}>
                <Clock size={16} />
                <span>
                  {selectedSlot && formatTime(selectedSlot.startTime)}
                </span>
              </div>
            </div>

            {/* Location Form */}
            <div className={styles.form}>
              <div className={styles.formSection}>
                <h4 className={styles.formSectionTitle}>
                  <MapPin size={18} />
                  Locație (unde se va efectua serviciul)
                </h4>

                <Input
                  name="address"
                  label="Adresă"
                  placeholder="Str. Exemplu, Nr. 10, Bl. A1"
                  value={formData.address}
                  onChange={handleInputChange}
                />

                <div className={styles.formRow}>
                  <Input
                    name="city"
                    label="Oraș"
                    placeholder="București"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="postalCode"
                    label="Cod poștal"
                    placeholder="010101"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.formSection}>
                <h4 className={styles.formSectionTitle}>
                  <FileText size={18} />
                  Note pentru prestator
                </h4>
                <textarea
                  name="customerNotes"
                  className={styles.textarea}
                  placeholder="Descrieți problema sau cerințele speciale..."
                  rows={4}
                  value={formData.customerNotes}
                  onChange={handleInputChange}
                  maxLength={1000}
                />
                <span className={styles.charCount}>
                  {formData.customerNotes.length}/1000
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button variant="outline" onClick={handleBack}>
                Înapoi
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} />
                    Se trimite...
                  </>
                ) : (
                  "Trimite cererea"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
