import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';


// ------------------------------------------------------------ Admin Side Here ------------------------------------------------------------
import AdminRoomsList from './pages/admin/RoomsList';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import AdminBookingList from './pages/admin/BookingList';
import AdminCalendar from './pages/admin/Calendar';
import AdminGuestProfile from './pages/admin/GuestProfile';
import AdminPayments from './pages/admin/Payments';
import AdminRequestedAmenities from './pages/admin/RequestedAmenities';
import AdminBookingRoomSelection from './pages/admin/SubPages/BookingRoomSelection';
import AdminReviews from './pages/admin/Reviews';
import AdminTransactionHis from './pages/admin/TransactionHis';
import AdminVisitorsLog from './pages/admin/VisitorsLog';
import AdminAmenityMaster from './pages/admin/Master_Files/AmenityMaster';
import AdminChargesCategory from './pages/admin/Master_Files/ChargesCategory';
import AdminChargeMaster from './pages/admin/Master_Files/ChargeMaster';
import AdminDiscountMaster from './pages/admin/Master_Files/DiscountMaster';
import AdminRoomtype from './pages/admin/Master_Files/RoomTypeMaster';
import AdminNewBook from './pages/admin/WalkIn_Folder/AddWalkIn';
import Landingpage from './pages/Landingpage';
import Billings from './pages/admin/Billings';
import Invoice from './pages/admin/Invoice';
import CreateInvoice from './pages/admin/Invoice';

// Online
import OnlineReqList from './pages/admin/Online_Folder/OnlineReqList';
import { ApprovalProvider } from './pages/admin/Online_Folder/ApprovalContext';
import ApproveRooms from './pages/admin/Online_Folder/ApproveRooms';
import ApprovalReceipt from './pages/admin/Online_Folder/ApprovalReceipt';

// Walk In
import AddWalkIn from './pages/admin/WalkIn_Folder/AddWalkIn';
import ChooseRooms from './pages/admin/WalkIn_Folder/ChooseRooms';
import PaymentMethod from './pages/admin/WalkIn_Folder/PaymentMethod';
import Confirmation from './pages/admin/WalkIn_Folder/Confirmation';
import { WalkInProvider } from './pages/admin/WalkIn_Folder/WalkInContext';

//  ------------------------------------------------------------ End of Admin Pages ------------------------------------------------------------


// Authentication
import Login from './pages/UserAuth_Folder/Login';
import Register from './pages/UserAuth_Folder/Register';
import OTP_Auth from './pages/UserAuth_Folder/OTP_Auth';
import ForgotPassword from './pages/UserAuth_Folder/ForgotPassword';
import ResetPassword from './pages/UserAuth_Folder/ResetPassword';

import CustomerAbout from './pages/customer/CustomerAbout';
import CustomerBooking from './pages/customer/CustomerBooking';
import CustomerRooms from './pages/customer/CustomerRooms';
import CustomerGallery from './pages/customer/CustomerGallery';
import CustomerRestaurant from './pages/customer/CustomerRestaurant';
import { useEffect } from 'react';
import CustomerMain from './pages/customer/CustomerMain';
import { Toaster } from 'sonner';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';

// Frontdesk Side
import CustomerRoomView from './pages/customer/CustomerRoomView';
import RoomSearch from './pages/customer/RoomSearch';
import BookingChargesMaster from './pages/frontdesk/BookingChargesMaster';
import BookingRequestList from './pages/frontdesk/BookingListRequest';
import BookingChargesList from './pages/frontdesk/BookingChargesList';
import BookingCreateInvoice from './pages/frontdesk/BookingCreateInvoice';
import BookingDisplayInvoiceSample from './pages/frontdesk/BookingDisplayInvoiceSample';


