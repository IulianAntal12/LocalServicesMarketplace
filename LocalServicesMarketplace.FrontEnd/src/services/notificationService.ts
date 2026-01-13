import api from "./api";

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: string;
  bookingId?: number;
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
}

export interface NotificationSummary {
  unreadCount: number;
  totalCount: number;
}

export interface GetNotificationsResponse {
  notifications: NotificationDto[];
  summary: NotificationSummary;
  totalCount: number;
  totalPages: number;
}

export interface MarkAsReadResponse {
  markedCount: number;
  message: string;
}

export const notificationService = {
  getMyNotifications: async (params?: {
    isRead?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<GetNotificationsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.isRead !== undefined) {
      queryParams.append("isRead", String(params.isRead));
    }
    queryParams.append("page", String(params?.page || 1));
    queryParams.append("pageSize", String(params?.pageSize || 20));

    const response = await api.get<GetNotificationsResponse>(
      `/notifications?${queryParams.toString()}`
    );
    return response.data;
  },

  getSummary: async (): Promise<NotificationSummary> => {
    const response = await api.get<NotificationSummary>("/notifications/summary");
    return response.data;
  },

  markAsRead: async (id: number): Promise<MarkAsReadResponse> => {
    const response = await api.post<MarkAsReadResponse>(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  markAllAsRead: async (): Promise<MarkAsReadResponse> => {
    const response = await api.post<MarkAsReadResponse>("/notifications/read-all");
    return response.data;
  },
};
