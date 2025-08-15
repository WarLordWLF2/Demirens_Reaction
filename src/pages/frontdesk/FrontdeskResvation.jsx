import React, { useEffect, useState } from 'react'
import FrontHeader from '@/components/layout/FrontHeader'
import FrontdeskModal from '@/pages/frontdesk/sheets/FrontdeskModal';

// Sheets/Pages
import TableResv from './comps/TableResv';

// ShadCN
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';



function FrontdeskReservation() {
    const [date, setDate] = useState('');

    return (
        <>
            <div>
                <FrontHeader />
            </div>

            <div>
                <div>
                    <div className='flex w-[80vh]'>
                        Filter Date Here:
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                </div>

                <TableResv filterDate={date} />
            </div>

        </>
    )
}

export default FrontdeskReservation;