import React, { useEffect, useCallback } from 'react'
import AdminHeader from '@/pages/admin/components/AdminHeader';
import { useState } from 'react';
import axios from 'axios';

// ShadCN
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Search, Filter, ArrowRightLeft, Eye, Settings, CalendarPlus, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"
import { formatDateTime } from "@/lib/utils"
import RoomChangeSheet from "./SubPages/RoomChangeSheet"

function AdminBookingList() {
  const APIConn = `${localStorage.url}admin.php`;

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [status, setStatus] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showRoomChange, setShowRoomChange] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [showExtendBooking, setShowExtendBooking] = useState(false);
  const [newCheckoutDate, setNewCheckoutDate] = useState(null);
  const [extendStep, setExtendStep] = useState(1); // 1: Date selection, 2: Payment review, 3: Payment processing
  const [extensionCalculation, setExtensionCalculation] = useState(null);
  const [roomData, setRoomData] = useState([]);
  const [dateWarning, setDateWarning] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('2'); // Default to Cash
  const [isRoomDetailsExpanded, setIsRoomDetailsExpanded] = useState(false);

  const getAllStatus = useCallback(async () => {
    const formData = new FormData();
    formData.append('method', 'getAllStatus');

    try {
      const res = await axios.post(APIConn, formData);
      if (res.data) {
        setStatus(res.data);
        console.log('Existing Statuses: ', res.data);
      } else {
        toast.error('Failed to Fetch Status');
      }
    } catch (err) {
      toast.error('Failed to get connect');
      console.log(err);
    }
  }, [APIConn]);

  const fetchRoomData = useCallback(async () => {
    const formData = new FormData();
    formData.append('method', 'viewAllRooms');

    try {
      const res = await axios.post(APIConn, formData);
      if (res.data) {
        setRoomData(res.data);
        console.log('Room Data: ', res.data);
      } else {
        toast.error('Failed to Fetch Room Data');
      }
    } catch (err) {
      toast.error('Failed to get room data');
      console.log(err);
    }
  }, [APIConn]);
  

  const getBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('method', 'viewBookings');
      const res = await axios.post(APIConn, formData);

      // Ensure we always set an array, even if the response is unexpected
      if (Array.isArray(res.data)) {
        setBookings(res.data);
      } else if (res.data === 0 || res.data === null || res.data === undefined) {
        setBookings([]);
      } else {
        // If response is not an array but has some value, log it and set empty array
        console.warn('Unexpected API response format:', res.data);
        setBookings([]);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      toast.error('Error loading bookings');
      setBookings([]); // Ensure state is always an array even on error
    } finally {
      setIsLoading(false);
    }
  }, [APIConn]);

  useEffect(() => {
    getBookings();
    getAllStatus();
    fetchRoomData();
  }, [getBookings, getAllStatus, fetchRoomData]);

  // Filter bookings based on search term and filters
  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.roomtype_name?.toLowerCase().includes(searchTerm.toLowerCase()) && getRoomTypeDisplay(booking) !== 'More Rooms...')
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.booking_status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(booking => {
        const checkInDate = new Date(booking.booking_checkin_dateandtime);
        return checkInDate >= dateFrom;
      });
    }

    if (dateTo) {
      filtered = filtered.filter(booking => {
        const checkOutDate = new Date(booking.booking_checkout_dateandtime);
        return checkOutDate <= dateTo;
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, dateFrom, dateTo]);

  // Button handlers
  const handleStatusChange = (booking) => {
    console.log('Change Status clicked for booking:', booking);
    setSelectedBooking(booking);
    setNewStatus(booking.booking_status); // Set current status as default
    setShowStatusChange(true);
  };

  const fetchAvailableRooms = async () => {
    try {
      const formData = new FormData();
      formData.append("method", "viewBookingList");
      const res = await axios.post(APIConn, formData);
      const data = Array.isArray(res.data) ? res.data : [];

      setRooms(data);
    } catch (err) {
      console.error("Error fetching available rooms:", err);
      setRooms([]);
    }
  };

  const handleChangeRoom = (booking) => {
    console.log('Change Room clicked for booking:', booking);
    setSelectedBooking(booking);
    
    // Check if booking status allows room changes
    if (booking.booking_status !== 'Approved' && booking.booking_status !== 'Checked-In') {
      toast.error('Room changes are only allowed for bookings with "Approved" or "Checked-In" status');
      return;
    }
    
    // Fetch available rooms and show room change sheet
    fetchAvailableRooms();
    setShowRoomChange(true);
  };

  const handleViewCustomerDetails = (booking) => {
    console.log('View Customer Details clicked for booking:', booking);
    setSelectedBooking(booking);
    setIsRoomDetailsExpanded(false); // Reset dropdown state when opening modal
    setShowCustomerDetails(true);
  };

  const handleRoomChangeSuccess = () => {
    // Refresh bookings list after successful room change
    getBookings();
  };

  const handleExtendBooking = (booking) => {
    console.log('Extend Booking clicked for booking:', booking);
    setSelectedBooking(booking);
    
    // Check if booking status allows extension
    if (booking.booking_status !== 'Approved' && booking.booking_status !== 'Checked-In') {
      toast.error('Booking extensions are only allowed for bookings with "Approved" or "Checked-In" status');
      return;
    }
    
    setNewCheckoutDate(null);
    setExtendStep(1);
    setExtensionCalculation(null);
    setDateWarning('');
    setPaymentAmount(0);
    setPaymentMethod('2');
    setShowExtendBooking(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) {
      toast.error('Please select a new status');
      return;
    }

    // Prevent setting restricted statuses
    if (newStatus === 'Approved' || newStatus === 'Cancelled') {
      toast.error('Cannot set status to "Approved" or "Cancelled"');
      return;
    }

    // Find the status ID for the new status
    const selectedStatusItem = status.find(item => item.booking_status_name === newStatus);

    // Get current employee/admin ID (you may need to adjust this based on your auth system)
    const currentEmployeeId = localStorage.getItem('employeeId') || 1; // Default to 1 if not found

    // Build JSON data for the API
    const jsonData = {
      booking_id: selectedBooking.booking_id,
      employee_id: currentEmployeeId
    };

    // Add booking_status_id if available
    if (selectedStatusItem?.booking_status_id != null) {
      jsonData.booking_status_id = selectedStatusItem.booking_status_id;
    }

    // Add room_ids if available
    const candidateRoomIds = Array.isArray(selectedBooking?.room_ids)
      ? selectedBooking.room_ids
      : undefined;
    if (Array.isArray(candidateRoomIds)) {
      jsonData.room_ids = candidateRoomIds;
    }

    // Build FormData and submit to API
    const formData = new FormData();
    formData.append('method', 'changeBookingStatus');
    formData.append('json', JSON.stringify(jsonData));

    try {
      const res = await axios.post(APIConn, formData);
      if (res?.data?.success) {
        toast.success(`Status updated to ${newStatus} for booking ${selectedBooking.reference_no}`);
        setShowStatusChange(false);
        setSelectedBooking(null);
        setNewStatus('');
        getBookings();
      } else {
        const errMsg = res?.data?.message || res?.data?.error || 'Failed to update status';
        toast.error(errMsg);
      }
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Failed to connect');
    }
  }

  const calculateExtensionPayment = () => {
    if (!selectedBooking || !newCheckoutDate) {
      return null;
    }

    const currentCheckout = new Date(selectedBooking.booking_checkout_dateandtime);
    const newCheckout = new Date(newCheckoutDate);
    
    // Calculate number of additional nights
    const timeDiff = newCheckout.getTime() - currentCheckout.getTime();
    const additionalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (additionalNights <= 0) {
      return null;
    }

    // Get room pricing from room data
    let roomPrice = 0;
    let roomType = 'Standard Room';
    
    // Find the room data for this booking
    if (roomData && roomData.length > 0) {
      // Try to find room by room numbers from booking
      const bookingRoomNumbers = selectedBooking.room_numbers ? selectedBooking.room_numbers.split(',') : [];
      
      for (const room of roomData) {
        if (bookingRoomNumbers.includes(room.roomnumber_id.toString())) {
          roomPrice = parseFloat(room.roomtype_price) || 0;
          roomType = room.roomtype_name || 'Standard Room';
          break;
        }
      }
    }
    
    // Fallback to booking data if room data not found
    if (roomPrice === 0) {
      roomPrice = parseFloat(selectedBooking.roomtype_price) || 0;
      roomType = selectedBooking.roomtype_name || 'Standard Room';
    }
    
    const additionalAmount = roomPrice * additionalNights;

    return {
      additionalNights,
      roomPrice,
      additionalAmount,
      currentCheckout: currentCheckout.toISOString().split('T')[0],
      newCheckout: newCheckout.toISOString().split('T')[0],
      roomType
    };
  };

  const handleDateSelect = (date) => {
    if (!selectedBooking) return;
    
    const currentCheckout = new Date(selectedBooking.booking_checkout_dateandtime);
    
    if (date <= currentCheckout) {
      setDateWarning('Cannot pick this date');
      setNewCheckoutDate(null);
      return;
    }
    
    setDateWarning('');
    setNewCheckoutDate(date);
  };

  const handleExtendBookingNext = () => {
    if (!selectedBooking || !newCheckoutDate) {
      toast.error('Please select a new checkout date');
      return;
    }

    // Validate that new checkout date is after current checkout date
    const currentCheckout = new Date(selectedBooking.booking_checkout_dateandtime);
    if (newCheckoutDate <= currentCheckout) {
      toast.error('New checkout date must be after the current checkout date');
      return;
    }

    // Calculate extension payment
    const calculation = calculateExtensionPayment();
    if (!calculation) {
      toast.error('Unable to calculate extension payment');
      return;
    }

    setExtensionCalculation(calculation);
    setPaymentAmount(calculation.additionalAmount); // Set default payment amount to full amount
    setExtendStep(2);
  };

  const handlePaymentNext = () => {
    if (!extensionCalculation) {
      toast.error('Missing extension calculation');
      return;
    }

    if (paymentAmount < 0 || paymentAmount > extensionCalculation.additionalAmount) {
      toast.error('Payment amount must be between 0 and the total additional amount');
      return;
    }

    setExtendStep(3);
  };

  const handleExtendBookingSubmit = async () => {
    if (!selectedBooking || !newCheckoutDate || !extensionCalculation) {
      toast.error('Missing required information for extension');
      return;
    }

    if (paymentAmount < 0 || paymentAmount > extensionCalculation.additionalAmount) {
      toast.error('Invalid payment amount');
      return;
    }

    // Get current employee/admin ID
    const currentEmployeeId = localStorage.getItem('employeeId') || 1;
    const currentCheckout = new Date(selectedBooking.booking_checkout_dateandtime);

    // Format the new checkout date properly
    const newCheckoutDateTime = new Date(newCheckoutDate);
    newCheckoutDateTime.setHours(currentCheckout.getHours());
    newCheckoutDateTime.setMinutes(currentCheckout.getMinutes());
    newCheckoutDateTime.setSeconds(currentCheckout.getSeconds());

    // Build JSON data for the API
    const jsonData = {
      booking_id: selectedBooking.booking_id,
      employee_id: currentEmployeeId,
      new_checkout_date: newCheckoutDateTime.toISOString().slice(0, 19).replace('T', ' '),
      additional_nights: extensionCalculation.additionalNights,
      additional_amount: extensionCalculation.additionalAmount,
      payment_amount: paymentAmount,
      payment_method_id: paymentMethod,
      room_price: extensionCalculation.roomPrice
    };


    // Build FormData and submit to API
    const formData = new FormData();
    formData.append('method', 'extendBookingWithPayment');
    formData.append('json', JSON.stringify(jsonData));

    try {
      const res = await axios.post(APIConn, formData);
      if (res?.data?.success) {
        toast.success(`Booking extended successfully for ${selectedBooking.reference_no}`);
        setShowExtendBooking(false);
        setSelectedBooking(null);
        setNewCheckoutDate(null);
        setExtendStep(1);
        setExtensionCalculation(null);
        setPaymentAmount(0);
        setPaymentMethod('2');
        getBookings();
      } else {
        const errMsg = res?.data?.message || res?.data?.error || 'Failed to extend booking';
        toast.error(errMsg);
      }
    } catch (err) {
      console.error('Booking extension error:', err);
      toast.error('Failed to connect');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom(null);
    setDateTo(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { variant: 'secondary', className: 'bg-yellow-500 hover:bg-yellow-600' },
      'Approved': { variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
      'Checked-In': { variant: 'default', className: 'bg-emerald-500 hover:bg-emerald-600' },
      'Checked-Out': { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600' },
      'Cancelled': { variant: 'destructive', className: 'bg-red-500 hover:bg-red-600' }
    };

    const config = statusConfig[status] || { variant: 'outline', className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };


  const getRoomTypeDisplay = (booking) => {
    // Check if booking has multiple rooms by examining room_ids array
    const hasMultipleRooms = Array.isArray(booking.room_ids) && booking.room_ids.length > 1;
    
    // Also check room_numbers for multiple rooms
    const roomNumbers = booking.room_numbers;
    const hasMultipleNumbers = roomNumbers && 
      (roomNumbers.includes(',') || roomNumbers.includes(';') || 
       (roomNumbers.includes('-') && roomNumbers !== roomNumbers.replace('-', '')));
    
    if (hasMultipleRooms || hasMultipleNumbers) {
      return 'More Rooms...';
    }
    
    return booking.roomtype_name || 'Standard Room';
  };

  const getRoomTypeGroupsFromBooking = (booking) => {
    // Parse room numbers from the booking
    if (!booking.room_numbers) {
      return [{ roomType: booking.roomtype_name || 'Standard Room', count: 1, roomNumbers: ['Pending'] }];
    }

    const roomNumbers = booking.room_numbers.toString().split(',').map(num => num.trim());
    const roomTypeGroups = {};
    
    // Group rooms by type
    roomNumbers.forEach(roomNum => {
      // Find room data for this room number
      const roomInfo = roomData.find(room => room.roomnumber_id.toString() === roomNum);
      const roomType = roomInfo ? roomInfo.roomtype_name : 'Standard Room';
      
      if (!roomTypeGroups[roomType]) {
        roomTypeGroups[roomType] = {
          roomType: roomType,
          count: 0,
          roomNumbers: []
        };
      }
      
      roomTypeGroups[roomType].count += 1;
      roomTypeGroups[roomType].roomNumbers.push(roomNum);
    });

    return Object.values(roomTypeGroups);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all hotel bookings and their current status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredBookings.filter(b => b.booking_status === 'Pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active/Checked-In</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredBookings.filter(b => b.booking_status === 'Approved' || b.booking_status === 'Checked-In').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Checked-Out</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredBookings.filter(b => b.booking_status === 'Checked-Out').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Customer, Reference, Phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Array.isArray(status) && status.map((statusItem, index) => (
                      <SelectItem key={statusItem.booking_status_id} value={statusItem.booking_status_name}>
                        {statusItem.booking_status_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={clearFilters} className="text-sm">
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              All Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading bookings...</span>
              </div>
            ) : !Array.isArray(filteredBookings) || filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {filteredBookings.length === 0 && bookings.length > 0 ? 'No Matching Bookings' : 'No Bookings Available'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filteredBookings.length === 0 && bookings.length > 0
                    ? 'Try adjusting your search criteria or filters.'
                    : 'There are currently no bookings to display.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[1050px]">
                  <TableCaption className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    A comprehensive list of all hotel bookings
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700 border-b">
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[100px]">Reference No</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white w-[200px]">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[150px]">Room Type</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[150px]">Check-in</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[150px]">Check-out</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[120px]">Amount</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[100px]">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center w-[300px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                    <TableBody>
                      {filteredBookings.map((b, i) => (
                        <TableRow key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-600">
                          <TableCell className="font-mono text-sm text-gray-900 dark:text-white text-center py-3">
                            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                              {b.reference_no || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-gray-900 dark:text-white py-3">
                            <div className="space-y-1">
                              <div className="font-semibold text-sm truncate">{b.customer_name}</div>
                              <div className="space-y-1">
                                {b.nationality && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1 py-0.5 rounded-full inline-block">
                                    {b.nationality}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">{b.customer_phone}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300 text-center py-3">
                            <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                              getRoomTypeDisplay(b) === 'More Rooms...' 
                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' 
                                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            }`}>
                              {getRoomTypeDisplay(b)}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300 text-center py-3">
                            <div className="text-xs">
                              {formatDateTime(b.booking_checkin_dateandtime)}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300 text-center py-3">
                            <div className="text-xs">
                              {formatDateTime(b.booking_checkout_dateandtime)}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300 text-center py-3">
                            <div className="space-y-1">
                              <div className="font-semibold text-green-600 dark:text-green-400 text-xs">
                                ₱{b.total_amount?.toLocaleString() || '0'}
                              </div>
                              {b.downpayment && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Down: ₱{b.downpayment.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-3">
                            {getStatusBadge(b.booking_status)}
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewCustomerDetails(b)}
                                className="text-xs h-7 px-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleExtendBooking(b)}
                                className="text-xs h-7 px-3 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                <CalendarPlus className="w-3 h-3 mr-1" />
                                Extend
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleChangeRoom(b)}
                                className="text-xs h-7 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <ArrowRightLeft className="w-3 h-3 mr-1" />
                                Room
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Modal */}
        <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="text-center pb-6 border-b">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Booking Information
                {selectedBooking && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-3">
                    #{selectedBooking.booking_id || 'N/A'}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6 mt-6">
                {/* Status Banner */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border border-blue-200 dark:border-blue-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-transparent rounded-bl-full"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(selectedBooking.booking_status)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">Booking Status</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedBooking.customer_name}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedBooking.customer_email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ₱{selectedBooking.total_amount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Booking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Reference Number</label>
                      <p className="text-gray-900 dark:text-white font-mono">{selectedBooking.reference_no || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedBooking.booking_status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Check-in Date</label>
                      <p className="text-gray-900 dark:text-white">{formatDateTime(selectedBooking.booking_checkin_dateandtime)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Check-out Date</label>
                      <p className="text-gray-900 dark:text-white">{formatDateTime(selectedBooking.booking_checkout_dateandtime)}</p>
                    </div>
                    {selectedBooking.downpayment && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Downpayment</label>
                        <p className="text-gray-900 dark:text-white font-semibold">₱{selectedBooking.downpayment.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</label>
                      <p className="text-gray-900 dark:text-white font-semibold">₱{selectedBooking.total_amount?.toLocaleString() || 'N/A'}</p>
                    </div>
                     <div>
                       <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Room Details</label>
                       <div className="text-gray-900 dark:text-white">
                         {(() => {
                           const roomGroups = getRoomTypeGroupsFromBooking(selectedBooking);
                           const totalRooms = roomGroups.reduce((sum, group) => sum + group.count, 0);
                           
                           return (
                             <div className="space-y-2">
                               {/* Summary Row with Dropdown Button */}
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   {roomGroups.length > 1 ? (
                                     <span className="font-semibold text-orange-600 dark:text-orange-400">
                                       Multiple Room Types ({totalRooms} total rooms)
                                     </span>
                                   ) : (
                                     <span className="font-semibold">
                                       {roomGroups[0]?.roomType || 'Standard Room'}
                                       {roomGroups[0]?.count > 1 && (
                                         <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                                           ×{roomGroups[0].count}
                                         </span>
                                       )}
                                     </span>
                                   )}
                                 </div>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => setIsRoomDetailsExpanded(!isRoomDetailsExpanded)}
                                   className="h-7 px-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                 >
                                   {isRoomDetailsExpanded ? (
                                     <>
                                       <ChevronUp className="w-4 h-4" />
                                       <span className="ml-1 text-xs">Hide Details</span>
                                     </>
                                   ) : (
                                     <>
                                       <ChevronDown className="w-4 h-4" />
                                       <span className="ml-1 text-xs">Show Details</span>
                                     </>
                                   )}
                                 </Button>
                               </div>

                               {/* Collapsible Room Details */}
                               {isRoomDetailsExpanded && (
                                 <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                   <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                     {roomGroups.map((group, index) => (
                                       <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                                         <div className={group.count > 1 ? 'flex items-center gap-2' : ''}>
                                           <span className="font-semibold text-sm">{group.roomType}</span>
                                           {group.count > 1 && (
                                             <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                                               ×{group.count}
                                             </span>
                                           )}
                                         </div>
                                         <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                           Room #{group.roomNumbers.join(', #')}
                                         </div>
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               )}
                             </div>
                           );
                         })()}
                       </div>
                     </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(selectedBooking.special_requests || selectedBooking.notes) && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Additional Information</h3>
                    {selectedBooking.special_requests && (
                      <div className="mb-3">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Special Requests</label>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.special_requests}</p>
                      </div>
                    )}
                    {selectedBooking.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</label>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCustomerDetails(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedBooking);
                      setShowCustomerDetails(false);
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Change Status
                  </Button>
                  <Button
                    onClick={() => {
                      handleChangeRoom(selectedBooking);
                      setShowCustomerDetails(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Change Room
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Change Modal */}
        <Dialog open={showStatusChange} onOpenChange={setShowStatusChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Change Booking Status
              </DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                {/* Current Booking Info */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Booking Details</h3>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">Reference:</span> {selectedBooking.reference_no}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">Customer:</span> {selectedBooking.customer_name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">Current Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedBooking.booking_status)}</span>
                  </p>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select New Status
                  </label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(status) && status
                        .filter(statusItem =>
                          // Filter out statuses that admins cannot manually set
                          statusItem.booking_status_name !== 'Approved' &&
                          statusItem.booking_status_name !== 'Cancelled'
                        )
                        .map((statusItem) => (
                          <SelectItem key={statusItem.booking_status_id} value={statusItem.booking_status_name}>
                            {statusItem.booking_status_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowStatusChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={!newStatus || newStatus === selectedBooking.booking_status}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
         </Dialog>

         {/* Extend Booking Modal */}
         <Dialog open={showExtendBooking} onOpenChange={setShowExtendBooking}>
           <DialogContent className="max-w-lg">
             <DialogHeader>
               <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                 <CalendarPlus className="w-5 h-5" />
                 Extend Booking
                 <div className="flex items-center gap-2 ml-auto">
                   <span className="text-sm text-gray-500 dark:text-gray-400">
                     Step {extendStep} of 3
                   </span>
                   <div className="flex gap-1">
                     <div className={`w-2 h-2 rounded-full ${extendStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                     <div className={`w-2 h-2 rounded-full ${extendStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                     <div className={`w-2 h-2 rounded-full ${extendStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                   </div>
                 </div>
               </DialogTitle>
             </DialogHeader>

             {selectedBooking && (
               <div className="space-y-6">
                 {/* Current Booking Info */}
                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                   <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     Booking Details
                   </h3>
                   <div className="grid grid-cols-1 gap-2">
                     <p className="text-sm text-gray-900 dark:text-white">
                       <span className="font-medium text-blue-700 dark:text-blue-300">Reference:</span> 
                       <span className="ml-2 font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">
                         {selectedBooking.reference_no}
                       </span>
                     </p>
                     <p className="text-sm text-gray-900 dark:text-white">
                       <span className="font-medium text-blue-700 dark:text-blue-300">Customer:</span> {selectedBooking.customer_name}
                     </p>
                     <p className="text-sm text-gray-900 dark:text-white">
                       <span className="font-medium text-blue-700 dark:text-blue-300">Current Checkout:</span> 
                       <span className="ml-2 font-medium">{formatDateTime(selectedBooking.booking_checkout_dateandtime)}</span>
                     </p>
                   </div>
                 </div>

                 {extendStep === 1 && (
                   <>
                     {/* Date Selection */}
                     <div className="space-y-3">
                       <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                         <CalendarIcon className="w-4 h-4" />
                         Select New Checkout Date
                       </label>
                       <Input
                         type="date"
                         value={newCheckoutDate ? newCheckoutDate.toISOString().split('T')[0] : ''}
                         onChange={(e) => {
                           const dateValue = e.target.value;
                           if (dateValue) {
                             const selectedDate = new Date(dateValue);
                             handleDateSelect(selectedDate);
                           } else {
                             setDateWarning('');
                             setNewCheckoutDate(null);
                           }
                         }}
                         min={(() => {
                           const currentCheckout = new Date(selectedBooking.booking_checkout_dateandtime);
                           currentCheckout.setDate(currentCheckout.getDate() + 1);
                           return currentCheckout.toISOString().split('T')[0];
                         })()}
                         className="w-full h-12 border-2 hover:border-blue-500 focus:border-blue-500 transition-colors text-center"
                       />
                       {dateWarning ? (
                         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                           <p className="text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                             </svg>
                             {dateWarning}
                           </p>
                         </div>
                       ) : (
                         <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                           <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             New checkout date must be after the current checkout date
                           </p>
                         </div>
                       )}
                     </div>

                     {/* Action Buttons */}
                     <div className="flex justify-between pt-4">
                       <Button 
                         variant="outline" 
                         onClick={() => setShowExtendBooking(false)}
                         className="px-6"
                       >
                         Cancel
                       </Button>
                       <Button
                         onClick={handleExtendBookingNext}
                         className="bg-blue-600 hover:bg-blue-700 px-6"
                         disabled={!newCheckoutDate}
                       >
                         Next: Review Payment
                         <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                       </Button>
                     </div>
                   </>
                 )}

                 {extendStep === 2 && extensionCalculation && (
                   <>
                     {/* Payment Calculation Review */}
                     <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                       <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                         </svg>
                         Extension Payment Calculation
                       </h3>
                       
                       <div className="space-y-3">
                         <div className="grid grid-cols-2 gap-4 text-sm">
                           <div>
                             <span className="text-gray-600 dark:text-gray-400">Room Type:</span>
                             <p className="font-medium text-gray-900 dark:text-white">{extensionCalculation.roomType}</p>
                           </div>
                           <div>
                             <span className="text-gray-600 dark:text-gray-400">Room Price/Night:</span>
                             <p className="font-medium text-gray-900 dark:text-white">₱{extensionCalculation.roomPrice.toLocaleString()}</p>
                           </div>
                         </div>
                         
                         <div className="border-t border-green-200 dark:border-green-700 pt-3">
                           <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                               <span className="text-gray-600 dark:text-gray-400">Current Checkout:</span>
                               <p className="font-medium text-gray-900 dark:text-white">{extensionCalculation.currentCheckout}</p>
                             </div>
                             <div>
                               <span className="text-gray-600 dark:text-gray-400">New Checkout:</span>
                               <p className="font-medium text-gray-900 dark:text-white">{extensionCalculation.newCheckout}</p>
                             </div>
                           </div>
                         </div>
                         
                         <div className="bg-white dark:bg-gray-800 p-3 rounded border border-green-200 dark:border-green-700">
                           <div className="flex justify-between items-center text-sm">
                             <span className="text-gray-600 dark:text-gray-400">Additional Nights:</span>
                             <span className="font-medium text-gray-900 dark:text-white">{extensionCalculation.additionalNights} night(s)</span>
                           </div>
                           <div className="flex justify-between items-center text-sm mt-1">
                             <span className="text-gray-600 dark:text-gray-400">Rate per Night:</span>
                             <span className="font-medium text-gray-900 dark:text-white">₱{extensionCalculation.roomPrice.toLocaleString()}</span>
                           </div>
                           <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                             <div className="flex justify-between items-center">
                               <span className="font-medium text-gray-900 dark:text-white">Total Additional Amount:</span>
                               <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                 ₱{extensionCalculation.additionalAmount.toLocaleString()}
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex justify-between pt-4">
                       <Button 
                         variant="outline" 
                         onClick={() => setExtendStep(1)}
                         className="px-6"
                       >
                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                         </svg>
                         Back
                       </Button>
                       <div className="flex gap-3">
                         <Button 
                           variant="outline" 
                           onClick={() => setShowExtendBooking(false)}
                           className="px-6"
                         >
                           Cancel
                         </Button>
                       <Button
                         onClick={handlePaymentNext}
                         className="bg-blue-600 hover:bg-blue-700 px-6"
                       >
                         Next: Payment
                         <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                       </Button>
                       </div>
                     </div>
                   </>
                 )}

                 {extendStep === 3 && extensionCalculation && (
                   <>
                     {/* Payment Processing */}
                     <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                       <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                         </svg>
                         Payment Processing
                       </h3>
                       
                       <div className="space-y-4">
                         {/* Payment Summary */}
                         <div className="bg-white dark:bg-gray-800 p-3 rounded border border-purple-200 dark:border-purple-700">
                           <div className="flex justify-between items-center text-sm mb-2">
                             <span className="text-gray-600 dark:text-gray-400">Total Additional Amount:</span>
                             <span className="font-medium text-gray-900 dark:text-white">₱{extensionCalculation.additionalAmount.toLocaleString()}</span>
                           </div>
                           <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                             <div className="flex justify-between items-center">
                               <span className="font-medium text-gray-900 dark:text-white">Remaining Balance:</span>
                               <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                                 ₱{(extensionCalculation.additionalAmount - paymentAmount).toLocaleString()}
                               </span>
                             </div>
                           </div>
                         </div>

                         {/* Payment Method */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                             Payment Method
                           </label>
                           <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                             <SelectTrigger>
                               <SelectValue placeholder="Select payment method" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="2">Cash</SelectItem>
                               <SelectItem value="1">GCash</SelectItem>
                               <SelectItem value="3">PayMaya</SelectItem>
                               <SelectItem value="4">Check</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>

                         {/* Payment Amount */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                             Payment Amount (₱)
                           </label>
                           <Input
                             type="number"
                             min="0"
                             max={extensionCalculation.additionalAmount}
                             step="0.01"
                             value={paymentAmount}
                             onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                             placeholder="Enter payment amount"
                             className="w-full"
                           />
                           <p className="text-xs text-gray-500 dark:text-gray-400">
                             Enter 0 if customer cannot pay now, or partial amount if paying partially
                           </p>
                         </div>

                         {/* Payment Summary */}
                         <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                           <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                               <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                               <p className="font-medium text-green-600 dark:text-green-400">₱{paymentAmount.toLocaleString()}</p>
                             </div>
                             <div>
                               <span className="text-gray-600 dark:text-gray-400">Added to Booking:</span>
                               <p className="font-medium text-blue-600 dark:text-blue-400">₱{(extensionCalculation.additionalAmount - paymentAmount).toLocaleString()}</p>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex justify-between pt-4">
                       <Button 
                         variant="outline" 
                         onClick={() => setExtendStep(2)}
                         className="px-6"
                       >
                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                         </svg>
                         Back
                       </Button>
                       <div className="flex gap-3">
                         <Button 
                           variant="outline" 
                           onClick={() => setShowExtendBooking(false)}
                           className="px-6"
                         >
                           Cancel
                         </Button>
                         <Button
                           onClick={handleExtendBookingSubmit}
                           className="bg-green-600 hover:bg-green-700 px-6"
                         >
                           <CalendarPlus className="w-4 h-4 mr-2" />
                           Confirm Extension
                         </Button>
                       </div>
                     </div>
                   </>
                 )}
               </div>
             )}
           </DialogContent>
         </Dialog>

         {/* Room Change Sheet */}
         <RoomChangeSheet
           isOpen={showRoomChange}
           onClose={() => setShowRoomChange(false)}
           selectedBooking={selectedBooking}
           availableRooms={rooms}
           onRoomChangeSuccess={handleRoomChangeSuccess}
         />
       </div>
     </div>
   )
 }

export default AdminBookingList