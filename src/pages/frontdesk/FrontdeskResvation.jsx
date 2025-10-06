import React, { useEffect } from 'react'
import FrontHeader from '@/pages/frontdesk/comps/FrontHeader'
import FrontdeskModal from '@/components/modals/FrontdeskModal';
import { useState } from 'react';
import axios from 'axios';


// ShadCN
import { toast } from 'sonner';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Ellipsis } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function FrontdeskReservation() {
    const APIConn = `${localStorage.url}front-desk.php`;

    const [resvData, setResvData] = useState([]);
    const [selData, setSelData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, setPermission] = useState(0)

    const bookingStatuses = {
        1: "Approved",
        2: "Pending",
        3: "Cancelled"
    };

    // Modal
    const [modalSettings, setModalSettings] = useState({
        modalMode: '',
        showModal: false
    });

    const editStatus = (reserveData) => {
        setModalSettings({
            modalMode: 'editResv',
            showModal: true
        })
        console.log('Data: ', reserveData);
        setSelData(reserveData);
        // Map booking status to status ID
        const statusMap = {
            'Approved': 1,
            'Pending': 2,
            'Cancelled': 3
        };
        setPermission(statusMap[reserveData.booking_status] || 2);
    }

    //   API Connection
    const getBookings = async () => {
        setIsLoading(true);

        try {
            const conn = await axios.get(`${APIConn}?method=viewBookingList`);
            console.log('API Response:', conn.data);
            
            let bookingData = [];
            if (conn.data) {
                try {
                    bookingData = JSON.parse(conn.data);
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    bookingData = [];
                }
            }
            
            setResvData(Array.isArray(bookingData) ? bookingData : []);

        } catch (err) {
            setResvData([]);
            toast.error('Failed to load bookings');
            console.error('Error fetching bookings:', err);
        } finally {
            resetUseState();
        }
    }

    const insertBookingStatus = async () => {
        const formData = new FormData();
        formData.append("method", "changeBookingStatus");
        formData.append("booking_id", selData.booking_id);
        formData.append("status_id", permission);

        try {
            const response = await axios.post(APIConn, formData);

            if (response.data.success) {
                toast.success("Booking status updated successfully");
                getBookings();
                resetUseState();
            } else {
                toast.error("Failed to update status");
                console.log(response.data);
                resetUseState();
            }
        } catch (err) {
            toast.error("Error updating status");
            console.error(err);
            resetUseState();
        }
    };


    // Other Functions
    const formatDateTime = (dateTime) => {
        if (!dateTime) return '';
        const [date] = dateTime.split(' ');
        const newDate = new Date(date);

        return newDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const resetUseState = () => {
        setIsLoading(false);
        setModalSettings({ modalMode: "", showModal: false });
    }

    useEffect(() => {
        getBookings()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {
                isLoading ?
                    <>Still Loading</> :
                    <div>
                        <FrontHeader />
                        <div>
                            <div>FrontDesk Reservations Page</div>

                            <div className="w-full  p-4 rounded-md border">
                                <div className='p-2'>
                                    Search Card for Reservation Here
                                </div>

                                <Table>
                                    <ScrollArea className="h-[400px] w-full p-4">
                                        <TableCaption>A list of your recent reservations.</TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Booking ID</TableHead>
                                                <TableHead>Walk-in</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Downpayment</TableHead>
                                                <TableHead>Check-in</TableHead>
                                                <TableHead>Check-out</TableHead>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Array.isArray(resvData) && resvData.length > 0 ? (
                                                resvData.map((booking, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{booking.booking_id}</TableCell>
                                                        <TableCell>{booking.customers_walk_in_id ? 'Yes' : 'No'}</TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{booking.customer_name}</div>
                                                                <div className="text-sm text-gray-500">{booking.customer_email}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                booking.booking_status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                booking.booking_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                booking.booking_status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {booking.booking_status ?? "Pending"}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>{formatCurrency(booking.downpayment)}</TableCell>
                                                        <TableCell>{formatDateTime(booking.booking_checkin_dateandtime)}</TableCell>
                                                        <TableCell>{formatDateTime(booking.booking_checkout_dateandtime)}</TableCell>
                                                        <TableCell>{booking.reference_no}</TableCell>
                                                        <TableCell>
                                                            <Button className='h-8 px-3 text-sm' onClick={() => editStatus(booking)}>
                                                                <Ellipsis />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                                        No reservations found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </ScrollArea>
                                </Table>
                            </div>

                        </div>
                    </div>
            }
            <FrontdeskModal
                isVisible={modalSettings.showModal}
                onClose={() => setModalSettings({
                    showModal: false,
                    modalMode: ''
                })}
                modalTitle={modalSettings.modalMode === 'editResv' ? 'Editing...' : null}
            >

                {
                    selData && (
                        <>
                            <div className="grid grid-cols-2 gap-6 text-base p-4">
                                {/* Column 1 */}
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Name</p>
                                        <p className="text-lg font-semibold text-white">
                                            {selData.customer_name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Email</p>
                                        <p className="text-lg text-white">{selData.customer_email}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Downpayment</p>
                                        <p className="text-lg text-white">{formatCurrency(selData.downpayment)}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Check-In</p>
                                        <p className="text-lg text-white">{formatDateTime(selData.booking_checkin_dateandtime)}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Check-Out</p>
                                        <p className="text-lg text-white">{formatDateTime(selData.booking_checkout_dateandtime)}</p>
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Date Created:</p>
                                        <p className="text-lg text-white">{formatDateTime(selData.booking_created_at)}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Reference Number</p>
                                        <p className="text-lg text-white">{selData.reference_no}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Phone</p>
                                        <p className="text-lg text-white">{selData.customer_phone || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Booking Status</p>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">
                                                    {bookingStatuses[permission] || "Select status"}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuLabel>Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuRadioGroup
                                                    value={String(permission)}
                                                    onValueChange={(val) => setPermission(Number(val))}
                                                >
                                                    <DropdownMenuRadioItem value="1">Approved</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="2">Pending</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="3">Cancelled</DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Room Numbers</p>
                                        <p className="text-lg text-white">{selData.room_numbers || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <Button onClick={() => insertBookingStatus()}>Change Status</Button>
                                    </div>
                                </div>
                            </div>

                        </>
                    )
                }

            </FrontdeskModal>
        </>
    )
}

export default FrontdeskReservation;