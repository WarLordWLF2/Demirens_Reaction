import React, { useState, useEffect, useCallback } from 'react'
import FrontHeader from '@/components/layout/FrontHeader'
import axios from 'axios'
import { toast } from 'sonner'

// ShadCN Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

// Icons
import { 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Eye, 
  RefreshCw,
  Clock,
  CreditCard,
  Bed,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Activity,
  DollarSign
} from "lucide-react"

// Utils
import { formatDateTime } from "@/lib/utils"

// Custom Components
import { RevenueCard, TransactionCard } from '../admin/Function_Files/MoneyCard'

function FrontdeskTransactionHis() {
  const APIConn = `${localStorage.url}front-desk.php`
  
  // State management
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [transactionType, setTransactionType] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  
  // Pagination
  const itemsPerPage = 20

  // Fetch transaction statistics
  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true)
      const formData = new FormData()
      formData.append('method', 'getTransactionStats')
      
      const response = await axios.post(APIConn, formData)
      const result = response.data
      
      console.log('Transaction Stats API Response:', result)
      
      if (result.success) {
        setStats(result)
        console.log('Stats breakdown:', {
          today: result.today,
          week: result.week,
          month: result.month
        })
      } else {
        console.error('Stats API Error:', result.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error fetching transaction stats:', error)
      toast.error('Failed to load transaction statistics')
    } finally {
      setIsStatsLoading(false)
    }
  }, [APIConn])

  // Fetch transactions with filters
  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('method', 'getTransactionHistory')
      formData.append('limit', itemsPerPage.toString())
      formData.append('offset', ((page - 1) * itemsPerPage).toString())
      formData.append('transaction_type', transactionType)
      formData.append('status_filter', statusFilter)
      
      if (dateFrom) formData.append('date_from', dateFrom)
      if (dateTo) formData.append('date_to', dateTo)
      
      const response = await axios.post(APIConn, formData)
      const result = response.data
      
      console.log('Transaction History API Response:', result)
      
      if (result.success) {
        setTransactions(result.transactions)
        setTotalCount(result.total_count)
        setTotalPages(result.total_pages)
        setCurrentPage(result.current_page)
      } else {
        console.error('Transaction History API Error:', result.error || 'Unknown error')
        toast.error('Failed to load transaction history')
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      toast.error('Failed to load transaction history')
    } finally {
      setIsLoading(false)
    }
  }, [APIConn, transactionType, statusFilter, dateFrom, dateTo, itemsPerPage])

  // Apply search filter
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      transaction.customer_name?.toLowerCase().includes(searchLower) ||
      transaction.reference_no?.toLowerCase().includes(searchLower) ||
      transaction.customer_email?.toLowerCase().includes(searchLower)
    )
  })

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
    fetchTransactions(1)
  }, [fetchTransactions])

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      fetchTransactions(newPage)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0)
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default'
      case 'completed': return 'default'
      case 'pending': return 'secondary'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FrontHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all transaction records
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.today?.total_amount_today || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {stats.today?.total_transactions || 0} transactions today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.week?.total_amount_week || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {stats.week?.total_transactions || 0} transactions this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.month?.total_amount_month || 0)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {stats.month?.total_transactions || 0} transactions this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction Type</label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="booking">Bookings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transactions ({totalCount})</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTransactions(currentPage)}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <TableRow key={`${transaction.transaction_type}-${transaction.transaction_id}`}>
                            <TableCell className="font-medium">
                              {transaction.reference_no}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{transaction.customer_name}</div>
                                <div className="text-sm text-gray-500">{transaction.customer_email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {transaction.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                                {transaction.booking_downpayment && (
                                  <div className="text-sm text-gray-500">
                                    Down: {formatCurrency(transaction.booking_downpayment)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(transaction.status)}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDateTime(transaction.transaction_date)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(transaction)
                                  setShowDetails(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Transaction Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reference Number</label>
                    <p className="text-lg">{selectedTransaction.reference_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction Type</label>
                    <p className="text-lg capitalize">{selectedTransaction.transaction_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Name</label>
                    <p className="text-lg">{selectedTransaction.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Email</label>
                    <p className="text-lg">{selectedTransaction.customer_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Phone</label>
                    <p className="text-lg">{selectedTransaction.customer_phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-lg font-semibold">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Downpayment</label>
                    <p className="text-lg">{formatCurrency(selectedTransaction.booking_downpayment)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-in Date</label>
                    <p className="text-lg">{formatDateTime(selectedTransaction.booking_checkin_dateandtime)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-out Date</label>
                    <p className="text-lg">{formatDateTime(selectedTransaction.booking_checkout_dateandtime)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction Date</label>
                    <p className="text-lg">{formatDateTime(selectedTransaction.transaction_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Performed By</label>
                    <p className="text-lg">{selectedTransaction.performed_by_name}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default FrontdeskTransactionHis

