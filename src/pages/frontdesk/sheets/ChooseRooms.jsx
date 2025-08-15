import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ChooseRooms = ({ selectRoomFunc }) => {
  const APIConn = `${localStorage.url}front-desk.php`;
  const [allRooms, setAllRooms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guestAmnt, setGuestAmnt] = useState(0);

  const getRooms = async () => {
    console.log();
    const roomListReq = new FormData();
    roomListReq.append('method', 'seeRooms');
    try {
      const conn = await axios.post(APIConn, roomListReq);
      console.log(conn.data)
      setRooms(conn.data);
      setAllRooms(conn.data)
    } catch (err) {
      toast("Error: Cannot Fetch API");
    }
  }

  // Filters Rooms
  const filterRooms = () => {
    setRooms(allRooms.filter(room => room.max_capacity >= guestAmnt));
  }

  useEffect(() => {
    getRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [guestAmnt])

  return (
    <>
      <div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-blue-400 btn">
              Add Room
            </Button>
          </SheetTrigger>


          <SheetContent side="bottom" className="w-full rounded-t-xl p-0">
            <SheetHeader className="px-6 pt-4">
              <SheetTitle>Select a Room</SheetTitle>
              <SheetDescription>

                <span className='inline-flex gap-4 m-2 items-center'>
                  <Label htmlFor='guest'>Guests</Label>
                  <Input
                    id='guest'
                    type='number'
                    className='w-[100px]'
                    value={guestAmnt}
                    onChange={(e) => setGuestAmnt(Number(e.target.value))}
                  />
                </span>

              </SheetDescription>
            </SheetHeader>

            <div className="w-full px-4 pb-6">
              <div className="border rounded-md p-4">
                <ScrollArea className="h-[500px] overflow-y-auto">
                  {rooms?.length === 0 ? (
                    <p className="m-8 p-6 text-center">No Rooms Here</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {rooms.map((room) => (
                        <Card key={room.room_ids} className="flex flex-col justify-between">
                          <CardHeader>
                            <CardTitle>{room.roomtype_name}</CardTitle>
                          </CardHeader>

                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">
                              {room.roomtype_description}
                            </p>
                            <p className="font-semibold text-primary">Max Capacity: {room.max_capacity}</p>
                            <p className="font-semibold text-primary">₱{room.roomtype_price}</p>
                          </CardContent>

                          <CardFooter>
                            <Button onClick={() => selectRoomFunc(room)} className="w-full">
                              Add Room
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </SheetContent>
        </Sheet>

      </div>

    </>
  )
}

export default ChooseRooms