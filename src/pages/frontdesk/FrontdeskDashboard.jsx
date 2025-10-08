import React from 'react'
import FrontHeader from '@/pages/frontdesk/comps/FrontHeader'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { DollarSign as DollarSignIcon } from 'lucide-react'

// ShadCN
import { toast } from 'sonner';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ScrollArea } from '@radix-ui/react-scroll-area';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Ellipsis, 
  TrendingUp, 
  Calendar, 
  /* DollarSign removed */
  User, 
  Building,
  Clock,
  CreditCard,
  Users,
  Bed
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { NumberFormatter } from '../admin/Function_Files/NumberFormatter'


function FrontdeskDashboard() {
  const APIConn = `${localStorage.url}front-desk.php`;

  // For the Booking Table
  const [resvData, setResvData] = useState([]);
  const [selData, setSelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState(0)
  
  // Dashboard statistics
  const [stats, setStats] = useState({
    activeBookings: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const bookingStatuses = {
    1: "Approved",
    2: "Pending",
    3: "Cancelled"
  };

  const [modalSettings, setModalSettings] = useState({
    modalMode: '',
    showModal: false
  });

  const editStatus = (reserveData) => {
    setModalSettings({
      modalMode: 'editResv',
      showModal: true
    })
    console.log('Data: ', reserveData);
    setSelData(reserveData);
    setPermission(reserveData.booking_status_id);
  }

  const getBookings = async () => {
    setIsLoading(true);

    try {
      const conn = await axios.get(`${APIConn}?method=viewBookingList`);
      console.log('API Response:', conn.data);
      
      // Parse the JSON response
      let bookingData = [];
      if (conn.data) {
        try {
          bookingData = JSON.parse(conn.data);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          bookingData = [];
        }
      }
      
      // Ensure resvData is always an array
      setResvData(Array.isArray(bookingData) ? bookingData : []);

    } catch (err) {
      setResvData([]); // Set to empty array on error
      toast.error('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      resetUseState();
    }
  }

  const insertBookingStatus = async () => {
    const dataSummary = {
      booking_id: selData.booking_id,
      booking_status_id: permission
    }

    const formData = new FormData();
    formData.append("method", "changeBookingStatus");
    formData.append("booking_id", selData.booking_id);
    formData.append("booking_status_id", permission);
    formData.append("employee_id", localStorage.getItem('userId') || 1);
    console.log(formData)

    try {
      const response = await axios.post(APIConn, formData);

      if (response.data.success) {
        toast("Booking status updated successfully");
        // Optionally refetch data:
        getBookings();
        resetUseState();
      } else {
        toast("Failed to update status");
        console.log(response.data);
        resetUseState();
      }
    } catch (err) {
      toast("Error updating status");
      console.error(err);
      resetUseState();
    }
  };


  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const [date, time] = dateTime.split(' ');
    const newDate = new Date(date);

    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const resetUseState = () => {
    setIsLoading(false);
    setModalSettings({ modalMode: "", showModal: false });
  }

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setIsStatsLoading(true);
      
      // Fetch active bookings
      const activeBookingsResponse = await axios.get(`${APIConn}?method=getActiveBookingsForDashboard`);
      const activeBookingsData = JSON.parse(activeBookingsResponse.data);
      
      // Fetch transaction stats
      const statsResponse = await axios.get(`${APIConn}?method=getTransactionStats`);
      const statsData = statsResponse.data;
      
      setStats({
        activeBookings: activeBookingsData.active_bookings_count || 0,
        todayRevenue: statsData.today?.total_amount_today || 0,
        weekRevenue: statsData.week?.total_amount_week || 0,
        monthRevenue: statsData.month?.total_amount_month || 0
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    getBookings();
    fetchDashboardStats();
  }, [])


  // For adding new bookings


  const formatCurrency = (amount) => {
    return NumberFormatter.formatCurrency(amount)
  }

  return (
    <>
      {/* Header and Label */}
      <div className="px-4 py-2">
        <FrontHeader />
        <div className="text-xl font-semibold mt-2">Front Desk Dashboard</div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 py-2 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.activeBookings}</div>
                <p className="text-xs text-muted-foreground">
                  Currently checked-in
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Revenue today
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats.weekRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Weekly revenue
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats.monthRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Monthly revenue
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Layout */}
      <div className="flex gap-4 px-4 py-2">
        {/* Table - 2/3 of the width */}
        <div className="w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>A list of your recent bookings and reservations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Walk-in</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Downpayment</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Ref #</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                {/* Scrollable table body */}
                <ScrollArea className="h-[400px] w-full">
                  <TableBody>
                    {Array.isArray(resvData) && resvData.length > 0 ? (
                      resvData.map((booking, index) => (
                      <TableRow key={index}>
                        <TableCell>{booking.booking_id}</TableCell>
                        <TableCell>{booking.customers_walk_in_id ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.customer_name}</div>
                            <div className="text-sm text-gray-500">{booking.customer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            booking.booking_status === 'Approved' ? 'default' :
                            booking.booking_status === 'Pending' ? 'secondary' :
                            booking.booking_status === 'Cancelled' ? 'destructive' : 'secondary'
                          }>
                            {booking.booking_status ?? "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(booking.downpayment)}</TableCell>
                        <TableCell>{formatDateTime(booking.booking_checkin_dateandtime)}</TableCell>
                        <TableCell>{formatDateTime(booking.booking_checkout_dateandtime)}</TableCell>
                        <TableCell>{booking.reference_no}</TableCell>
                        <TableCell>
                          <Button className="h-8 px-3 text-sm" onClick={() => editStatus(booking)}>
                            <Ellipsis />
                          </Button>
                        </TableCell>
                      </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </ScrollArea>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - 1/3 of the width */}
        <div className="w-1/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common front desk tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <User className="mr-2 h-4 w-4" />
                New Walk-in Booking
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Check-in Guest
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Building className="mr-2 h-4 w-4" />
                Room Status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Overview</CardTitle>
              <CardDescription>Key metrics for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Check-ins Today</span>
                </div>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Check-outs Today</span>
                </div>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bed className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Occupied Rooms</span>
                </div>
                <span className="font-semibold">{stats.activeBookings}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default FrontdeskDashboard

const DollarSign = ({ className = "" }) => <span className={className}>₱</span>