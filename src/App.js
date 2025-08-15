import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import AdminRoomsList from './pages/admin/AdminRoomsList';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import AdminBookingList from './pages/admin/AdminBookingList';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminGuestProfile from './pages/admin/AdminGuestProfile';
import AdminPayments from './pages/admin/AdminPayments';
import AdminRequestedAmenities from './pages/admin/AdminRequestedAmenities';
import AdminReviews from './pages/admin/AdminReviews';
import AdminTransactionHis from './pages/admin/AdminTransactionHis';
import AdminVisitorsLog from './pages/admin/AdminVisitorsLog';
import AdminAmenityMaster from './pages/admin/AdminAmenityMaster';
import AdminChargesCategory from './pages/admin/AdminChargesCategory';
import AdminChargeMaster from './pages/admin/AdminChargeMaster';
import AdminDiscountMaster from './pages/admin/AdminDiscountMaster';
import AdminRoomtype from './pages/admin/AdminRoomtype';
import AdminNewBook from './pages/admin/WalkIn_Folder/AddWalkIn';
import Landingpage from './pages/Landingpage';
import Billings from './pages/admin/Billings';
import Invoice from './pages/admin/Invoice';
import OnlineReqList from './pages/admin/OnlineReqList';
import AddWalkIn from './pages/admin/WalkIn_Folder/AddWalkIn';
import ChooseRooms from './pages/admin/WalkIn_Folder/ChooseRooms';
import PaymentMethod from './pages/admin/WalkIn_Folder/PaymentMethod';
import Confirmation from './pages/admin/WalkIn_Folder/Confirmation';
import { WalkInProvider } from './pages/admin/WalkIn_Folder/WalkInContext';

import Login from './pages/Login';
import Register from './pages/Register';
import CustomerAbout from './pages/customer/CustomerAbout';
import CustomerBooking from './pages/customer/CustomerBooking';
import CustomerRooms from './pages/customer/CustomerRooms';
import CustomerGallery from './pages/customer/CustomerGallery';
import CustomerRestaurant from './pages/customer/CustomerRestaurant';
import CustomerMain from './pages/customer/CustomerMain';
import { Toaster } from 'sonner';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';

// Frontdesk Side
import FrontdeskLogin from './pages/frontdesk/FrontdeskLogin';
import FrontdeskDashboard from './pages/frontdesk/FrontdeskDashboard';
import FrontdeskProfile from './pages/frontdesk/FrontdeskProfile';
import FrontdeskWalkin from './pages/frontdesk/FrontdeskWalkin';
import FrontdeskReservation from './pages/frontdesk/FrontdeskResvation';
import { useEffect } from 'react';

function App() {

  useEffect(() => {
    if (localStorage.getItem("url") !== "http://localhost/demirenAPI/") {
      localStorage.setItem("url", "http://localhost/demirenAPI/");
    }
    localStorage.setItem("userId", 2);
    localStorage.setItem("customerOnlineId", 1);
  }, []);

  return (
    <>
      <Toaster
        richColors
        duration={2000}
        icons={{
          success: <CheckCircle2Icon />,
          error: <XCircleIcon />,
        }}
      />

      <Router>
        <WalkInProvider>
          <div style={{ flex: 1, padding: '20px' }}>
            <Routes>
              {/* Admin Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/transactionhistory" element={<AdminTransactionHis />} />
              <Route path="/admin/visitorslog" element={<AdminVisitorsLog />} />
              <Route path="/admin/amenitymaster" element={<AdminAmenityMaster />} />
              <Route path="/admin/chargescategory" element={<AdminChargesCategory />} />
              <Route path="/admin/chargemaster" element={<AdminChargeMaster />} />
              <Route path="/admin/discountmaster" element={<AdminDiscountMaster />} />
              <Route path="/admin/roomtypemaster" element={<AdminRoomtype />} />
              <Route path="/admin/billings" element={<Billings />} />
              <Route path="/admin/invoice" element={<Invoice />} />
              <Route path="/admin/online" element={<OnlineReqList />} />

              {/* WalkIn Pages */}
              <Route path="/admin/add-walk-in" element={<AddWalkIn />} />
              <Route path="/admin/choose-rooms" element={<ChooseRooms />} />
              <Route path="/admin/payment-method" element={<PaymentMethod />} />
              <Route path="/admin/confirmation" element={<Confirmation />} />

              {/* Frontdesk Pages */}
              <Route path="/frontdesk/login" element={<FrontdeskLogin />} />
              <Route path="/frontdesk/dashboard" element={<FrontdeskDashboard />} />
              <Route path="/frontdesk/profile" element={<FrontdeskProfile />} />
              <Route path="/frontdesk/roomslist" element={<FrontdeskReservation />} />
              <Route path="/frontdesk/walkin" element={<FrontdeskWalkin />} />

              {/* Customer Pages */}
              <Route path="/customer/about" element={<CustomerAbout />} />
              <Route path="/customer/bookings" element={<CustomerBooking />} />
              <Route path="/customer/rooms" element={<CustomerRooms />} />
              <Route path="/customer/gallery" element={<CustomerGallery />} />
              <Route path="/customer/restaurant" element={<CustomerRestaurant />} />
              <Route path="/customer" element={<CustomerMain />} />
            </Routes>
          </div>
        </WalkInProvider>
      </Router>
    </>
  );
}

export default App;
