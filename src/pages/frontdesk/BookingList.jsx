import React, { useEffect, useCallback } from 'react'
import FrontHeader from '@/components/layout/FrontHeader'
import { useState } from 'react'
import axios from 'axios'

// ShadCN
import { toast } from 'sonner'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Filter, Eye, Settings, CalendarIcon, AlertTriangle, ExternalLink } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { NumberFormatter } from '../admin/Function_Files/NumberFormatter'

function FrontdeskBookingList() {
  const APIConn = `${localStorage.url}front-desk.php`

  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc')
  const [sortBy, setSortBy] = useState('booking_created_at')
  const [status, setStatus] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [showStatusChange, setShowStatusChange] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  const getAllStatus = useCallback(async () => {
    const formData = new FormData()
    formData.append('method', 'getAllBookingStatus')

    try {
      const res = await axios.post(APIConn, formData)
      if (res.data) {
        setStatus(res.data)
        console.log('Existing Statuses: ', res.data)
      } else {
        toast.error('Failed to Fetch Status')
      }
    } catch (err) {
      toast.error('Failed to get connect')
      console.log(err)
    }
  }, [APIConn])

  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('method', 'viewBookingList')

      const response = await axios.post(APIConn, formData)
      const result = response.data

      if (result && Array.isArray(result)) {
        setBookings(result)
        setFilteredBookings(result)
      } else {
        setBookings([])
        setFilteredBookings([])
        toast.warning('No bookings found')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to fetch bookings')
      setBookings([])
      setFilteredBookings([])
    } finally {
      setIsLoading(false)
    }
  }, [APIConn])

  // Filter bookings based on search and filters
  useEffect(() => {
    let filtered = bookings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.booking_status === statusFilter)
    }

    // Date filters
    if (dateFrom) {
      filtered = filtered.filter(booking => 
        new Date(booking.booking_checkin_dateandtime) >= new Date(dateFrom)
      )
    }

    if (dateTo) {
      filtered = filtered.filter(booking => 
        new Date(booking.booking_checkin_dateandtime) <= new Date(dateTo)
      )
    }

    setFilteredBookings(filtered)
  }, [bookings, searchTerm, statusFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchBookings()
    getAllStatus()
  }, [fetchBookings, getAllStatus])

  const handleStatusChange = async () => {
    if (!selectedBooking || !newStatus) return

    try {
      const formData = new FormData()
      formData.append('method', 'changeBookingStatus')
      formData.append('booking_id', selectedBooking.booking_id)
      formData.append('booking_status_id', newStatus)
      formData.append('employee_id', localStorage.getItem('userId') || 1)

      const response = await axios.post(APIConn, formData)
      const result = response.data

      if (result.success) {
        toast.success('Booking status updated successfully')
        setShowStatusChange(false)
        setSelectedBooking(null)
        setNewStatus('')
        fetchBookings() // Refresh the list
      } else {
        toast.error(result.error || 'Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Approved': return 'default'
      case 'Pending': return 'secondary'
      case 'Cancelled': return 'destructive'
      case 'Checked-In': return 'default'
      case 'Checked-Out': return 'outline'
      default: return 'secondary'
    }
  }

  const formatCurrency = (amount) => {
    return NumberFormatter.formatCurrency(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FrontHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Booking List
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all hotel bookings and reservations
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {status.map((statusItem) => (
                      <SelectItem key={statusItem.booking_status_id} value={statusItem.booking_status_name}>
                        {statusItem.booking_status_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in From</label>
                <Input
                  type="date"
                  value={dateFrom || ''}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in To</label>
                <Input
                  type="date"
                  value={dateTo || ''}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Rooms</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => (
                        <TableRow key={booking.booking_id}>
                          <TableCell className="font-medium">
                            {booking.reference_no}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.customer_name}</div>
                              <div className="text-sm text-gray-500">{booking.customer_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDateTime(booking.booking_checkin_dateandtime)}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(booking.booking_checkout_dateandtime)}
                          </TableCell>
                          <TableCell>
                            {booking.room_numbers || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(booking.booking_status)}>
                              {booking.booking_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{formatCurrency(booking.total_amount)}</div>
                              <div className="text-sm text-gray-500">
                                Down: {formatCurrency(booking.downpayment)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setShowCustomerDetails(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setShowStatusChange(true)
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Modal */}
        <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-lg">{selectedBooking.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg">{selectedBooking.customer_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-lg">{selectedBooking.customer_phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nationality</label>
                    <p className="text-lg">{selectedBooking.nationality}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-in</label>
                    <p className="text-lg">{formatDateTime(selectedBooking.booking_checkin_dateandtime)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-out</label>
                    <p className="text-lg">{formatDateTime(selectedBooking.booking_checkout_dateandtime)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rooms</label>
                    <p className="text-lg">{selectedBooking.room_numbers || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="text-lg font-semibold">{formatCurrency(selectedBooking.total_amount)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Change Modal */}
        <Dialog open={showStatusChange} onOpenChange={setShowStatusChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Booking Status</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Booking Reference</label>
                  <p className="text-lg">{selectedBooking.reference_no}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <Badge variant={getStatusBadgeVariant(selectedBooking.booking_status)}>
                    {selectedBooking.booking_status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {status.map((statusItem) => (
                        <SelectItem key={statusItem.booking_status_id} value={statusItem.booking_status_id.toString()}>
                          {statusItem.booking_status_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowStatusChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStatusChange} disabled={!newStatus}>
                    Update Status
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default FrontdeskBookingList