function App() {

  useEffect(() => {
    if (localStorage.getItem("url") !== "http://localhost/demirenAPI/api/") {
      localStorage.setItem("url", "http://localhost/demirenAPI/api/");
    }

    // localStorage.setItem("userId", 2);
    // localStorage.setItem("customerOnlineId", 1);

  }, []);



  return (
    <>
      <div className="w-full ">

      </div>
      <Toaster
        position='top-center'
        richColors
        duration={2000}
        icons={{
          success: <CheckCircle2Icon />,
          error: <XCircleIcon />,
        }}

      />
      <Router>


        <div style={{ flex: 1 }}>

          <WalkInProvider>
            <ApprovalProvider>

              <Routes>

                {/* Auth Pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<OTP_Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Admin Pages */}
                <Route path="/" element={<Landingpage />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/admin/roomslist" element={<AdminRoomsList />} />
                <Route path="/admin/bookinglist" element={<AdminBookingList />} />
                <Route path="/admin/newbook" element={<AdminNewBook />} />
                <Route path="/admin/calendar" element={<AdminCalendar />} />
                <Route path="/admin/guestprofile" element={<AdminGuestProfile />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/requestedamenities" element={<AdminRequestedAmenities />} />
                <Route path="/admin/bookingroomselection" element={<AdminBookingRoomSelection />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/transactionhistory" element={<AdminTransactionHis />} />
                <Route path="/admin/visitorslog" element={<AdminVisitorsLog />} />

                <Route path="/admin/amenitymaster" element={<AdminAmenityMaster />} />
                <Route path="/admin/chargescategory" element={<AdminChargesCategory />} />
                <Route path="/admin/chargemaster" element={<AdminChargeMaster />} />
                <Route path="/admin/discountmaster" element={<AdminDiscountMaster />} />
                <Route path="/admin/roomtypemaster" element={<AdminRoomtype />} />

                <Route path="/admin/billings" element={<Billings />} />
                <Route path="/admin/invoice" element={<CreateInvoice />} />

                {/* Online Pages */}
                <Route path="/admin/online" element={<OnlineReqList />} />
                <Route path="/admin/approve/:bookingId" element={<ApproveRooms />} />
                <Route path="/admin/receipt/:bookingId" element={<ApprovalReceipt />} />

                {/* WalkIn Pages */}
                <Route path="/admin/add-walk-in" element={<AddWalkIn />} />
                <Route path="/admin/choose-rooms" element={<ChooseRooms />} />
                <Route path="/admin/payment-method" element={<PaymentMethod />} />
                <Route path="/admin/confirmation" element={<Confirmation />} />

                {/* Frontdesk */}
                {/* <Route path="/frontdesk/login" element={<FrontdeskLogin />} />
            <Route path="/frontdesk/dashboard" element={<FrontdeskDashboard />} />
            <Route path="/frontdesk/walkin" element={<FrontdeskWalkin />} />
            <Route path="/frontdesk/reservations" element={<FrontdeskReservation />} /> */}
                {/* <Route path="/frontdesk/reservations" element={<FrontdeskReservation />} /> */}
                <Route path="/BookingChargesMaster" element={<BookingChargesMaster />} />
                <Route path="/BookingRequestList" element={<BookingRequestList />} />
                <Route path="/BookingChargesList" element={<BookingChargesList />} />
                <Route path="/BookingCreateInvoice" element={<BookingCreateInvoice />} />
                <Route path="/BookingDisplayInvoiceSample" element={<BookingDisplayInvoiceSample />} />


                {/* Customer Route */}
                <Route path="/customer/about" element={<CustomerAbout />} />
                <Route path="/customer/bookings" element={<CustomerBooking />} />
                <Route path="/customer/rooms" element={<CustomerRooms />} />
                <Route path="/customer/gallery" element={<CustomerGallery />} />
                <Route path="/customer/restaurant" element={<CustomerRestaurant />} />
                <Route path="/customer/roomsearch" element={<RoomSearch />} />
                <Route path="/customer/roomview" element={<CustomerRoomView />} />
                <Route path="/customer" element={<CustomerMain />} />



              </Routes>
            </ApprovalProvider>
          </WalkInProvider>

        </div>
        {/* <Footer /> */}

      </Router>

    </>
  );



}

export default App;
