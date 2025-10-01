import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Users,
  CheckCircle,
  Package
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function AdminBookingRoomSelection() {
  const [bookingRooms, setBookingRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const navigate = useNavigate();
  const APIConn = `${localStorage.url}admin.php`;

  const fetchBookingRooms = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append('method', 'get_booking_rooms');
      
      console.log('🏨 Fetching booking rooms from:', APIConn);
      const response = await axios.post(APIConn, formData);
      console.log('📋 Booking rooms API response:', response.data);
      console.log('📊 Number of booking rooms received:', response.data?.length || 0);
      
      const rooms = response.data || [];
      setBookingRooms(rooms);
      setFilteredRooms(rooms);
      console.log('✅ Booking rooms set successfully');
    } catch (error) {
      console.error('❌ Error fetching booking rooms:', error);
      console.error('📝 Error response:', error.response?.data);
      console.error('📝 Error status:', error.response?.status);
      toast.error('Failed to fetch booking rooms');
      setBookingRooms([]);
      setFilteredRooms([]);
    } finally {
      setLoading(false);
    }
  }, [APIConn]);

  // Filter rooms based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRooms(bookingRooms);
    } else {
      const filtered = bookingRooms.filter(room =>
        room.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomtype_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.customers_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomnumber_id?.toString().includes(searchTerm)
      );
      setFilteredRooms(filtered);
    }
  }, [searchTerm, bookingRooms]);

  useEffect(() => {
    fetchBookingRooms();
  }, [fetchBookingRooms]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₱0.00';
    }
    
    try {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return '₱0.00';
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    console.log('🏨 Selected booking room:', room);
  };

  const handleConfirmSelection = () => {
    if (!selectedRoom) {
      toast.error('Please select a booking room first');
      return;
    }

    // Store the selected booking room data and navigate back
    localStorage.setItem('selectedBookingRoom', JSON.stringify(selectedRoom));
    navigate('/admin/requestedamenities', { 
      state: { 
        selectedBookingRoom: selectedRoom,
        openAmenityModal: true 
      } 
    });
  };

  const handleBackToAmenities = () => {
    navigate('/admin/requestedamenities');
  };

  const handleCancelSelection = () => {
    setSelectedRoom(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackToAmenities}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Amenity Requests
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Select Booking Room
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Choose a booking room to add amenities for
            </p>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Booking Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {bookingRooms.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Filtered Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredRooms.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Selected Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedRoom ? selectedRoom.roomnumber_id : 'None'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Search Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, reference, room type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Room Details with Confirmation */}
      {selectedRoom && (
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
                <CheckCircle className="h-5 w-5" />
                Selected Booking Room
              </CardTitle>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCancelSelection}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel Selection
                </Button>
                <Button
                  onClick={handleConfirmSelection}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Confirm Selection & Add Amenities
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedRoom.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Room</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    #{selectedRoom.roomnumber_id} • {selectedRoom.roomtype_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check-in</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedRoom.booking_checkin_dateandtime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reference</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedRoom.reference_no}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Available Booking Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Building className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="font-medium text-lg mb-2 text-gray-700 dark:text-gray-300">
                {searchTerm ? 'No rooms found matching your search' : 'No booking rooms available'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new bookings'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Room Details</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow 
                      key={room.booking_room_id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 ${
                        selectedRoom?.booking_room_id === room.booking_room_id 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-sm' 
                          : ''
                      }`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedRoom?.booking_room_id === room.booking_room_id
                              ? 'bg-green-600 border-green-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedRoom?.booking_room_id === room.booking_room_id && (
                              <div className="w-full h-full rounded-full bg-green-600"></div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{room.reference_no}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">ID: {room.booking_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">{room.customer_name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Users className="h-3 w-3" />
                            {room.bookingRoom_adult + room.bookingRoom_children} guests
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Mail className="h-3 w-3" />
                            {room.customers_email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Phone className="h-3 w-3" />
                            {room.customers_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              Room #{room.roomnumber_id}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{room.roomtype_name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Floor {room.roomfloor}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(room.roomtype_price)}/night
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="h-3 w-3" />
                            {formatDate(room.booking_checkin_dateandtime)}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Check-out: {formatDate(room.booking_checkout_dateandtime)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${
                            room.booking_status_name === 'Approved' 
                              ? 'border-green-500 text-green-700 dark:text-green-400' 
                              : room.booking_status_name === 'Checked-In'
                              ? 'border-blue-500 text-blue-700 dark:text-blue-400'
                              : 'border-gray-500 text-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {room.booking_status_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={selectedRoom?.booking_room_id === room.booking_room_id ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoomSelect(room);
                          }}
                          className={`min-w-[100px] transition-all duration-200 ${
                            selectedRoom?.booking_room_id === room.booking_room_id 
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                              : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          }`}
                        >
                          {selectedRoom?.booking_room_id === room.booking_room_id ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Selected
                            </>
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

export default AdminBookingRoomSelection;
