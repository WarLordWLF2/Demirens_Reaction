import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Settings, CheckCircle, XCircle, Eye } from "lucide-react";
import AdminHeader from "./components/AdminHeader";
import InvoiceManagementSubpage from "./SubPages/InvoiceManagementSubpage";

function CreateInvoice() {
  const [bookings, setBookings] = useState([]);
  const [loading] = useState(false);
  const [showInvoiceManagement, setShowInvoiceManagement] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

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

  const handleBookingAction = (booking) => {
    setSelectedBooking(booking);
    setShowInvoiceManagement(true);
  };

  const handleInvoiceCreated = () => {
    fetchBookings(); // Refresh the bookings list
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
              <div className="p-2 bg-[#34699a]/10 dark:bg-[#34699a]/20 rounded-lg">
                <FileText className="h-6 w-6 text-[#34699a] dark:text-[#34699a]" />
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#34699a]"></div>
              <span>Processing invoice...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
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
                        <span className="text-muted-foreground">—</span>
                    </TableCell>
                    <TableCell>
                      {!b.invoice_id ? (
                        <Button 
                          onClick={() => handleBookingAction(b)}
                          variant="default"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                              <Eye className="h-3 w-3" />
                          Manage Invoice
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

      {/* Invoice Management Modal */}
      {/* Custom Invoice Management Modal */}
      {showInvoiceManagement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowInvoiceManagement(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl max-h-[95vh] w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#34699a]" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Invoice Management - Booking #{selectedBooking?.booking_id}
                </h2>
              </div>
              <button
                onClick={() => setShowInvoiceManagement(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
          </div>
            
            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
              {selectedBooking && (
                <InvoiceManagementSubpage
                  selectedBooking={selectedBooking}
                  onClose={() => setShowInvoiceManagement(false)}
                  onInvoiceCreated={handleInvoiceCreated}
                />
              )}
              </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateInvoice;