import type { Resource, Booking, BookingWithResource } from "@shared/schema";

export type { Resource, Booking, BookingWithResource };

export interface DashboardStats {
  totalResources: number;
  availableNow: number;
  todayBookings: number;
  upcomingBookings: number;
}
