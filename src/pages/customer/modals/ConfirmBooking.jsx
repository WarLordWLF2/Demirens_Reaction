import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import { toast } from 'sonner';

function ConfirmBooking({ open, onClose, summary, onConfirmBooking, handleClearData }) {
  if (!open || !summary) return null;
  const {
    rooms = [],
    numberOfNights = 0,
    checkIn,
    checkOut,
  } = summary;

  const subtotalRaw = rooms.reduce((total, room) => {
    return total + Number(room.roomtype_price) * numberOfNights;
  }, 0);

  const subtotal = Number(subtotalRaw.toFixed(2));

  const basePrice = Number((subtotal / 1.12).toFixed(2));
  const vat = Number((subtotal - basePrice).toFixed(2));
  const downpayment = Number((subtotal / 2).toFixed(2));
  const total = subtotal;



  const handleConfirm = () => {
    console.log("Confirm button clicked");
    if (typeof onConfirmBooking === 'function') {
      onConfirmBooking();
    } else {
      toast.error('Booking function is not available.');
    }
  };


  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-background w-[90vw] max-w-[1100px] h-[850px] p-8 rounded-xl shadow-2xl relative flex flex-col border border-border">
        <Button 
          onClick={() => onClose()} 
          className="absolute top-4 right-4 text-xl font-bold hover:bg-destructive/10 hover:text-destructive transition-colors" 
          variant="ghost"
        >
          ×
        </Button>

        {/* Header with improved styling */}
        <div className="border-b border-border pb-4">
          <h1 className="text-4xl font-semibold leading-none tracking-tight font-playfair text-foreground">Confirm Booking</h1>
          <p className="text-muted-foreground mt-2">
            Please review your booking details carefully before confirming:
          </p>
        </div>

        {/* Stay dates with improved styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/50 border border-border">
            <div className="p-2 rounded-full bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Check-in</p>
              <p className="font-medium text-foreground">{new Date(checkIn).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/50 border border-border">
            <div className="p-2 rounded-full bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
                <path d="m9 16 2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Check-out</p>
              <p className="font-medium text-foreground">{new Date(checkOut).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Rooms scrollable section with improved styling */}
        <div className="mt-6 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
              <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
              <path d="M12 4v6" />
              <path d="M2 18h20" />
            </svg>
            Selected Rooms
          </h3>
          
          <ScrollArea className="h-[300px] border rounded-lg bg-accent/30">
            <div className="p-4 space-y-4">
              {rooms.length > 0 ? (
                rooms.map((room, index) => (
                  <Card
                    key={index}
                    className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="bg-primary/5 px-4 py-2 border-b border-border">
                      <p className="font-semibold text-foreground">{room.roomtype_name}</p>
                    </div>
                    <CardContent className="px-4 py-3">
                      <div className="flex items-start justify-between">
                        <div className="pr-3">
                          <p className="text-xs mt-1 text-muted-foreground max-w-[56ch]">
                            {room.roomtype_description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Per night</p>
                          <p className="font-semibold text-lg text-foreground">
                            ₱ {Number(room.roomtype_price).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">× {numberOfNights} night(s)</p>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-primary/5 text-foreground">Adults: {room.adultCount || 0}</Badge>
                        <Badge variant="outline" className="text-xs bg-primary/5 text-foreground">Children: {room.childrenCount || 0}</Badge>
                        {room.extraBeds > 0 && (
                          <Badge variant="secondary" className="text-xs">Extra Beds: {room.extraBeds}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground p-4">No selected rooms found</p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Fixed totals with improved styling */}
        <div className="mt-6">
          <Card className="bg-card border rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary/5 px-4 py-2 border-b border-border">
              <p className="font-semibold text-foreground">Payment Summary</p>
            </div>
            <CardContent className="py-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">VAT (12%) included</span>
                  <span className="font-medium text-foreground">₱ {Number(vat).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-lg font-semibold text-foreground">₱ {Number(total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-primary/5 p-2 rounded-lg">
                  <span className="text-lg font-semibold text-foreground">Downpayment (50%)</span>
                  <span className="text-lg font-semibold text-primary">₱ {Number(downpayment).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buttons at the very bottom with improved styling */}
        <div className="flex justify-end gap-3 mt-auto pt-6">
          <Button 
            variant="outline" 
            onClick={() => onClose()}
            className="px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="px-6 bg-primary hover:bg-primary/90"
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmBooking;

