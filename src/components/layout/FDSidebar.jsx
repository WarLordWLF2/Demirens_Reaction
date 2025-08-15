import React, { useState } from 'react'
import { Button } from '../ui/button'
import { MenuSquareIcon, Home, User, BedIcon, Calendar1Icon, LogOutIcon, PillBottleIcon, HistoryIcon, UserPlusIcon, CalendarCheckIcon, CreditCardIcon } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { ScrollArea } from '../ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Link } from 'react-router-dom'


function FDSidebar() {
  const [openBookingList, setOpenBookingList] = useState(false);
  const [openMasters, setOpenMasters] = useState(false);

  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <MenuSquareIcon className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>DEMIREN HOTEL AND RESTAURANT</SheetTitle>
            <SheetDescription>Frontdesk Panel</SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-130px)] mt-2 pr-2">
            <div className="mt-2 space-y-5 pb-36">
              {/* Dashboard */}
              <Link to="/frontdesk/dashboard" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>

              {/* Profile */}
              <Link to="/frontdesk/profile" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </Button>
              </Link>

              {/* Rooms List */}
              <Link to="/frontdesk/roomslist" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <BedIcon className="w-4 h-4" />
                  Rooms List
                </Button>
              </Link>

              {/* Bookings List */}
              <Link to="/frontdesk/walkin" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <UserPlusIcon className="w-4 h-4" />
                  Bookings List
                </Button>
              </Link>

              {/* Billings */}
              <Link to="/frontdesk/billings" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <CreditCardIcon className="w-4 h-4" />
                  Billings
                </Button>
              </Link>

              {/* Guest Profiles */}
              <Link to="/frontdesk/guests" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <CalendarCheckIcon className="w-4 h-4" />
                  Guest Profiles
                </Button>
              </Link>

              {/* Request Amenities */}
              <Link to="/frontdesk/requestedamenities" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <PillBottleIcon className="w-4 h-4" />
                  Request Amenities
                </Button>
              </Link>

              {/* Transaction History */}
              <Link to="/frontdesk/transactions" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <HistoryIcon className="w-4 h-4" />
                  Transaction History
                </Button>
              </Link>

              {/* Calendar */}
              <Link to="/frontdesk/calendar" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Calendar1Icon className="w-4 h-4" />
                  Calendar
                </Button>
              </Link>

              {/* Payments */}
              <Link to="/frontdesk/payments" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <CreditCardIcon className="w-4 h-4" />
                  Payments
                </Button>
              </Link>

              {/* Visitors */}
              <Link to="/frontdesk/visitors" className="block w-full">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="w-4 h-4" />
                  Visitors
                </Button>
              </Link>

            </div>
          </ScrollArea>

          <div className="absolute bottom-4 left-4 right-4 border-t pt-4 bg-background">
            <Button variant="outline">
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default FDSidebar