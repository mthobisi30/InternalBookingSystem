import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  X,
  DoorOpen, 
  Car, 
  Laptop, 
  Building,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CreateBookingModal } from "@/components/modals/create-booking-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BookingWithResource, Resource } from "@/lib/types";

interface BookingsProps {
  createModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
}

export default function Bookings({ createModalOpen, setCreateModalOpen }: BookingsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<BookingWithResource[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Booking cancelled successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getResourceIcon = (name: string) => {
    if (name.toLowerCase().includes("room")) return DoorOpen;
    if (name.toLowerCase().includes("car")) return Car;
    if (name.toLowerCase().includes("laptop") || name.toLowerCase().includes("projector")) return Laptop;
    return Building;
  };

  const getBookingStatus = (booking: BookingWithResource) => {
    if (!booking.bookings) return "unknown";
    
    const now = new Date();
    const start = new Date(booking.bookings.startTime);
    const end = new Date(booking.bookings.endTime);
    
    if (start <= now && end > now) return "active";
    if (start > now) return "upcoming";
    return "completed";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleCancel = (id: number, resourceName: string) => {
    if (confirm(`Are you sure you want to cancel this booking for "${resourceName}"?`)) {
      deleteBookingMutation.mutate(id);
    }
  };

  const formatDate = (dateTime: string | Date) => {
    const date = new Date(dateTime);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
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

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    if (!booking.bookings || !booking.resources) return false;
    
    const matchesSearch = booking.resources.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookings.bookedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookings.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResource = !resourceFilter || booking.bookings.resourceId.toString() === resourceFilter;
    
    const matchesDate = !dateFilter || 
                       new Date(booking.bookings.startTime).toDateString() === new Date(dateFilter).toDateString();
    
    const status = getBookingStatus(booking);
    const matchesStatus = !statusFilter || status === statusFilter;
    
    return matchesSearch && matchesResource && matchesDate && matchesStatus;
  });

  if (bookingsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="mb-8">
          <CardContent className="p-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Bookings</h2>
          <p className="mt-2 text-gray-600">Manage all resource bookings</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="search-bookings" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search-bookings"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="filter-resource" className="block text-sm font-medium text-gray-700 mb-2">
                Resource
              </label>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Resources</SelectItem>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id.toString()}>
                      {resource.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="filter-date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                id="filter-date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="filter-booking-status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setResourceFilter("");
                  setDateFilter("");
                  setStatusFilter("");
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Booked By</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm || resourceFilter || dateFilter || statusFilter ? "No bookings match your filters" : "No bookings found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => {
                  if (!booking.bookings || !booking.resources) return null;
                  
                  const Icon = getResourceIcon(booking.resources.name);
                  const status = getBookingStatus(booking);
                  
                  return (
                    <TableRow key={booking.bookings.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Icon className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{booking.resources.name}</div>
                            <div className="text-sm text-gray-500">{booking.resources.location}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">{booking.bookings.bookedBy}</TableCell>
                      <TableCell className="text-sm text-gray-900">{booking.bookings.purpose}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">{formatDate(booking.bookings.startTime)}</div>
                        <div className="text-sm text-gray-500">
                          {formatTimeRange(booking.bookings.startTime, booking.bookings.endTime)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCancel(booking.bookings.id, booking.resources.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredBookings.length}</span> of <span className="font-medium">{filteredBookings.length}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-600 text-white">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CreateBookingModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
    </div>
  );
}
