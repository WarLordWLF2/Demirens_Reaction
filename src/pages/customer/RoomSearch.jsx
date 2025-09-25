import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { BedDoubleIcon, MinusIcon, Moon, Plus, User } from 'lucide-react'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from "@/components/ui/input";
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form'
import axios from 'axios'
import DatePicker from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
import BookingNoAccount from './modals/sheets/BookingNoAccount';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ScrollBar } from '@/components/ui/scroll-area';
import CustomerHeader from '@/components/layout/CustomerHeader';

const schema = z.object({
  checkIn: z.string().min(1, { message: "Check in is required" }),
  checkOut: z.string().min(1, { message: "Check out is required" }),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return false;
  }


  const normalize = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());

  return normalize(checkOut).getTime() > normalize(checkIn).getTime();
}, {
  message: "Check out must be later than check in",
  path: ["checkOut"],
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const now = new Date();
  return checkIn.getTime() > now.getTime();
}, {
  message: "Check in must be in the future",
  path: ["checkIn"],
});

function RoomSearch() {
  // Initialize state with localStorage values
  const [adultNumber, setAdultNumber] = useState(() => {
    const stored = localStorage.getItem("adult");
    return stored ? Number(stored) : 1; // Default to 1 adult
  });
  const [childrenNumber, setChildrenNumber] = useState(() => {
    const stored = localStorage.getItem("children");
    return stored ? Number(stored) : 0;
  });
  const [rooms, setRooms] = useState([]);
  const [isSearched, setIsSearched] = useState(true);





  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      checkIn: localStorage.getItem("checkIn") || "",
      checkOut: localStorage.getItem("checkOut") || "",
    },
  })



  const getRooms = useCallback(async (data) => {
    try {
      const url = localStorage.getItem('url') + "customer.php";
      const finalAdultNumber = adultNumber < 1 ? 1 : adultNumber;
      console.log("data", data)
      const jsonData = {
        "checkIn": data.checkIn,
        "checkOut": data.checkOut,
        "guestNumber": Number(finalAdultNumber) + Number(childrenNumber)
      }
      console.log("jsonData", jsonData)
      const formData = new FormData();
      formData.append("operation", "getAvailableRoomsWithGuests");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res ni getRooms", res);
      setRooms(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);

    }
  }, [adultNumber, childrenNumber])



  const handleClearData = () => {
    localStorage.removeItem("checkIn");
    localStorage.removeItem("checkOut");
    localStorage.removeItem("guestNumber");
    localStorage.removeItem("children");
    localStorage.removeItem("adult");
    setIsSearched(false);
    setAdultNumber(1); // Reset to 1 adult
    setChildrenNumber(0);
    form.reset({
      checkIn: "",
      checkOut: "",
    });
  }

  const onSubmit = async (data) => {
    // Ensure at least 1 adult is always set
    const finalAdultNumber = adultNumber < 1 ? 1 : adultNumber;

    localStorage.setItem("checkIn", data.checkIn);
    localStorage.setItem("checkOut", data.checkOut);
    localStorage.setItem("children", childrenNumber);
    localStorage.setItem("adult", finalAdultNumber);
    localStorage.setItem("guestNumber", Number(finalAdultNumber) + Number(childrenNumber));
    console.log("mga data sa pag search", data);
    getRooms(data);
    setIsSearched(true);
  }

  // Update form values when localStorage changes
  useEffect(() => {
    const checkIn = localStorage.getItem("checkIn");
    const checkOut = localStorage.getItem("checkOut");
    getRooms({
      checkIn: checkIn,
      checkOut: checkOut

    })
    if (checkIn) form.setValue("checkIn", checkIn);
    if (checkOut) form.setValue("checkOut", checkOut);
  }, [form, getRooms]);









  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Room Search</h1>
              <p className="text-gray-600 mt-1">Find and book your perfect room</p>
            </div>
            <Button variant="outline" onClick={handleClearData}>
              Clear Search
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Search Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Search Criteria</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="checkIn"
                      render={({ field }) => (
                        <FormItem>
                          <DatePicker
                            form={form}
                            name={field.name}
                            label="Check-in Date"
                            pastAllowed={false}
                            futureAllowed={true}
                            withTime={false}
                            value={field.value || localStorage.getItem("checkIn") || ""}
                            onChange={field.onChange}
                          />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="checkOut"
                      render={({ field }) => (
                        <FormItem>
                          <DatePicker
                            form={form}
                            name={field.name}
                            label="Check-out Date"
                            pastAllowed={false}
                            futureAllowed={true}
                            withTime={false}
                            value={field.value || localStorage.getItem("checkOut") || ""}
                            onChange={field.onChange}
                          />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label>Adults</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAdultNumber(adultNumber - 1)}
                          disabled={adultNumber <= 1}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <Input
                          className="text-center"
                          type="number"
                          readOnly
                          value={adultNumber}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAdultNumber(adultNumber + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Children</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setChildrenNumber(childrenNumber - 1)}
                          disabled={childrenNumber === 0}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <Input
                          className="text-center"
                          type="number"
                          readOnly
                          value={childrenNumber}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setChildrenNumber(childrenNumber + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Search Rooms
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Room Results */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Available Rooms</h2>
                  <p className="text-gray-600">
                    {rooms.length > 0 
                      ? `${rooms.length} room${rooms.length !== 1 ? 's' : ''} found`
                      : 'No rooms available'
                    }
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {form.getValues('checkIn') && form.getValues('checkOut') && (
                    <>
                      {new Date(form.getValues('checkIn')).toLocaleDateString()} - {new Date(form.getValues('checkOut')).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>

              {/* Room Results */}
              <ScrollArea className="h-[70vh] rounded-md border p-4">
                {!isSearched ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <BedDoubleIcon className="h-16 w-16 mx-auto" />
                      </div>
                      <p className="text-lg font-semibold text-gray-500">
                        Please select your dates and guest count
                      </p>
                      <p className="text-gray-400 mt-2">
                        Use the search form to find available rooms
                      </p>
                    </div>
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <BedDoubleIcon className="h-16 w-16 mx-auto" />
                      </div>
                      <p className="text-lg font-semibold text-gray-500">
                        No rooms available
                      </p>
                      <p className="text-gray-400 mt-2">
                        No rooms found for {Number(adultNumber < 1 ? 1 : adultNumber) + Number(childrenNumber)} guest(s) on these dates
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {rooms.map((room, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="flex flex-col md:flex-row">
                          {/* Room Image */}
                          <div className="md:w-1/3 h-48 md:h-auto">
                            <img
                              src={localStorage.getItem("url") + "images/" + room.roomtype_image}
                              alt={room.roomtype_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Room Details */}
                          <div className="md:w-2/3 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="text-2xl font-bold text-gray-900">{room.roomtype_name}</h3>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-blue-600">
                                    ₱{Number(room.roomtype_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-sm text-gray-500">per night</div>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 mb-4 line-clamp-3">
                                {room.roomtype_description}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                  {room.roomtype_sizes}
                                </Badge>
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                  <User className="h-3 w-3 mr-1" />
                                  {room.roomtype_capacity}
                                </Badge>
                                <Badge variant="outline" className="text-blue-600 border-blue-200">
                                  <BedDoubleIcon className="h-3 w-3 mr-1" />
                                  {room.roomtype_beds}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              {room.status_id === 3 ? (
                                <BookingNoAccount
                                  rooms={rooms}
                                  selectedRoom={room}
                                  handleClearData={handleClearData}
                                  adultNumber={adultNumber}
                                  childrenNumber={childrenNumber}
                                />
                              ) : (
                                <Button disabled className="flex-1">
                                  Not Available
                                </Button>
                              )}
                              <Button variant="outline" className="flex-1">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                <ScrollBar />
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomSearch