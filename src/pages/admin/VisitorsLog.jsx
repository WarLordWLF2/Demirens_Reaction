import React, { useEffect, useState, useMemo, useCallback } from 'react'
import AdminHeader from './components/AdminHeader'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Plus, 
  Pencil, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  Clock, 
  UserRound 
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useNavigate, useLocation } from 'react-router-dom'

function AdminVisitorsLog() {
  const APIConn = useMemo(() => `${localStorage.url}admin.php`, [])

  const navigate = useNavigate()
  const location = useLocation()

  // Data states
  const [logs, setLogs] = useState([])
  const [approvals, setApprovals] = useState([]) // [{visitorapproval_id, visitorapproval_status}]
  const [filteredLogs, setFilteredLogs] = useState([])

  // UI states
  const [loading, setLoading] = useState(true)
  // const [statsLoading, setStatsLoading] = useState(true) // removed: not used
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // visitorapproval_id or 'all'
  const [dateFrom, setDateFrom] = useState('') // yyyy-MM-dd
  const [dateTo, setDateTo] = useState('')

  // Modal (Add/Edit)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState(null) // row object or null
  const [formVisitorName, setFormVisitorName] = useState('')
  const [formPurpose, setFormPurpose] = useState('')
  const [formCheckin, setFormCheckin] = useState('')
  const [formCheckout, setFormCheckout] = useState('')
  const [formStatusId, setFormStatusId] = useState('')
  const [formBookingId, setFormBookingId] = useState('')

  // Helpers
  const getStatusNameById = useCallback((id) => {
    const found = approvals.find(a => String(a.visitorapproval_id) === String(id))
    return found?.visitorapproval_status || 'Unknown'
  }, [approvals])

  const getStatusIdByName = useCallback((targetStatusName) => {
    const target = approvals.find(a => (a.visitorapproval_status || '').toLowerCase().includes(String(targetStatusName).toLowerCase()))
    return target?.visitorapproval_id || ''
  }, [approvals])

  const nowLocalDT = useCallback(() => {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }, [])

  const getStatusColor = useCallback((statusName) => {
    const s = (statusName || '').toLowerCase()
    if (s.includes('pending')) return 'bg-yellow-500/15 text-yellow-700 border border-yellow-300'
    if (s.includes('approved')) return 'bg-green-500/15 text-green-700 border border-green-300'
    if (s.includes('rejected') || s.includes('declined')) return 'bg-red-500/15 text-red-700 border border-red-300'
    if (s.includes('checked-out') || s.includes('checkout')) return 'bg-gray-500/15 text-gray-700 border border-gray-300'
    return 'bg-blue-500/15 text-blue-700 border border-blue-300'
  }, [])

  const fetchApprovals = useCallback(async () => {
    try {
      const fd = new FormData()
      fd.append('method', 'get_visitor_approval_statuses')
      const res = await axios.post(APIConn, fd)
      const arr = Array.isArray(res.data) ? res.data : []
      // Normalize keys if backend returns different casing
      const normalized = arr.map(item => ({
        visitorapproval_id: item.visitorapproval_id ?? item.id ?? '',
        visitorapproval_status: item.visitorapproval_status ?? item.status ?? 'Unknown'
      }))
      setApprovals(normalized)
    } catch (err) {
      console.error('Error fetching visitor approval statuses:', err)
      setApprovals([])
    }
  }, [APIConn])

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const fd = new FormData()
      fd.append('method', 'get_visitor_logs')
      const res = await axios.post(APIConn, fd)
      const list = Array.isArray(res.data) ? res.data : []
      const normalized = list.map(item => ({
        visitorlogs_id: item.visitorlogs_id ?? item.id ?? '',
        visitorapproval_id: item.visitorapproval_id ?? item.status_id ?? null,
        booking_id: item.booking_id ?? null,
        employee_id: item.employee_id ?? null,
        visitorlogs_visitorname: item.visitorlogs_visitorname ?? item.visitor_name ?? '',
        visitorlogs_purpose: item.visitorlogs_purpose ?? item.purpose ?? '',
        visitorlogs_checkin_time: item.visitorlogs_checkin_time ?? item.checkin_time ?? '',
        visitorlogs_checkout_time: item.visitorlogs_checkout_time ?? item.checkout_time ?? ''
      }))
      setLogs(normalized)
      setFilteredLogs(normalized)
    } catch (err) {
      console.error('Error fetching visitor logs:', err)
      toast.error('Failed to fetch visitor logs')
      setLogs([])
      setFilteredLogs([])
    } finally {
      setLoading(false)
    }
  }, [APIConn])
 
   useEffect(() => {
     // Initial fetch
     fetchApprovals()
     fetchLogs()
   }, [fetchApprovals, fetchLogs])
 
   const applyFilters = useCallback(() => {
     let result = [...logs]
     // Search
     if (searchTerm) {
       const term = searchTerm.toLowerCase()
       result = result.filter(r => (
         (r.visitorlogs_visitorname || '').toLowerCase().includes(term) ||
         (r.visitorlogs_purpose || '').toLowerCase().includes(term) ||
         String(r.booking_id || '').includes(term)
       ))
     }
     // Status filter
     if (statusFilter !== 'all') {
       result = result.filter(r => String(r.visitorapproval_id) === String(statusFilter))
     }
     // Date range filter on check-in
     const from = dateFrom ? new Date(dateFrom) : null
     const to = dateTo ? new Date(dateTo) : null
     if (from) {
       result = result.filter(r => {
         const d = r.visitorlogs_checkin_time ? new Date(r.visitorlogs_checkin_time) : null
         return d ? d >= from : false
       })
     }
     if (to) {
       const toEnd = new Date(to)
       toEnd.setHours(23, 59, 59, 999)
       result = result.filter(r => {
         const d = r.visitorlogs_checkin_time ? new Date(r.visitorlogs_checkin_time) : null
         return d ? d <= toEnd : false
       })
     }
     setFilteredLogs(result)
   }, [logs, searchTerm, statusFilter, dateFrom, dateTo])
 
   const handleRefresh = useCallback(() => {
      fetchApprovals()
      fetchLogs()
    }, [fetchApprovals, fetchLogs])

  // If navigated back from booking room selection for visitors, prefill and auto-open
  useEffect(() => {
    if (location.state?.openVisitorModal) {
      const selRooms = location.state?.selectedBookingRooms
      const selRoom = location.state?.selectedBookingRoom || (Array.isArray(selRooms) && selRooms[0])
      if (selRoom?.booking_id) {
        setFormBookingId(String(selRoom.booking_id))
        if (selRoom.customer_name) {
          setFormVisitorName(selRoom.customer_name)
        }
      }
      setIsDialogOpen(true)
    }
  }, [location.state])

  useEffect(() => {
     applyFilters()
   }, [applyFilters])
 
   const clearFilters = useCallback(() => {
     setSearchTerm('')
     setStatusFilter('all')
     setDateFrom('')
     setDateTo('')
   }, [])
 
   const resetForm = () => {
     setEditingLog(null)
     setFormVisitorName('')
     setFormPurpose('')
     setFormCheckin('')
     setFormCheckout('')
     setFormStatusId('')
     setFormBookingId('')
   }

  // Quick helpers for better form UX
  const setCheckinNowInForm = useCallback(() => {
    setFormCheckin(nowLocalDT())
  }, [nowLocalDT])
  const setCheckoutNowInForm = useCallback(() => {
    setFormCheckout(nowLocalDT())
  }, [nowLocalDT])
  const clearCheckoutInForm = useCallback(() => {
    setFormCheckout('')
  }, [])
  const quickSetStatus = useCallback((name) => {
    const id = getStatusIdByName(name)
    if (id) setFormStatusId(String(id))
  }, [getStatusIdByName])
  const isFormValid = useMemo(
    () => Boolean(
      formVisitorName.trim() &&
      formPurpose.trim() &&
      formCheckin &&
      String(formBookingId).trim()
    ),
    [formVisitorName, formPurpose, formCheckin, formBookingId]
  )

  // Display label for booking selection combining ID and customer name
  const bookingDisplayLabel = useMemo(() => {
    const idStr = String(formBookingId || '').trim()
    if (!idStr) return ''
    const nameStr = String(formVisitorName || '').trim()
    return nameStr ? `${idStr} — ${nameStr}` : idStr
  }, [formBookingId, formVisitorName])

  const handleNavigateToBookingRoomSelection = () => {
    navigate('/admin/bookingroomselection', {
      state: { origin: 'visitorslog' }
    })
  }

  const openAddDialog = () => {
    resetForm()
    // Defaults for better UX
    setFormCheckin(nowLocalDT())
    const approvedId = getStatusIdByName('Approved')
    if (approvedId) setFormStatusId(String(approvedId))

    // Prefill booking from navigation state if user came back from selection
    const selRooms = location.state?.selectedBookingRooms
    const selRoom = location.state?.selectedBookingRoom || (Array.isArray(selRooms) && selRooms[0])
    if (selRoom?.booking_id) {
      setFormBookingId(String(selRoom.booking_id))
      if (selRoom.customer_name && !formVisitorName) {
        setFormVisitorName(selRoom.customer_name)
      }
    }

    setIsDialogOpen(true)
  }

  const openEditDialog = (row) => {
    setEditingLog(row)
    setFormVisitorName(row.visitorlogs_visitorname || '')
    setFormPurpose(row.visitorlogs_purpose || '')
    // Convert to datetime-local format if needed
    const toLocalDT = (dt) => {
      if (!dt) return ''
      // Assuming dt is like 'YYYY-MM-DD HH:mm:ss'
      const d = new Date(dt)
      const pad = (n) => String(n).padStart(2, '0')
      const yyyy = d.getFullYear()
      const mm = pad(d.getMonth() + 1)
      const dd = pad(d.getDate())
      const hh = pad(d.getHours())
      const mi = pad(d.getMinutes())
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
    }
    setFormCheckin(toLocalDT(row.visitorlogs_checkin_time))
    setFormCheckout(row.visitorlogs_checkout_time ? toLocalDT(row.visitorlogs_checkout_time) : '')
    setFormStatusId(row.visitorapproval_id ? String(row.visitorapproval_id) : '')
    setFormBookingId(row.booking_id ? String(row.booking_id) : '')
    setIsDialogOpen(true)
  }

  const submitLog = async () => {
    try {
      // Basic validation for better UX
      if (!formVisitorName.trim()) { toast.error('Visitor name is required'); return }
      if (!formPurpose.trim()) { toast.error('Purpose is required'); return }
      if (!formCheckin) { toast.error('Check-in time is required'); return }
      if (!String(formBookingId).trim()) { toast.error('Booking ID is required'); return }

      const fd = new FormData()
      const method = editingLog ? 'update_visitor_log' : 'add_visitor_log'
      fd.append('method', method)
      if (editingLog) fd.append('visitorlogs_id', editingLog.visitorlogs_id)
      fd.append('visitorlogs_visitorname', formVisitorName)
      fd.append('visitorlogs_purpose', formPurpose)
      if (formCheckin) fd.append('visitorlogs_checkin_time', formCheckin.replace('T', ' ') + ':00')
      if (formCheckout) fd.append('visitorlogs_checkout_time', formCheckout.replace('T', ' ') + ':00')
      const statusToSend = formStatusId || (!editingLog ? String(getStatusIdByName('Approved') || '') : '')
      if (statusToSend) fd.append('visitorapproval_id', statusToSend)
      fd.append('booking_id', formBookingId)
      // Include employee_id if available
      const employeeId = localStorage.getItem('userId')
      if (employeeId) fd.append('employee_id', employeeId)

      const res = await axios.post(APIConn, fd)
      const ok = res.data?.response === true || res.data?.success === true
      if (ok) {
        toast.success(editingLog ? 'Visitor log updated' : 'Visitor log added')
        setIsDialogOpen(false)
        resetForm()
        fetchLogs()
      } else {
        toast.error(res.data?.message || 'Failed to save visitor log')
      }
    } catch (err) {
      console.error('Error saving visitor log:', err)
      toast.error('Error saving visitor log')
    }
  }

  const setRowStatus = async (row, targetStatusName) => {
    try {
      // Normalize common synonyms to match backend statuses
      const normalized = (() => {
        const n = (targetStatusName || '').toLowerCase()
        if (n.includes('reject')) return 'declined'
        if (n.includes('decline')) return 'declined'
        if (n.includes('approve')) return 'approved'
        if (n.includes('check-out') || n.includes('checked-out')) return 'checked-out'
        if (n.includes('pend')) return 'pending'
        return n
      })()
      // Find status id by normalized name (case-insensitive contains)
      const target = approvals.find(a => (a.visitorapproval_status || '').toLowerCase().includes(normalized))
      if (!target) {
        toast.error(`Status "${targetStatusName}" not found. Please use Edit to set a status.`)
        return
      }
      const fd = new FormData()
      fd.append('method', 'set_visitor_approval')
      fd.append('visitorlogs_id', row.visitorlogs_id)
      fd.append('visitorapproval_id', target.visitorapproval_id)
      const res = await axios.post(APIConn, fd)
      const ok = res.data?.response === true || res.data?.success === true
      if (ok) {
        toast.success(`Status set to ${target.visitorapproval_status}`)
        fetchLogs()
      } else {
        toast.error(res.data?.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      toast.error('Error updating status')
    }
  }

  const setCheckoutNow = async (row) => {
    try {
      const fd = new FormData()
      fd.append('method', 'update_visitor_log')
      fd.append('visitorlogs_id', row.visitorlogs_id)
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const yyyy = now.getFullYear()
      const mm = pad(now.getMonth() + 1)
      const dd = pad(now.getDate())
      const hh = pad(now.getHours())
      const mi = pad(now.getMinutes())
      const ss = pad(now.getSeconds())
      fd.append('visitorlogs_checkout_time', `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`)

      const res = await axios.post(APIConn, fd)
      const ok = res.data?.response === true || res.data?.success === true
      if (ok) {
        // Try set status to Checked-Out if available
        const checkedOut = approvals.find(a => (a.visitorapproval_status || '').toLowerCase().includes('checked-out'))
        if (checkedOut) {
          const fd2 = new FormData()
          fd2.append('method', 'set_visitor_approval')
          fd2.append('visitorlogs_id', row.visitorlogs_id)
          fd2.append('visitorapproval_id', checkedOut.visitorapproval_id)
          await axios.post(APIConn, fd2)
        }
        toast.success('Checkout time updated')
        fetchLogs()
      } else {
        toast.error(res.data?.message || 'Failed to update checkout time')
      }
    } catch (err) {
      console.error('Error updating checkout time:', err)
      toast.error('Error updating checkout time')
    }
  }

  const saveAndSetStatus = useCallback(async (targetName) => {
    // Prevent approving without required info
    if ((targetName || '').toLowerCase().includes('approve')) {
      if (!formVisitorName.trim()) { toast.error('Visitor name is required before approval'); return }
      if (!String(formBookingId).trim()) { toast.error('Booking ID is required before approval'); return }
    }
    const current = editingLog
    await submitLog()
    if (current) {
      await setRowStatus(current, targetName)
    }
  }, [editingLog, submitLog, setRowStatus, formVisitorName, formBookingId])

  // Derived stats
  const stats = useMemo(() => {
    const counts = { total: logs.length, pending: 0, approved: 0, rejected: 0, checked_out: 0 }
    logs.forEach(r => {
      const name = getStatusNameById(r.visitorapproval_id).toLowerCase()
      if (name.includes('pending')) counts.pending++
      else if (name.includes('approved')) counts.approved++
      else if (name.includes('rejected') || name.includes('declined')) counts.rejected++
      else if (name.includes('checked-out') || name.includes('checkout')) counts.checked_out++
    })
    return counts
  }, [logs, getStatusNameById])

  return (
    <div className="min-h-screen w-full">
      {/* Pass onCollapse so content can offset for the fixed Sidebar */}
      <AdminHeader onCollapse={setIsCollapsed} />
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-0' : 'lg:ml-72'} px-4 md:px-6 lg:px-8 py-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Visitors Log</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <Clock className="h-4 w-4" /> Refresh
            </Button>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" /> Add Visitor Log
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="bg-muted/30 border-border">
            <CardHeader className="py-3"><CardTitle className="text-sm">Total Logs</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold">{stats.total}</div></CardContent>
          </Card>
          <Card className="bg-muted/30 border-border">
            <CardHeader className="py-3"><CardTitle className="text-sm">Pending</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div></CardContent>
          </Card>
          <Card className="bg-muted/30 border-border">
            <CardHeader className="py-3"><CardTitle className="text-sm">Approved</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold text-green-600">{stats.approved}</div></CardContent>
          </Card>
          <Card className="bg-muted/30 border-border">
            <CardHeader className="py-3"><CardTitle className="text-sm">Checked-Out</CardTitle></CardHeader>
            <CardContent className="py-3"><div className="text-2xl font-bold text-gray-600">{stats.checked_out}</div></CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4 bg-muted/20 border-border">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="flex items-center gap-2 md:col-span-2">
                <Search className="h-4 w-4" />
                <Input className="bg-muted/30 border-border" placeholder="Search visitor, purpose, booking id" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Status</Label>
                <Select value={String(statusFilter)} onValueChange={(v) => setStatusFilter(v)}>
                  <SelectTrigger className="w-full bg-muted/30 border-border">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {approvals.map(st => (
                      <SelectItem key={st.visitorapproval_id} value={String(st.visitorapproval_id)}>
                        {st.visitorapproval_status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">From</Label>
                <Input className="bg-muted/30 border-border" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">To</Label>
                <div className="flex gap-2">
                  <Input className="bg-muted/30 border-border" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  <Button variant="outline" onClick={clearFilters}>Clear</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-muted/20 border-border">
          <CardContent className="py-0">
            <ScrollArea className="w-full max-h-[60vh]">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="bg-muted/40">
                    <TableHead>ID</TableHead>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`sk-${i}`}>
                        <TableCell className="w-16"><div className="h-4 w-10 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-4 w-56 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-6 w-24 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="text-right"><div className="h-6 w-40 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <div className="py-8 text-center text-sm text-muted-foreground">No logs found. Try adjusting filters or adding a new visitor log.</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map(row => (
                      <TableRow key={row.visitorlogs_id}>
                        <TableCell className="w-16">{row.visitorlogs_id}</TableCell>
                        <TableCell className="font-medium flex items-center gap-2">
                          <UserRound className="h-4 w-4" /> {row.visitorlogs_visitorname || '—'}
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate">{row.visitorlogs_purpose || '—'}</TableCell>
                        <TableCell>{row.visitorlogs_checkin_time ? new Date(row.visitorlogs_checkin_time).toLocaleString() : '—'}</TableCell>
                        <TableCell>{row.visitorlogs_checkout_time ? new Date(row.visitorlogs_checkout_time).toLocaleString() : '—'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(getStatusNameById(row.visitorapproval_id))}>
                            {getStatusNameById(row.visitorapproval_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-20">{row.booking_id ?? '—'}</TableCell>
                        <TableCell className="w-20">{row.employee_id ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(row)} className="gap-1">
                              <Pencil className="h-3 w-3" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setRowStatus(row, 'Approved')} className="gap-1">
                              <CheckCircle className="h-3 w-3" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setRowStatus(row, 'Declined')} className="gap-1">
                              <XCircle className="h-3 w-3" /> Decline
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCheckoutNow(row)} className="gap-1">
                              <LogOut className="h-3 w-3" /> Check-Out
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm() }}>
        <DialogContent className="sm:max-w-[700px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editingLog ? 'Edit Visitor Log' : 'Add Visitor Log'}</span>
              {editingLog && (
                <Badge className={getStatusColor(getStatusNameById(editingLog.visitorapproval_id))}>
                  {getStatusNameById(editingLog.visitorapproval_id)}
                </Badge>
              )}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {editingLog ? `Log #${editingLog.visitorlogs_id}` : 'Create a new visitor entry. Fields marked * are required.'}
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Row 1: Visitor Name and Check-in */}
            <div>
              <Label className="mb-1 block">Visitor Name *</Label>
              <Input className="bg-muted/30 border-border" value={formVisitorName} onChange={(e) => setFormVisitorName(e.target.value)} placeholder="Enter visitor name" />
              <p className="text-[10px] text-muted-foreground mt-1">Full name of the visitor.</p>
            </div>
            <div>
              <Label className="mb-1 block">Check-in *</Label>
              <div className="flex items-center gap-2">
                <Input className="bg-muted/30 border-border" type="datetime-local" value={formCheckin} onChange={(e) => setFormCheckin(e.target.value)} />
                <Button type="button" variant="outline" size="sm" onClick={setCheckinNowInForm}>Now</Button>
              </div>
            </div>

            {/* Row 2: Booking ID centered */}
            <div className="md:col-span-2 flex justify-center">
              <div className="w-full md:w-1/2">
                <Label className="mb-1 block text-center md:text-left">Booking ID *</Label>
                <div className="flex items-center gap-2">
                  <Input className="bg-muted/30 border-border" value={bookingDisplayLabel} readOnly onClick={handleNavigateToBookingRoomSelection} placeholder="Select booking room" />
                  <Button type="button" variant="outline" size="sm" onClick={handleNavigateToBookingRoomSelection}>Select Booking Room</Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 text-center md:text-left">Link a booking to auto-fill customer name.</p>
              </div>
            </div>

            {/* Row 3: Purpose centered */}
            <div className="md:col-span-2 flex justify-center">
              <div className="w-full md:w-1/2">
                <Label className="mb-1 block text-center md:text-left">Purpose *</Label>
                <Textarea className="bg-muted/30 border-border" value={formPurpose} onChange={(e) => setFormPurpose(e.target.value)} placeholder="Enter purpose" />
                <p className="text-[10px] text-muted-foreground mt-1 text-center md:text-left">Reason for visit (e.g., deliver documents, site visit).</p>
              </div>
            </div>
          </div>

          {/* Check-out (Edit mode only) */}
          {editingLog && (
            <div className="mt-2">
              <Label className="mb-1 block">Check-out</Label>
              <div className="flex items-center gap-2">
                <Input className="bg-muted/30 border-border" type="datetime-local" value={formCheckout} onChange={(e) => setFormCheckout(e.target.value)} />
                <Button type="button" variant="outline" size="sm" onClick={setCheckoutNowInForm}>Now</Button>
                <Button type="button" variant="outline" size="sm" onClick={clearCheckoutInForm}>Clear</Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm() }}>Cancel</Button>
            {editingLog && (
              <>
                <Button variant="outline" onClick={() => saveAndSetStatus('Approved')} className="gap-1">
                  <CheckCircle className="h-4 w-4" /> Save & Approve
                </Button>
              </>
            )}
            {!editingLog && (
              <Button onClick={submitLog} disabled={!isFormValid}>Add Log</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminVisitorsLog