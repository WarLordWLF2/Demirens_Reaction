"use client"
import React, { useEffect } from 'react'
import FrontHeader from '@/components/layout/FrontHeader'
import { useState } from 'react'
import axios from 'axios'

// Page
import ChooseRooms from './sheets/ChooseRooms'
import Receipt from './sheets/Receipt'

// ShadCN
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import DatePicker from '@/components/ui/date-picker'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from '@/components/ui/scroll-area'

const walkin_Scema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().min(),
  phone_no: z.string().min(),

  downPay: z.string().transform((val) => Number(val))
    .refine((val) =>
      !isNaN(val) && val >= 0, {
      message: "Downpayment must be a valid number and not negative",
    }),

  checkIn: z.string(),
  checkOut: z.string()
})

function FrontdeskWalkin() {
  const [selectedRooms, setSelectedRooms] = useState([]);

  const customerInfo = useForm({
    resolver: zodResolver(walkin_Scema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_no: "",

      downPay: 0,
      checkIn: "",
      checkOut: "",
    }
  })

  const handleRoomsList = (rooms) => {
    toast('Room Added!');
    setSelectedRooms([...selectedRooms, rooms])
  }

  const removeFromList = (roomItem) => {
    setSelectedRooms((prevRoom) =>
      prevRoom.filter((room) => room.room_ids !== roomItem.room_ids)
    )
  }

  const sendToReceipt = (value) => {
    console.log('Saved: ', value, selectedRooms);

    const jsonConvertion = {
      customer_fName: value.first_name,
      customer_lName: value.last_name,
      customer_email: value.email,
      customer_phone_number: value.phone_no,
      customer_downpayment: value.downPay,
      customer_checkin: new Date(value.checkIn),
      customer_checkout: new Date(value.checkOut),
    }

    console.log(jsonConvertion);
  }

  return (
    <>
      <div className="px-4 py-2">
        <FrontHeader />
        <div className="text-xl font-semibold mt-2">FrontDeskWalkin Page</div>
      </div>

      {/* Grid Layout for Form */}
      <Form {...customerInfo}>
        <form onSubmit={customerInfo.handleSubmit(sendToReceipt)}>
          <div className="px-4 py-2 grid grid-cols-1 lg:grid-cols-[2fr,3fr] gap-8">

            {/* Column 1: Scrollable Form Content */}
            <ScrollArea className="min-w-0">
              <div className="space-y-8">
                {/* Personal Details */}
                <div className="space-y-4">
                  <p className="font-bold text-lg">Personal Details</p>
                  {/* Inputs */}
                  {["first_name", "last_name", "email", "phone_no"].map((fieldName) => (
                    <FormField
                      key={fieldName}
                      control={customerInfo.control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize">{fieldName.replace("_", " ")}</FormLabel>
                          <FormControl>
                            <Input placeholder={fieldName === "phone_no" ? "09XXXXXXXXX" : "Enter here"} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Booking Details */}
                <div className="space-y-4">
                  <p className="font-bold text-lg">Booking Details</p>
                  <FormField
                    control={customerInfo.control}
                    name="downPay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Downpayment</FormLabel>
                        <FormControl>
                          <Input placeholder="₱0.00" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerInfo.control}
                    name="checkIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <DatePicker
                            form={customerInfo}
                            name={field.name}
                            label="Check-In"
                            pastAllowed={false}
                            futureAllowed={true}
                            withTime={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerInfo.control}
                    name="checkOut"
                    render={({ field }) => (
                      <FormItem>
                        <DatePicker
                          form={customerInfo}
                          name={field.name}
                          label="Check-Out"
                          pastAllowed={false}
                          futureAllowed={true}
                          withTime={true}
                        />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>

            {/* Column 2: Room Summary Card */}
            <div className="min-w-0">

              <Card className="flex flex-col h-full w-full">
                <CardHeader>
                  <CardTitle>Room Summary</CardTitle>
                  <CardDescription>Quick view of added room(s)</CardDescription>
                  <CardAction>
                    <Receipt />
                  </CardAction>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {selectedRooms?.length === 0 ? (
                    <p className="text-center">No Rooms Selected</p>
                  ) : (
                    <ScrollArea className='h-[40vh] border-2 rounded-xl'>
                      <Table className="min-w-[600px]">
                        <TableCaption>Booking Summary</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Room Type</TableHead>
                            <TableHead>Room No.</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Nights</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedRooms.map((custRoom, index) => (
                            <TableRow key={index}>
                              <TableCell>{custRoom.roomtype_name}</TableCell>
                              <TableCell className="text-center">
                                {custRoom.room_details.split(" ")[0].split(":")[1]}
                              </TableCell>
                              <TableCell>₱{custRoom.roomtype_price}</TableCell>
                              <TableCell className="text-center">3</TableCell>
                              <TableCell>₱0</TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  onClick={() => removeFromList(custRoom)}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>

                <CardFooter className="flex justify-center items-center">
                  <div className="grid grid-cols-[3fr,1fr] gap-4">

                    <div>
                      <ScrollArea className='h-[20vh]'>
                        <p className='mb-4 text-lg font-semibold'>Title Here</p>

                        <p>
                          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore, cum itaque? At cum consequuntur pariatur animi quod!
                          Nulla cumque ratione odit asperiores vel quibusdam dolorum, ducimus quisquam numquam quia incidunt.
                        </p>

                        <hr className="my-4 border-t-2 border-gray-300" />

                        <p>
                          Lorem ipsum dolor sit amet consectetur adipisicing elit.
                          Cum, libero recusandae nobis magni est qui eum, enim exercitationem officiis dolores labore assumenda nam suscipit,
                          fuga perspiciatis quasi ratione hic facilis?
                        </p>

                      </ScrollArea>
                    </div>

                    <div className='place-content-center self-auto place-self-center'>
                      <ChooseRooms selectRoomFunc={handleRoomsList} />
                    </div>
                  </div>
                </CardFooter>

              </Card>
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}

export default FrontdeskWalkin