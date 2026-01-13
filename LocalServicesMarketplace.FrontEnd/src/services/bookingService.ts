import api from "./api";

// ============= TYPES =============

export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | "Rejected"
  | "NoShow";

export interface BookingDto {
  id: number;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  providerId: string;
  providerName: string;
  providerBusinessName?: string;
  providerPhone?: string;
  serviceId: number;
  serviceName: string;
  serviceCategory: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDurationMinutes: number;
  address?: string;
  city?: string;
  postalCode?: string;
  customerNotes?: string;
  providerNotes?: string;
  quotedPrice: number;
  finalPrice?: number;
  priceType: string;
  status: BookingStatus;
  cancellationReason?: string;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  customerHasReviewed: boolean;
  canReview: boolean;
}

export interface BookingListItem {
  id: number;
  providerName: string;
  providerBusinessName?: string;
  providerId: string;
  customerName: string;
  serviceName: string;
  serviceCategory: string;
  scheduledDate: string;
  scheduledTime: string;
  city?: string;
  quotedPrice: number;
  priceType: string;
  status: BookingStatus;
  createdAt: string;
  canReview: boolean;
}

export interface BookingStats {
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface GetMyBookingsResponse {
  bookings: BookingListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  stats: BookingStats;
}

export interface GetMyBookingsParams {
  status?: BookingStatus;
  role?: "customer" | "provider";
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "newest" | "oldest" | "scheduled";
}

export interface CreateBookingRequest {
  providerId: string;
  serviceId: number;
  scheduledDate: string;
  scheduledTime: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  customerNotes?: string;
}

export interface CreateBookingResponse {
  bookingId: number;
  message: string;
}

export interface UpdateBookingStatusRequest {
  newStatus: "Confirmed" | "InProgress" | "Completed" | "Rejected" | "NoShow";
  providerNotes?: string;
  finalPrice?: number;
}

export interface UpdateBookingStatusResponse {
  bookingId: number;
  status: string;
  message: string;
}

export interface CancelBookingRequest {
  cancellationReason?: string;
}

export interface CancelBookingResponse {
  bookingId: number;
  message: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookingId?: number;
}

export interface ProviderAvailabilityResponse {
  providerId: string;
  date: string;
  availableSlots: TimeSlot[];
  bookedSlots: TimeSlot[];
}

// ============= SERVICE =============

export const bookingService = {
  // Create a new booking (Customer only)
  create: async (
    data: CreateBookingRequest
  ): Promise<CreateBookingResponse> => {
    const response = await api.post<CreateBookingResponse>("/bookings", data);
    return response.data;
  },

  // Get my bookings (as customer or provider)
  getMyBookings: async (
    params: GetMyBookingsParams = {}
  ): Promise<GetMyBookingsResponse> => {
    const response = await api.get<GetMyBookingsResponse>("/bookings/my", {
      params,
    });
    return response.data;
  },

  // Get single booking details
  getById: async (bookingId: number): Promise<BookingDto> => {
    const response = await api.get<BookingDto>(`/bookings/${bookingId}`);
    return response.data;
  },

  // Update booking status (Provider only)
  updateStatus: async (
    bookingId: number,
    data: UpdateBookingStatusRequest
  ): Promise<UpdateBookingStatusResponse> => {
    const response = await api.put<UpdateBookingStatusResponse>(
      `/bookings/${bookingId}/status`,
      data
    );
    return response.data;
  },

  // Cancel a booking
  cancel: async (
    bookingId: number,
    data?: CancelBookingRequest
  ): Promise<CancelBookingResponse> => {
    const response = await api.post<CancelBookingResponse>(
      `/bookings/${bookingId}/cancel`,
      data || {}
    );
    return response.data;
  },

  // Get provider availability for a specific date
  getProviderAvailability: async (
    providerId: string,
    date: string
  ): Promise<ProviderAvailabilityResponse> => {
    const response = await api.get<ProviderAvailabilityResponse>(
      `/bookings/availability/${providerId}`,
      { params: { date } }
    );
    return response.data;
  },
};

export default bookingService;
