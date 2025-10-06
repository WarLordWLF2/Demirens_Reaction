import React from 'react'
import FrontHeader from '@/components/layout/FrontHeader'
import axios from 'axios'
import { useState, useEffect } from 'react'

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
  DollarSign, 
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
    const formData = new FormData();
    formData.append('method', 'view-reservations');

    try {
      const conn = await axios.post(APIConn, formData);
      if (conn.data) {
        console.log(conn.data)
        setResvData(conn.data !== 0 ? conn.data : 0)
      } else {
        toast('Failed to connect');
      }

    } catch (err) {
      toast('Something went wrong');
      console.log(err)
    } finally {
      resetUseState();
      toast('Done Loading');
    }
  }

  const insertBookingStatus = async () => {
    const dataSummary = {
      booking_id: selData.booking_id,
      booking_status_id: permission
    }

    const formData = new FormData();
    formData.append("method", "record-booking-status");
    formData.append("json", JSON.stringify(dataSummary));
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
      const activeBookingsFormData = new FormData();
      activeBookingsFormData.append('method', 'getActiveBookingsForDashboard');
      
      const activeBookingsResponse = await axios.post(APIConn, activeBookingsFormData);
      const activeBookingsData = JSON.parse(activeBookingsResponse.data);
      
      // Fetch transaction stats
      const statsFormData = new FormData();
      statsFormData.append('method', 'getTransactionStats');
      
      const statsResponse = await axios.post(APIConn, statsFormData);
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
                    {resvData.map((reservations, index) => (
                      <TableRow key={index}>
                        <TableCell>{reservations.booking_id}</TableCell>
                        <TableCell>{reservations.customers_walk_in_id === null ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          {reservations.customers_walk_in_id !== null
                            ? reservations.fullname
                            : reservations.customers_online_username}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            reservations.booking_status_name === 'Approved' ? 'default' :
                            reservations.booking_status_name === 'Pending' ? 'secondary' :
                            reservations.booking_status_name === 'Cancelled' ? 'destructive' : 'secondary'
                          }>
                            {reservations.booking_status_name ?? "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(reservations.booking_downpayment)}</TableCell>
                        <TableCell>{formatDateTime(reservations.booking_checkin_dateandtime)}</TableCell>
                        <TableCell>{formatDateTime(reservations.booking_checkout_dateandtime)}</TableCell>
                        <TableCell>{reservations.ref_num}</TableCell>
                        <TableCell>
                          <Button className="h-8 px-3 text-sm" onClick={() => editStatus(reservations)}>
                            <Ellipsis />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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