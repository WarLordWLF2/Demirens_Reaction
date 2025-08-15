import React from 'react'
import FrontHeader from '@/components/layout/FrontHeader'
import axios from 'axios'
import { useState, useEffect } from 'react'

// Pages

// ShadCN
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


function FrontdeskDashboard() {
  const APIConn = `${localStorage.url}front-desk.php`;

  const [bookingAmount, setBookingAmount] = useState(null);
  const [roomAmount, setRoomAmount] = useState(null);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [confirmedPayments, setConfirmedPayments] = useState(null)

  const getBookingAmnt = async () => {
  const bookForm = new FormData();
  bookForm.append('method', 'viewReservations');

  try {
    const response = await axios.post(APIConn, bookForm);
    const data = response.data;

    // Parse data if it's a string
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    setBookingAmount(parsedData);

    // Filter for "Approved" or "Checked-Out"
    const confirmed = parsedData.filter(
      (booking) =>
        booking.booking_status_name === "Approved" ||
        booking.booking_status_name === "Checked-Out"
    );

    setConfirmedPayments(confirmed.length);

    console.log('Confirmed Bookings:', confirmed);
    console.log('Count:', confirmed.length);
  } catch (err) {
    console.error('Error fetching booking amount:', err);
  }
};


  const getRoomAmnt = async () => {
    const bookForm = new FormData();
    bookForm.append('method', 'roomAmnt');

    try {
      const response = await axios.post(APIConn, bookForm);
      const data = response.data;

      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

      setRoomAmount(parsedData);

      // Filter rooms with status_name === "Vacant"
      const vacantRooms = parsedData.filter(room => room.status_name === "Vacant");
      setAvailableRooms(vacantRooms.length);

      console.log('Room Amount Parsed:', parsedData);
      console.log('Vacant Rooms:', vacantRooms.length);
    } catch (err) {
      console.error('Error fetching room amount:', err);
    }
  };

  useEffect(() => {
    getBookingAmnt();
    getRoomAmnt();
  }, []);

  return (
    <>
      {/* Header Section */}
      <div className="px-4 py-2">
        <FrontHeader />
        <h1 className="text-xl sm:text-2xl font-semibold mt-4">Frontdesk Dashboard</h1>
      </div>

      {/* Main Content Section */}
      <div className="p-4">
        <div className="flex flex-wrap gap-4">
          <Card className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
            <CardHeader>
              <CardTitle>Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{Array.isArray(roomAmount) ? roomAmount.length : 0}</p>
            </CardContent>
          </Card>

          <Card className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
            <CardHeader>
              <CardTitle>Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{Array.isArray(bookingAmount) ? bookingAmount.length : 0}</p>
            </CardContent>
          </Card>

          <Card className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
            <CardHeader>
              <CardTitle>Available Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{availableRooms ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{confirmedPayments ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      </div>

    </>

  )
}

export default FrontdeskDashboard