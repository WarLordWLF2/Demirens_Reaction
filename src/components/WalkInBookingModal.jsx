import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, CreditCard, User, Calendar, Bed } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';

// Walk-in booking schemas
const walkInCustomerSchema = z.object({
  customers_fname: z.string().min(1, "First name is required"),
  customers_lname: z.string().min(1, "Last name is required"),
  customers_email: z.string().email("Invalid email address"),
  customers_phone: z.string().min(1, "Phone number is required"),
  customers_address: z.string().min(1, "Address is required"),
  customers_birthdate: z.string().min(1, "Date of birth is required"),
  nationality_id: z.string().min(1, "Nationality is required"),
});

const walkInPaymentSchema = z.object({
  payment_method: z.string().min(1, "Payment method is required"),
  downpayment: z.number().min(0, "Downpayment cannot be negative"),
  reference_number: z.string().optional(),
});

const WalkInBookingModal = ({ 
  isOpen, 
  onClose, 
  bookingData, 
  rooms, 
  nationalities 
}) => {
  const [step, setStep] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingInfo, setBookingInfo] = useState({
    checkIn: bookingData.checkIn,
    checkOut: bookingData.checkOut,
    adult: bookingData.adult,
    children: bookingData.children,
    totalAmount: 0,
    nights: 0
  });

  // Forms
  const customerForm = useForm({
    resolver: zodResolver(walkInCustomerSchema),
    defaultValues: {
      customers_fname: "",
      customers_lname: "",
      customers_email: "",
      customers_phone: "",
      customers_address: "",
      customers_birthdate: "",
      nationality_id: "",
    },
  });

  const paymentForm = useForm({
    resolver: zodResolver(walkInPaymentSchema),
    defaultValues: {
      payment_method: "",
      downpayment: 0,
      reference_number: "",
    },
  });

  // Calculate nights and total
  useEffect(() => {
    if (bookingInfo.checkIn && bookingInfo.checkOut) {
      const nights = Math.ceil(
        (new Date(bookingInfo.checkOut) - new Date(bookingInfo.checkIn)) / (1000 * 60 * 60 * 24)
      );
      const total = selectedRooms.reduce((sum, room) => {
        return sum + (room.roomtype_price * room.quantity * nights);
      }, 0);
      
      setBookingInfo(prev => ({
        ...prev,
        nights,
        totalAmount: total
      }));
    }
  }, [selectedRooms, bookingInfo.checkIn, bookingInfo.checkOut]);

  const handleRoomSelection = (room) => {
    setSelectedRooms(prev => {
      const exists = prev.find(r => r.roomtype_id === room.roomtype_id);
      if (exists) {
        return prev.filter(r => r.roomtype_id !== room.roomtype_id);
      } else {
        return [...prev, { ...room, quantity: 1 }];
      }
    });
  };

  const updateRoomQuantity = (roomtypeId, quantity) => {
    if (quantity <= 0) {
      setSelectedRooms(prev => prev.filter(r => r.roomtype_id !== roomtypeId));
      return;
    }
    
    setSelectedRooms(prev => 
      prev.map(r => 
        r.roomtype_id === roomtypeId ? { ...r, quantity } : r
      )
    );
  };

  const handleCustomerSubmit = (data) => {
    setBookingInfo(prev => ({ ...prev, customerInfo: data }));
    setStep(3);
  };

  const handlePaymentSubmit = async (data) => {
    setIsBooking(true);
    
    try {
      const bookingPayload = {
        checkIn: bookingInfo.checkIn,
        checkOut: bookingInfo.checkOut,
        adult: bookingInfo.adult,
        children: bookingInfo.children,
        selectedRooms: selectedRooms,
        customerInfo: bookingInfo.customerInfo,
        paymentInfo: {
          ...data,
          totalAmount: bookingInfo.totalAmount,
          nights: bookingInfo.nights
        }
      };

      const url = localStorage.getItem('url') + 'admin.php';
      const formData = new FormData();
      formData.append('method', 'insertWalkInBooking');
      formData.append('json', JSON.stringify(bookingPayload));

      const response = await axios.post(url, formData);
      
      if (response.data === 1) {
        toast.success("Walk-in booking created successfully!");
        setStep(4);
        setTimeout(() => {
          onClose();
          setStep(1);
          setSelectedRooms([]);
          customerForm.reset();
          paymentForm.reset();
        }, 3000);
      } else {
        toast.error("Failed to create booking");
      }
    } catch (error) {
      console.error("Walk-in booking error:", error);
      toast.error("Failed to create booking");
    } finally {
      setIsBooking(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedRooms([]);
    setBookingInfo({
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      adult: bookingData.adult,
      children: bookingData.children,
      totalAmount: 0,
      nights: 0
    });
    customerForm.reset();
    paymentForm.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetModal();
      onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Walk-In Booking
          </DialogTitle>
        </DialogHeader>
        
        {/* Step Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Room Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Select Rooms</h3>
              <p className="text-gray-600">Choose the rooms for your stay</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {rooms.filter(room => room.status_id === 3).map((room) => (
                <Card 
                  key={room.roomtype_id} 
                  className={`cursor-pointer transition-all ${
                    selectedRooms.find(r => r.roomtype_id === room.roomtype_id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleRoomSelection(room)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{room.roomtype_name}</h4>
                      <Badge variant="outline">₱{room.roomtype_price.toLocaleString()}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{room.roomtype_description}</p>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="secondary">{room.room_sizes}</Badge>
                      <Badge variant="secondary">{room.room_capacity} guests</Badge>
                      <Badge variant="secondary">{room.room_beds} beds</Badge>
                    </div>
                    
                    {selectedRooms.find(r => r.roomtype_id === room.roomtype_id) && (
                      <div className="flex items-center gap-2">
                        <Label>Quantity:</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = selectedRooms.find(r => r.roomtype_id === room.roomtype_id);
                            updateRoomQuantity(room.roomtype_id, current.quantity - 1);
                          }}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">
                          {selectedRooms.find(r => r.roomtype_id === room.roomtype_id)?.quantity || 1}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = selectedRooms.find(r => r.roomtype_id === room.roomtype_id);
                            updateRoomQuantity(room.roomtype_id, current.quantity + 1);
                          }}
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedRooms.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Selected Rooms:</h4>
                {selectedRooms.map(room => (
                  <div key={room.roomtype_id} className="flex justify-between items-center">
                    <span>{room.roomtype_name} x{room.quantity}</span>
                    <span>₱{(room.roomtype_price * room.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total per night:</span>
                  <span>₱{selectedRooms.reduce((sum, room) => sum + (room.roomtype_price * room.quantity), 0).toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)}
                disabled={selectedRooms.length === 0}
              >
                Next: Customer Info →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Customer Information */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Customer Information</h3>
              <p className="text-gray-600">Please provide your details</p>
            </div>
            
            <Form {...customerForm}>
              <form onSubmit={customerForm.handleSubmit(handleCustomerSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={customerForm.control}
                    name="customers_fname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="customers_lname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={customerForm.control}
                    name="customers_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="customers_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={customerForm.control}
                    name="customers_birthdate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="nationality_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select nationality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nationalities.map((nationality) => (
                              <SelectItem key={nationality.nationality_id} value={nationality.nationality_id.toString()}>
                                {nationality.nationality_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={customerForm.control}
                  name="customers_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    ← Back
                  </Button>
                  <Button type="submit">
                    Next: Payment →
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Payment Information</h3>
              <p className="text-gray-600">Complete your booking</p>
            </div>
            
            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Booking Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>{bookingInfo.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>{bookingInfo.checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>{bookingInfo.nights}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{bookingInfo.adult + bookingInfo.children}</span>
                </div>
              </div>
              <Separator className="my-3" />
              {selectedRooms.map(room => (
                <div key={room.roomtype_id} className="flex justify-between text-sm">
                  <span>{room.roomtype_name} x{room.quantity}</span>
                  <span>₱{(room.roomtype_price * room.quantity * bookingInfo.nights).toLocaleString()}</span>
                </div>
              ))}
              <Separator className="my-3" />
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>₱{bookingInfo.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <Form {...paymentForm}>
              <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-4">
                <FormField
                  control={paymentForm.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">GCash</SelectItem>
                          <SelectItem value="2">Cash</SelectItem>
                          <SelectItem value="3">PayMaya</SelectItem>
                          <SelectItem value="4">Check</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={paymentForm.control}
                  name="downpayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Downpayment (₱)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={paymentForm.control}
                  name="reference_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter reference number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    ← Back
                  </Button>
                  <Button type="submit" disabled={isBooking}>
                    {isBooking ? "Processing..." : "Complete Booking"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-green-600 mb-2">Booking Successful!</h3>
              <p className="text-gray-600">Your walk-in booking has been created successfully.</p>
              <p className="text-sm text-gray-500 mt-2">You will receive a confirmation email shortly.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalkInBookingModal;
