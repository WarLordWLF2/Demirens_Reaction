import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Settings, CheckCircle, XCircle, AlertCircle, Calculator, Receipt, CreditCard, DollarSign, Eye } from "lucide-react";
import AdminHeader from "./components/AdminHeader";

function CreateInvoice() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [billingBreakdown, setBillingBreakdown] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [bookingCharges, setBookingCharges] = useState([]);
  const [detailedCharges, setDetailedCharges] = useState(null);
  const [showDetailedCharges, setShowDetailedCharges] = useState(false);
  const [newChargeForm, setNewChargeForm] = useState({
    charge_name: '',
    charge_price: '',
    quantity: 1,
    category_id: 4
  });
  const [invoiceForm, setInvoiceForm] = useState({
    payment_method_id: 2,
    discount_id: null,
    vat_rate: 0.12,
    downpayment: 0,
    invoice_status_id: 1
  });

  const fetchBookings = async () => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      console.log("Fetching bookings from URL:", url);
      const formData = new FormData();
      formData.append("operation", "getBookingsWithBillingStatus");
      const res = await axios.post(url, formData);
      console.log("API Response:", res.data);
      setBookings(res.data !== 0 ? res.data : []);
      console.log("Bookings set:", res.data !== 0 ? res.data : []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      toast.error("Error loading bookings: " + err.message);
    }
  };

  const validateBilling = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "validateBillingCompleteness");
      formData.append("json", JSON.stringify({ booking_id: bookingId }));
      
      const res = await axios.post(url, formData);
      setValidationResult(res.data);
      return res.data;
    } catch (err) {
      toast.error("Error validating billing");
      return { success: false, message: "Validation failed" };
    }
  };

  const createBillingRecord = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "createBillingRecord");
      formData.append("json", JSON.stringify({ 
        booking_id: bookingId,
        employee_id: 1
      }));
      
      const res = await axios.post(url, formData);
      return res.data?.success || false;
    } catch (err) {
      console.error("Error creating billing record:", err);
      return false;
    }
  };

  const calculateBillingBreakdown = async (bookingId) => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "calculateComprehensiveBilling");
      formData.append("json", JSON.stringify({ 
        booking_id: bookingId,
        discount_id: invoiceForm.discount_id,
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
      }));
      
      console.log("Calculating billing breakdown for booking:", bookingId);
      console.log("Request data:", { 
        booking_id: bookingId,
        discount_id: invoiceForm.discount_id,
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
      });
      
      const res = await axios.post(url, formData);
      console.log("Billing breakdown API response:", res.data);
      console.log("Billing breakdown type check:", {
        room_total: typeof res.data.room_total,
        room_total_value: res.data.room_total,
        charge_total: typeof res.data.charge_total,
        charge_total_value: res.data.charge_total
      });
      setBillingBreakdown(res.data);
      return res.data;
    } catch (err) {
      console.error("Error calculating billing breakdown:", err);
      toast.error("Error calculating billing breakdown: " + err.message);
      return null;
    }
  };

  const handleCreateInvoice = async (booking) => {
    console.log("handleCreateInvoice called with booking:", booking);
    setSelectedBooking(booking);
    
    try {
      // Step 1: Check if billing exists, if not create it
      if (!booking.billing_id) {
        console.log("No billing_id found, creating billing record...");
        toast.info("Creating billing record...");
        const billingCreated = await createBillingRecord(booking.booking_id);
        if (!billingCreated) {
          toast.error("Failed to create billing record");
          return;
        }
        // Refresh bookings to get the new billing_id
        toast.success("Billing record created! Refreshing data...");
        await fetchBookings();
        // Continue to invoice creation after creating billing record
      }

      console.log("Billing_id found:", booking.billing_id);
      toast.info("Validating billing...");

      // Step 2: Validate billing completeness
      const validation = await validateBilling(booking.booking_id);
      console.log("Validation result:", validation);
      if (!validation.success) {
        toast.error(validation.message);
        return;
      }

      // Only block if there are pending charges, not missing room assignments
      if (validation.pending_charges > 0) {
        toast.warning(validation.message);
        return;
      }

      // Show warning if no rooms assigned but continue anyway
      if (validation.assigned_rooms === 0) {
        toast.warning("Note: No rooms assigned to this booking yet. Invoice will be created with current charges only.");
      }

      console.log("Billing validation passed, calculating breakdown...");
      toast.info("Calculating billing breakdown...");

      // Step 3: Calculate billing breakdown
      const breakdown = await calculateBillingBreakdown(booking.booking_id);
      console.log("Billing breakdown:", breakdown);
      if (!breakdown || !breakdown.success) {
        toast.error("Failed to calculate billing breakdown: " + (breakdown?.message || "Unknown error"));
        return;
      }

      console.log("Opening invoice modal...");
      console.log("showInvoiceModal state before setting:", showInvoiceModal);
      toast.success("Billing breakdown calculated successfully!");
      setShowInvoiceModal(true);
      console.log("showInvoiceModal state after setting: true");
    } catch (error) {
      console.error("Error in handleCreateInvoice:", error);
      toast.error("An error occurred while preparing invoice creation: " + error.message);
    }
  };

  const handleCreateBilling = async (booking) => {
    console.log("handleCreateBilling called with booking:", booking);
    setSelectedBooking(booking);
    
    try {
      // If no billing_id exists, create billing record first
      if (!booking.billing_id) {
        console.log("No billing_id found, creating billing record first...");
        const billingCreated = await createBillingRecord(booking.booking_id);
        if (!billingCreated) {
          toast.error("Failed to create billing record");
          return;
        }
        toast.success("Billing record created successfully!");
      }

      // Load all charges for this booking
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getBookingCharges");
      formData.append("json", JSON.stringify({ booking_id: booking.booking_id }));
      
      console.log("Loading charges for booking:", booking.booking_id);
      const res = await axios.post(url, formData);
      console.log("Charges response:", res.data);
      
      if (res.data.success) {
        setBookingCharges(res.data.charges);
        setShowBillingModal(true);
        toast.success(`Found ${res.data.total_charges_count} charges for this booking`);
      } else {
        toast.error("Failed to load charges: " + res.data.message);
      }
    } catch (error) {
      console.error("Error in handleCreateBilling:", error);
      toast.error("Error loading billing information: " + error.message);
    }
  };

  const handleAddCharge = async () => {
    if (!newChargeForm.charge_name || !newChargeForm.charge_price) {
      toast.error("Please fill in charge name and price");
      return;
    }

    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "addBookingCharge");
      formData.append("json", JSON.stringify({
        booking_id: selectedBooking.booking_id,
        charge_name: newChargeForm.charge_name,
        charge_price: parseFloat(newChargeForm.charge_price),
        quantity: parseInt(newChargeForm.quantity),
        category_id: newChargeForm.category_id
      }));
      
      console.log("Adding charge:", newChargeForm);
      const res = await axios.post(url, formData);
      console.log("Add charge response:", res.data);
      
      if (res.data.success) {
        toast.success("Charge added successfully!");
        // Reset form
        setNewChargeForm({
          charge_name: '',
          charge_price: '',
          quantity: 1,
          category_id: 4
        });
        // Reload charges
        handleCreateBilling(selectedBooking);
      } else {
        toast.error("Failed to add charge: " + res.data.message);
      }
    } catch (error) {
      console.error("Error adding charge:", error);
      toast.error("Error adding charge: " + error.message);
    }
  };

  const proceedToInvoice = () => {
    console.log("proceedToInvoice called with selectedBooking:", selectedBooking);
    setShowBillingModal(false);
    // Add a small delay to ensure modal closes before opening new one
    setTimeout(() => {
      handleCreateInvoice(selectedBooking);
    }, 100);
  };

  const loadDetailedCharges = async () => {
    if (!selectedBooking) return;
    
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getDetailedBookingCharges");
      formData.append("json", JSON.stringify({ booking_id: selectedBooking.booking_id }));
      
      console.log("Loading detailed charges for booking:", selectedBooking.booking_id);
      const res = await axios.post(url, formData);
      console.log("Detailed charges response:", res.data);
      
      if (res.data.success) {
        setDetailedCharges(res.data);
        setShowDetailedCharges(true);
        toast.success("Detailed charges loaded successfully!");
      } else {
        toast.error("Failed to load detailed charges: " + res.data.message);
      }
    } catch (error) {
      console.error("Error loading detailed charges:", error);
      toast.error("Error loading detailed charges: " + error.message);
    }
  };

  const confirmCreateInvoice = async () => {
    if (!selectedBooking) {
      toast.error("No booking selected");
      return;
    }

    // If no billing_id, try to create one first
    if (!selectedBooking.billing_id) {
      const billingCreated = await createBillingRecord(selectedBooking.booking_id);
      if (!billingCreated) {
        toast.error("Failed to create billing record");
        return;
      }
      // Refresh and get updated booking data
      await fetchBookings();
      toast.info("Billing record created. Please try creating invoice again.");
      return;
    }

    try {
      setLoading(true);

      const jsonData = {
        billing_ids: [selectedBooking.billing_id],
        employee_id: 1, // Replace with session value
        payment_method_id: invoiceForm.payment_method_id,
        invoice_status_id: invoiceForm.invoice_status_id,
        discount_id: invoiceForm.discount_id,
        vat_rate: invoiceForm.vat_rate,
        downpayment: invoiceForm.downpayment
      };

      console.log("Creating invoice with data:", jsonData);

      const formData = new FormData();
      formData.append("operation", "createInvoice");
      formData.append("json", JSON.stringify(jsonData));

      const url = localStorage.getItem("url") + "transactions.php";
      const res = await axios.post(url, formData);

      console.log("Invoice creation response:", res.data);

      if (res.data?.success) {
        toast.success(res.data.message || "Invoice created successfully!");
        setShowInvoiceModal(false);
        setSelectedBooking(null);
        setBillingBreakdown(null);
        setValidationResult(null);
        fetchBookings(); // Refresh list
      } else {
        toast.error(res.data.message || "Failed to create invoice.");
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      toast.error("An error occurred while creating the invoice: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Debug function to test API connection
  const testAPIConnection = async () => {
    try {
      const url = localStorage.getItem("url") + "transactions.php";
      const formData = new FormData();
      formData.append("operation", "getBookingsWithBillingStatus");
      const res = await axios.post(url, formData);
      console.log("API Test Response:", res.data);
      toast.success("API connection successful!");
    } catch (err) {
      console.error("API Test Error:", err);
      toast.error("API connection failed: " + err.message);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminHeader/>
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Invoice Management</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Comprehensive billing validation and invoice creation system
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={testAPIConnection}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Test API
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  console.log("Debug: showInvoiceModal =", showInvoiceModal);
                  console.log("Debug: selectedBooking =", selectedBooking);
                  setShowInvoiceModal(true);
                  console.log("Debug: Set showInvoiceModal to true");
                }}
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Debug
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Processing invoice...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Booking Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Reference No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead>Billing ID</TableHead>
                  <TableHead>Invoice Status</TableHead>
                  <TableHead>Validation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b, index) => (
                  <TableRow key={`booking-${b.booking_id}-${index}`}>
                    <TableCell className="font-medium">{b.booking_id}</TableCell>
                    <TableCell className="font-mono text-sm">{b.reference_no}</TableCell>
                    <TableCell>{b.customer_name || "Walk-In"}</TableCell>
                    <TableCell className="text-sm">{b.booking_checkin_dateandtime}</TableCell>
                    <TableCell className="text-sm">{b.booking_checkout_dateandtime}</TableCell>
                    <TableCell>
                      {b.billing_id ? (
                        <Badge variant="outline">{b.billing_id}</Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {b.invoice_id ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Created
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Created
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {b.billing_id && !b.invoice_id ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => validateBilling(b.booking_id)}
                          className="flex items-center gap-1"
                        >
                          <Calculator className="h-3 w-3" />
                          Validate
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!b.invoice_id ? (
                        <Button 
                          onClick={() => {
                            console.log("Button clicked for booking:", b);
                            handleCreateBilling(b);
                          }}
                          variant={b.billing_id ? "default" : "secondary"}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          {b.billing_id ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Review Billing
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Create Billing
                            </>
                          )}
                        </Button>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Invoice Created
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Creation Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Receipt className="h-5 w-5" />
              Create Invoice - Booking #{selectedBooking?.booking_id}
            </DialogTitle>
          </DialogHeader>
            
          {/* Validation Results */}
          {validationResult && (
            <Card className={`mb-4 ${validationResult.is_complete ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {validationResult.is_complete ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-semibold">Validation Status</span>
                </div>
                <p className="text-sm mb-2">{validationResult.message}</p>
                {validationResult.pending_charges > 0 && (
                  <Badge variant="outline" className="mr-2">
                    Pending Charges: {validationResult.pending_charges}
                  </Badge>
                )}
                {validationResult.assigned_rooms > 0 && (
                  <Badge variant="outline">
                    Assigned Rooms: {validationResult.assigned_rooms}
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Billing Breakdown */}
          {billingBreakdown && billingBreakdown.success && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Billing Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {billingBreakdown ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Room Charges:</span>
                      <span className="font-mono">₱{(parseFloat(billingBreakdown.room_total) || 0).toFixed(2)} ({billingBreakdown.room_count || 0} rooms)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Additional Charges:</span>
                      <span className="font-mono">₱{(parseFloat(billingBreakdown.charge_total) || 0).toFixed(2)} ({billingBreakdown.charge_count || 0} items)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-mono">₱{(parseFloat(billingBreakdown.subtotal) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Discount:</span>
                      <span className="font-mono text-red-600">-₱{(parseFloat(billingBreakdown.discount_amount) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Amount After Discount:</span>
                      <span className="font-mono">₱{(parseFloat(billingBreakdown.amount_after_discount) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">VAT ({((parseFloat(invoiceForm.vat_rate) || 0) * 100).toFixed(1)}%):</span>
                      <span className="font-mono">₱{(parseFloat(billingBreakdown.vat_amount) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-muted rounded-lg px-3">
                      <span className="font-bold text-lg">Final Total:</span>
                      <span className="font-mono font-bold text-lg">₱{(parseFloat(billingBreakdown.final_total) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Downpayment:</span>
                      <span className="font-mono">₱{(parseFloat(billingBreakdown.downpayment) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 border border-yellow-200 dark:border-yellow-800">
                      <span className="font-bold text-lg">Balance Due:</span>
                      <span className="font-mono font-bold text-lg text-yellow-800 dark:text-yellow-200">₱{(parseFloat(billingBreakdown.balance) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading billing breakdown...</p>
                )}

                {/* Detailed Charges Button */}
                <div className="mt-6 text-center">
                  <Button 
                    onClick={loadDetailedCharges}
                    className="mb-4"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Detailed Charges Breakdown
                  </Button>
                  
                  {showDetailedCharges && detailedCharges && (
                    <Card className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                      <CardHeader>
                        <CardTitle className="text-center text-blue-600 dark:text-blue-400">
                          <Calculator className="h-5 w-5 inline mr-2" />
                          Detailed Charges Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                      
                        {/* Room Charges Section */}
                        {detailedCharges.room_charges && detailedCharges.room_charges.length > 0 && (
                          <div className="mb-6">
                            <h5 className="text-blue-600 dark:text-blue-400 mb-4 pb-2 border-b-2 border-blue-200 dark:border-blue-800 font-semibold">
                              🏨 Room Charges Details
                            </h5>
                            <div className="rounded-md border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-blue-50 dark:bg-blue-900/20">
                                    <TableHead>Room Type</TableHead>
                                    <TableHead>Room Number</TableHead>
                                    <TableHead>Adults</TableHead>
                                    <TableHead>Children</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Beds</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {detailedCharges.room_charges.map((room, index) => (
                                    <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                                      <TableCell>{room.charge_name}</TableCell>
                                      <TableCell>{room.roomnumber_name || 'Not Assigned'}</TableCell>
                                      <TableCell className="text-center">{room.bookingRoom_adult}</TableCell>
                                      <TableCell className="text-center">{room.bookingRoom_children}</TableCell>
                                      <TableCell className="text-center">{room.max_capacity}</TableCell>
                                      <TableCell className="text-center">{room.roomtype_beds}</TableCell>
                                      <TableCell>{room.roomtype_sizes}</TableCell>
                                      <TableCell className="text-right font-bold font-mono">
                                        ₱{(parseFloat(room.unit_price) || 0).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-right">
                              <span className="font-bold text-lg">
                                🏨 Room Total: ₱{detailedCharges.summary.room_total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Additional Charges Section */}
                        {detailedCharges.additional_charges && detailedCharges.additional_charges.length > 0 && (
                          <div className="mb-6">
                            <h5 className="text-green-600 dark:text-green-400 mb-4 pb-2 border-b-2 border-green-200 dark:border-green-800 font-semibold">
                              🛍️ Additional Charges Details
                            </h5>
                            <div className="rounded-md border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-green-50 dark:bg-green-900/20">
                                    <TableHead>Charge Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Description</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {detailedCharges.additional_charges.map((charge, index) => (
                                    <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                                      <TableCell>{charge.charge_name}</TableCell>
                                      <TableCell>{charge.category}</TableCell>
                                      <TableCell>{charge.room_number || charge.room_type}</TableCell>
                                      <TableCell className="text-right font-mono">₱{(parseFloat(charge.unit_price) || 0).toFixed(2)}</TableCell>
                                      <TableCell className="text-center">{charge.quantity}</TableCell>
                                      <TableCell className="text-right font-bold font-mono">
                                        ₱{(parseFloat(charge.total_amount) || 0).toFixed(2)}
                                      </TableCell>
                                      <TableCell>{charge.charges_master_description || '-'}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-right">
                              <span className="font-bold text-lg">
                                🛍️ Additional Total: ₱{detailedCharges.summary.charges_total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Grand Total */}
                        <div className="mt-6 p-5 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                          <span className="font-bold text-xl">
                            💰 GRAND TOTAL: ₱{detailedCharges.summary.grand_total.toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select 
                    value={invoiceForm.payment_method_id.toString()} 
                    onValueChange={(value) => setInvoiceForm({...invoiceForm, payment_method_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">GCash</SelectItem>
                      <SelectItem value="2">Cash</SelectItem>
                      <SelectItem value="3">Paymaya</SelectItem>
                      <SelectItem value="4">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat_rate">VAT Rate</Label>
                  <Input
                    id="vat_rate"
                    type="text"
                    value={invoiceForm.vat_rate}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setInvoiceForm({...invoiceForm, vat_rate: parseFloat(value) || 0});
                      }
                    }}
                    min="0"
                    max="1"
                    step="0.01"
                    placeholder="0.12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downpayment">Downpayment</Label>
                  <Input
                    id="downpayment"
                    type="text"
                    value={invoiceForm.downpayment}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setInvoiceForm({...invoiceForm, downpayment: parseFloat(value) || 0});
                      }
                    }}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice_status">Invoice Status</Label>
                  <Select 
                    value={invoiceForm.invoice_status_id.toString()} 
                    onValueChange={(value) => setInvoiceForm({...invoiceForm, invoice_status_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Complete</SelectItem>
                      <SelectItem value="2">Incomplete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              onClick={confirmCreateInvoice}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />
                  Create Invoice
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowInvoiceModal(false);
                setSelectedBooking(null);
                setBillingBreakdown(null);
                setValidationResult(null);
                setDetailedCharges(null);
                setShowDetailedCharges(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Billing Review Modal */}
      <Dialog open={showBillingModal} onOpenChange={setShowBillingModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Calculator className="h-5 w-5" />
              Review Billing - Booking #{selectedBooking?.booking_id} {selectedBooking?.reference_no}
            </DialogTitle>
          </DialogHeader>
            
          {/* Current Charges */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Charges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingCharges.map((charge, index) => (
                      <TableRow key={index}>
                        <TableCell>{charge.charge_type}</TableCell>
                        <TableCell>{charge.charge_name}</TableCell>
                        <TableCell>{charge.category}</TableCell>
                        <TableCell className="text-right font-mono">₱{(parseFloat(charge.unit_price) || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-center">{charge.quantity}</TableCell>
                        <TableCell className="text-right font-mono font-bold">₱{(parseFloat(charge.total_amount) || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {bookingCharges.length === 0 && (
                      <TableRow>
                        <TableCell colSpan="6" className="text-center text-muted-foreground">
                          No charges found for this booking
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Total Summary */}
              {bookingCharges.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg text-right">
                  <span className="font-bold text-lg">
                    Current Total: ₱{bookingCharges.reduce((sum, charge) => sum + (parseFloat(charge.total_amount) || 0), 0).toFixed(2)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Charge Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Charge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="charge_name">Charge Description</Label>
                  <Input
                    id="charge_name"
                    type="text"
                    placeholder="e.g., Aircon Damage, TV Repair, Broken Vase"
                    value={newChargeForm.charge_name}
                    onChange={(e) => setNewChargeForm({...newChargeForm, charge_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="charge_price">Price</Label>
                  <Input
                    id="charge_price"
                    type="text"
                    placeholder="0.00"
                    value={newChargeForm.charge_price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setNewChargeForm({...newChargeForm, charge_price: value});
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="text"
                    value={newChargeForm.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        setNewChargeForm({...newChargeForm, quantity: parseInt(value) || 1});
                      }
                    }}
                    min="1"
                  />
                </div>
                <div>
                  <Button 
                    onClick={handleAddCharge}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Charge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              onClick={proceedToInvoice}
              disabled={bookingCharges.length === 0}
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              Proceed to Create Invoice
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowBillingModal(false);
                setSelectedBooking(null);
                setBookingCharges([]);
                setDetailedCharges(null);
                setShowDetailedCharges(false);
                setNewChargeForm({
                  charge_name: '',
                  charge_price: '',
                  quantity: 1,
                  category_id: 4
                });
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateInvoice;
