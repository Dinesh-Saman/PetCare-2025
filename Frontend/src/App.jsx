import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import DashboardHome from './pages/vet/DashboardHome';
import AppointmentsList from './pages/vet/AppointmentsList';
import TodayAppointments from './pages/vet/TodayAppointments';
// import PetList from './pages/vet/PetList';
// import PendingRegistrations from './pages/vet/PendingRegistrations';
// import PetDetail from './pages/vet/PetDetail';
// import MedicalRecords from './pages/vet/MedicalRecords';
// import Prescriptions from './pages/vet/Prescriptions';
// import ChatInbox from './pages/vet/ChatInbox';
// import ChatConversation from './pages/vet/ChatConversation';
// import StaffManagement from './pages/vet/StaffManagement';
import ClinicSettings from './pages/vet/ClinicSettings';
import RegisteredPets from './pages/vet/RegisteredPets';
import PendingRegistrations from './pages/vet/PendingRegistrations';
import ChatWithOwners from './pages/vet/VetChat';
import VetChatWindow from './pages/vet/VetChatWindow';
import VetStaff from './pages/vet/ClinicStaff';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddPet from './pages/owner/AddPetPage';
import PetProfile from './pages/owner/PetProfile';
import EditPet from './pages/owner/EditPet';
import OwnerAppointments from './pages/owner/Appointments';
import OwnerChat from './pages/owner/OwnerChat';
import BookAppointment from './pages/owner/BookAppointment';
import ClinicEdit from './pages/vet/ClinicEdit';
import PetProfileAdmin from './pages/vet/PetProfile';
import PetChatbot from './pages/owner/Chatbot';
import Home from './pages/Home';
import AboutUs from './pages/About';
import ContactUs from './pages/Contact';
import MyAppointments from './pages/owner/MyAppointments';
import ChatWidget from './components/ChatWidget';
import AuthModal from './components/Auth/AuthModal';
import VetProfile from './pages/vet/Profile';
import VetLogin from './pages/vet/VetLogin';
import VetRegister from './pages/vet/VetRegister';
import VetTwoFactor from './pages/vet/VetTwoFactor';
import VetForgotPassword from './pages/vet/VetForgotPassword';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';

// PetCare Tips Pages
import VaccinationTips from './pages/tips/Vaccinations';
import IllnessTips from './pages/tips/SignsOfIllness';
import ToxicFoodsTips from './pages/tips/ToxicFoods';

function App() {
  const location = useLocation();

  // Hide footer on dashboard pages to prevent sidebar clipping
  const shouldHideFooter = location.pathname.startsWith('/vet');

  return (
    <>
      <ScrollToTop />
      <AuthModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/vet/login" element={<VetLogin />} />
        <Route path="/vet/register" element={<VetRegister />} />
        <Route path="/vet/forgot-password" element={<VetForgotPassword />} />
        <Route path="/vet/verify-2fa" element={<VetTwoFactor />} />

        {/* PetCare Tips Routes */}
        <Route path="/tips/vaccinations" element={<VaccinationTips />} />
        <Route path="/tips/signs-of-illness" element={<IllnessTips />} />
        <Route path="/tips/toxic-foods" element={<ToxicFoodsTips />} />

        <Route path="vet/dashboard" element={<DashboardHome />} />
        <Route path="vet/appointments" element={<AppointmentsList />} />
        <Route path="vet/appointments/today" element={<TodayAppointments />} />
        <Route path="vet/pets" element={<RegisteredPets />} />
        <Route path="vet/pets/pending" element={<PendingRegistrations />} />
        <Route path="vet/chat" element={<ChatWithOwners />} />
        <Route path="vet/chat/owner/:ownerId" element={<VetChatWindow />} />
        <Route path="/vet/chat" element={<ChatWithOwners />} />
        <Route path="/vet/chat/owner/:ownerId" element={<VetChatWindow />} />
        <Route path="vet/staff" element={<VetStaff />} />
        <Route path="vet/clinic-settings" element={<ClinicSettings />} />
        <Route path="/vet/pets/profile/:petId" element={<PetProfileAdmin />} />
        <Route path="/vet/profile" element={<VetProfile />} />

        <Route path="/owner/profile" element={<OwnerDashboard />} />
        <Route path="/owner/pets/new" element={<AddPet />} />
        <Route path="/owner/pets/:id" element={<PetProfile />} />
        <Route path="/owner/pets/:id/edit" element={<EditPet />} />
        <Route path="/owner/appointments" element={<BookAppointment />} />
        <Route path="/owner/chat" element={<OwnerChat />} />
        <Route path="/chatbot" element={<PetChatbot />} />
        <Route path="/owner/my-appointments" element={<MyAppointments />} />



        {/*<Route path="vet/edit-vet/:id" element={<EditVet />} */}


        {/* <Route path="appointments/today" element={<AppointmentsToday />} />
        <Route path="pets/:id" element={<PetDetail />} />
        <Route path="pets/:id/medical-records" element={<MedicalRecords />} />
        <Route path="pets/:id/prescriptions" element={<Prescriptions />} />
        <Route path="chat" element={<ChatInbox />} />
        <Route path="chat/:petId" element={<ChatConversation />} />
        <Route path="staff" element={<StaffManagement />} /> */}

      </Routes>
      {!shouldHideFooter && <ChatWidget />}
      {!shouldHideFooter && <Footer />}
    </>
  );
}

export default App;