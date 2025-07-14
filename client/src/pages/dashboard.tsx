import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Building, CheckCircle, Calendar, Clock, Eye, DoorOpen, Car, Laptop } from "lucide-react";
import type { Resource, BookingWithResource, DashboardStats } from "@/lib/types";

interface DashboardProps {
  onCreateBooking: () => void;
}

export default function Dashboard({ onCreateBooking }: DashboardProps) {
  const { data: resources = [], isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithResource[]>({
    queryKey: ["/api/bookings"],
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // Calculate stats
  const stats: DashboardStats = {
    totalResources: resources.length,
    availableNow: resources.filter(r => r.isAvailable).length,
    todayBookings: bookings.filter(b => {
      if (!b.bookings) return false;
      const bookingDate = new Date(b.bookings.startTime);
      return bookingDate >= today && bookingDate < tomorrow;
    }).length,
    upcomingBookings: bookings.filter(b => {
      if (!b.bookings) return false;
      const bookingStart = new Date(b.bookings.startTime);
      return bookingStart > now;
    }).length,
  };

  // Get active bookings (happening now)
  const activeBookings = bookings.filter(b => {
    if (!b.bookings) return false;
    const start = new Date(b.bookings.startTime);
    const end = new Date(b.bookings.endTime);
    return start <= now && end > now;
  }).slice(0, 3);

  // Get available resources (not currently booked)
  const bookedResourceIds = new Set(activeBookings.map(b => b.bookings?.resourceId).filter(Boolean));
  const availableResources = resources
    .filter(r => r.isAvailable && !bookedResourceIds.has(r.id))
    .slice(0, 3);

  const getResourceIcon = (name: string) => {
    if (name.toLowerCase().includes("room")) return DoorOpen;
    if (name.toLowerCase().includes("car")) return Car;
    if (name.toLowerCase().includes("laptop") || name.toLowerCase().includes("projector")) return Laptop;
    return Building;
  };

  const formatTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeRange = (start: string | Date, end: string | Date) => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  if (resourcesLoading || bookingsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-600">Overview of resources and bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Now</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableNow}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Bookings & Available Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Bookings */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Active Bookings</h3>
              <Link href="/bookings">
                <a className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</a>
              </Link>
            </div>
          </div>
          <CardContent className="p-6">
            {activeBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active bookings</p>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((booking) => {
                  if (!booking.bookings || !booking.resources) return null;
                  const Icon = getResourceIcon(booking.resources.name);
                  
                  return (
                    <div key={booking.bookings.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <h4 className="font-medium text-gray-900">{booking.resources.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{booking.bookings.purpose}</p>
                        <p className="text-xs text-gray-500">
                          {formatTimeRange(booking.bookings.startTime, booking.bookings.endTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{booking.bookings.bookedBy}</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Resources */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Available Resources</h3>
              <Link href="/resources">
                <a className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</a>
              </Link>
            </div>
          </div>
          <CardContent className="p-6">
            {availableResources.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No resources currently available</p>
            ) : (
              <div className="space-y-4">
                {availableResources.map((resource) => {
                  const Icon = getResourceIcon(resource.name);
                  
                  return (
                    <div key={resource.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <h4 className="font-medium text-gray-900">{resource.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{resource.location}</p>
                        <p className="text-xs text-gray-500">Capacity: {resource.capacity} people</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 mb-2">
                          Available
                        </Badge>
                        <Button
                          variant="link"
                          size="sm"
                          className="block text-xs text-blue-600 hover:text-blue-700 font-medium p-0 h-auto"
                          onClick={onCreateBooking}
                        >
                          Quick Book
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
