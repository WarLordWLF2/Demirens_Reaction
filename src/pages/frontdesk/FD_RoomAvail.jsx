import React from 'react'
import FrontHeader from '@/pages/frontdesk/comps/FrontHeader'

function FD_RoomAvail() {
 const APIConn = `${localStorage.url}front-desk.php`;

 return (
  <>
   <FrontHeader />
   <div>Frontdesk Room Availability</div>
  </>
 )
}

export default FD_RoomAvail