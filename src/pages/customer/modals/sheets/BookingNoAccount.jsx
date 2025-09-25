import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Info, MinusIcon, Plus, BedDouble, X, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'

// ---------------------- Utilities ----------------------
const pad = (n) => String(n).padStart(2, '0');
const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYMD = (s) => {
  if (!s) return null;
  const [y, m, day] = s.split('-').map(Number);
  if (!y || !m || !day) return null;
  const d = new Date(y, m - 1, day);
  d.setHours(0, 0, 0, 0);
  return d;
};
const getStoredYMDDate = (key, fallbackDaysAhead = 1) => {
  const val = localStorage.getItem(key);
  if (val) {
    const parsed = parseYMD(val);
    if (parsed) return parsed;
  }
  const d = new Date();
  d.setDate(d.getDate() + fallbackDaysAhead);
  d.setHours(0, 0, 0, 0);
  return d;
};

function BookingNoAccount({ rooms, selectedRoom, guestNumber: initialGuestNumber, handleClearData, adultNumber, childrenNumber }) {
  // ---------------------- Initial values ----------------------
  const initialCheckIn = getStoredYMDDate('checkIn', 1);
  const initialCheckOutCandidate = getStoredYMDDate('checkOut', 2);
  const _minOut = new Date(initialCheckIn); _minOut.setDate(_minOut.getDate() + 1); _minOut.setHours(0, 0, 0, 0);
  const initialCheckOut = (initialCheckOutCandidate && initialCheckOutCandidate.getTime() > _minOut.getTime())
    ? initialCheckOutCandidate
    : _minOut;

  const [open, setOpen] = useState(false)
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [numberOfNights, setNumberOfNights] = useState(1)
  const [adultCounts, setAdultCounts] = useState({});
  const [childrenCounts, setChildrenCounts] = useState({});

  // ---------------------- Form validation ----------------------
  const schema = z.object({
    walkinfirstname: z.string().min(1, { message: "First name is required" }),
    walkinlastname: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    contactNumber: z.string().min(1, { message: "Contact number is required" }),
  })

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      walkinfirstname: "",
      walkinlastname: "",
      email: "",
      contactNumber: "",
    },
  })

  // ---------------------- Booking function ----------------------
  const customerBookingNoAccount = async (values) => {
    try {
      // Validate selected room
      if (!selectedRoom) {
        toast.error("Please select a room before booking.");
        return;
      }

      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(checkIn).getTime() <= today.getTime()) {
        toast.error("Check-in date cannot be today or earlier.");
        return;
      }

      const url = localStorage.getItem('url') + "customer.php";

      const subtotal = Number(selectedRoom.roomtype_price) * numberOfNights;
      const displayedVat = subtotal - (subtotal / 1.12);
      const totalAmount = subtotal.toFixed(2);
      const downPayment = (subtotal * 0.5).toFixed(2);

      const bookingDetails = {
        checkIn: formatYMD(checkIn),
        checkOut: formatYMD(checkOut),
        downpayment: downPayment,
        totalAmount: totalAmount,
        displayedVat: displayedVat.toFixed(2),
        children: localStorage.getItem("children") || 0,
        adult: localStorage.getItem("adult") || 1
      };

      // Ensure we have valid room data
      if (!selectedRoom.roomtype_id) {
        toast.error("Invalid room data. Please try selecting the room again.");
        return;
      }

      const roomDetails = [{
        roomTypeId: selectedRoom.roomtype_id,
        guestCount: (Number(adultCounts[String(selectedRoom.roomtype_id)] || 1) + Number(childrenCounts[String(selectedRoom.roomtype_id)] || 0)),
        adultCount: Number(adultCounts[String(selectedRoom.roomtype_id)] || 1),
        childrenCount: Number(childrenCounts[String(selectedRoom.roomtype_id)] || 0),
      }];

      console.log("Constructed roomDetails:", roomDetails);

      const jsonData = {
        walkinfirstname: values.walkinfirstname,
        walkinlastname: values.walkinlastname,
        email: values.email,
        contactNumber: values.contactNumber,
        bookingDetails: bookingDetails,
        roomDetails: roomDetails
      };

      const formData = new FormData();
      formData.append("operation", "customerBookingNoAccount");
      formData.append("json", JSON.stringify(jsonData));
      
      console.log("Selected room:", selectedRoom);
      console.log("Room type:", selectedRoom?.roomtype_id);
      console.log("Adult counts:", adultCounts);
      console.log("Children counts:", childrenCounts);
      console.log("Sending booking data:", jsonData);
      const res = await axios.post(url, formData);
      console.log("Booking response:", res.data);

      if (res.data === -1) {
        toast.error("The room is not available anymore");
      } else if (res.data === 1) {
        toast.success("Booking successful");
        setOpen(false);
        form.reset();
        setAdultCounts({});
        setChildrenCounts({});
        handleClearData();
        localStorage.setItem('refreshBookings', Date.now().toString());
      } else if (res.data === 0) {
        toast.error("Database error occurred. Please try again.");
      } else {
        toast.error("Booking error: " + (res.data || "Unknown error"));
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  }

  // ---------------------- Effects ----------------------
  useEffect(() => {
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn); inDate.setHours(0, 0, 0, 0);
      const outDate = new Date(checkOut); outDate.setHours(0, 0, 0, 0);
      const diff = outDate.getTime() - inDate.getTime();
      const days = Math.max(1, diff / (1000 * 60 * 60 * 24));
      setNumberOfNights(days);
    }
  }, [checkIn, checkOut]);


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Book Now</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="text-black p-0 border-none rounded-t-3xl bg-white">
        <div className="h-[100vh] overflow-y-auto">
          
          {/* Header with close button */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Complete Your Booking</h2>
                <p className="text-sm text-gray-600">Review your selection and provide guest information</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            {/* Dates Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Stay Dates</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Check-in Date</Label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formatYMD(checkIn)}
                    min={formatYMD(new Date(Date.now() + 86400000))}
                    onChange={(e) => {
                      const newDate = parseYMD(e.target.value);
                      if (!newDate) return;
                      setCheckIn(newDate);
                      localStorage.setItem('checkIn', e.target.value);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Check-out Date</Label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formatYMD(checkOut)}
                    min={formatYMD(new Date(checkIn.getTime() + 86400000))}
                    onChange={(e) => {
                      const newDate = parseYMD(e.target.value);
                      if (!newDate) return;
                      setCheckOut(newDate);
                      localStorage.setItem('checkOut', e.target.value);
                    }}
                  />
                </div>
              </div>
              {numberOfNights > 1 && (
                <div className="mt-2 text-sm text-gray-600">
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {numberOfNights} night{numberOfNights !== 1 ? 's' : ''} stay
                  </Badge>
                </div>
              )}
            </div>

            {/* Room Selection Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BedDouble className="h-4 w-4 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Selected Room</h3>
              </div>
              
              {selectedRoom ? (
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-600">{selectedRoom.roomtype_name}</h4>
                        <p className="text-sm text-gray-600">{selectedRoom.roomtype_description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            {selectedRoom.roomtype_sizes}
                          </Badge>
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            Capacity: {selectedRoom.roomtype_capacity}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          ₱{Number(selectedRoom.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-gray-500">per night</div>
                      </div>
                    </div>

                    {/* Guest Count Controls */}
                    <div className="border-t pt-3">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Guest Count</Label>
                      <div className="flex gap-6">
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600">Adults</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const k = String(selectedRoom.roomtype_id);
                                setAdultCounts(prev => ({ ...prev, [k]: Math.max(1, (prev[k] || 1) - 1) }));
                              }}
                              disabled={(adultCounts[String(selectedRoom.roomtype_id)] || 1) <= 1}
                            >
                              <MinusIcon className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {Number(adultCounts[String(selectedRoom.roomtype_id)] || 1)}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const k = String(selectedRoom.roomtype_id);
                                const currentA = adultCounts[k] || 1;
                                const currentC = childrenCounts[k] || 0;
                                if (currentA + currentC < selectedRoom.roomtype_capacity) {
                                  setAdultCounts(prev => ({ ...prev, [k]: currentA + 1 }));
                                }
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex-1">
                          <Label className="text-xs text-gray-600">Children</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const k = String(selectedRoom.roomtype_id);
                                setChildrenCounts(prev => ({ ...prev, [k]: Math.max(0, (prev[k] || 0) - 1) }));
                              }}
                              disabled={(childrenCounts[String(selectedRoom.roomtype_id)] || 0) <= 0}
                            >
                              <MinusIcon className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {Number(childrenCounts[String(selectedRoom.roomtype_id)] || 0)}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const k = String(selectedRoom.roomtype_id);
                                const currentA = adultCounts[k] || 1;
                                const currentC = childrenCounts[k] || 0;
                                if (currentA + currentC < selectedRoom.roomtype_capacity) {
                                  setChildrenCounts(prev => ({ ...prev, [k]: currentC + 1 }));
                                }
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Total guests: {(Number(adultCounts[String(selectedRoom.roomtype_id)] || 1) + Number(childrenCounts[String(selectedRoom.roomtype_id)] || 0))} / {selectedRoom.roomtype_capacity}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-gray-200">
                  <CardContent className="p-8 text-center">
                    <BedDouble className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No room selected</p>
                    <p className="text-sm text-gray-400 mt-1">Please select a room to continue</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Guest Information Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Guest Information</h3>
              </div>
              
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(customerBookingNoAccount)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField 
                          control={form.control} 
                          name="walkinfirstname" 
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="focus:ring-blue-500 focus:border-blue-500" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} 
                        />
                        <FormField 
                          control={form.control} 
                          name="walkinlastname" 
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="focus:ring-blue-500 focus:border-blue-500" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} 
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField 
                          control={form.control} 
                          name="email" 
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" className="focus:ring-blue-500 focus:border-blue-500" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} 
                        />
                        <FormField 
                          control={form.control} 
                          name="contactNumber" 
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">Contact Number</FormLabel>
                              <FormControl>
                                <Input {...field} className="focus:ring-blue-500 focus:border-blue-500" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} 
                        />
                      </div>

                      {/* Booking Summary */}
                      {selectedRoom && (
                        <div className="border-t pt-4 mt-6">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Room:</span>
                                <span className="font-medium">{selectedRoom.roomtype_name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium">{numberOfNights} night{numberOfNights !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Guests:</span>
                                <span className="font-medium">
                                  {(Number(adultCounts[String(selectedRoom.roomtype_id)] || 1) + Number(childrenCounts[String(selectedRoom.roomtype_id)] || 0))} 
                                  ({(adultCounts[String(selectedRoom.roomtype_id)] || 1)} adults, {(childrenCounts[String(selectedRoom.roomtype_id)] || 0)} children)
                                </span>
                              </div>
                              <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                                <span>Total:</span>
                                <span className="text-blue-600">
                                  ₱{(Number(selectedRoom.roomtype_price) * numberOfNights).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={!selectedRoom}
                        >
                          Confirm Booking
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default BookingNoAccount
