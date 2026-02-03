import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardHome from './pages/vet/DashboardHome';
// import AppointmentsToday from './pages/vet/AppointmentsToday';
import AppointmentsList from './pages/vet/AppointmentsList';
// import PetList from './pages/vet/PetList';
// import PendingRegistrations from './pages/vet/PendingRegistrations';
// import PetDetail from './pages/vet/PetDetail';
// import MedicalRecords from './pages/vet/MedicalRecords';
// import Prescriptions from './pages/vet/Prescriptions';
// import ChatInbox from './pages/vet/ChatInbox';
// import ChatConversation from './pages/vet/ChatConversation';
// import StaffManagement from './pages/vet/StaffManagement';
import ClinicSettings from './pages/vet/ClinicSettings';
import TodaysAppointments from './pages/vet/TodaysAppointments';
import RegisteredPets from './pages/vet/RegisteredPets';
import PendingRegistrations from './pages/vet/PendingRegistrations';
import ChatWithOwners from './pages/vet/VetChat';
import VetStaff from './pages/vet/ClinicStaff';
import VetLogin from './pages/vet/VetLogin';
import VetRegister from './pages/vet/VetRegister';
import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerRegister from './pages/owner/OwnerRegister';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddPet from './pages/owner/AddPet';
import PetProfile from './pages/owner/PetProfile';
import EditPet from './pages/owner/EditPet';
import OwnerAppointments from './pages/owner/Appointments';
import OwnerChat from './pages/owner/OwnerChat';
import AddClinic from './pages/vet/AddClinic';
import AddNewStaff from './pages/vet/AddNewStaff';
import BookAppointment from './pages/owner/BookAppointment';
import ClinicEdit from './pages/vet/ClinicEdit';
import PetProfileAdmin from './pages/vet/PetProfile';
import PetChatbot from './pages/owner/Chatbot';
import Home from './pages/Home';
import AboutUs from './pages/About';
import ContactUs from './pages/Contact';
import EditClinicStaff from './pages/vet/EditClinicStaff';
import MyAppointments from './pages/owner/MyAppointments';
//import EditVet from './pages/vet/EditVet';

function App() {
  // Mock auth - replace with real AuthContext later
  const isVetLoggedIn = true; // Change to false to test redirect

  if (!isVetLoggedIn) {
    return <div>Please log in</div>;
  }

  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="vet/dashboard" element={<DashboardHome />} />
        <Route path="vet/appointments" element={<AppointmentsList />} />
        <Route path="vet/appointments/today" element={<TodaysAppointments />} />
        <Route path="vet/pets" element={<RegisteredPets/>} />
        <Route path="vet/pets/pending" element={<PendingRegistrations/>} />
        <Route path="vet/chat" element={<ChatWithOwners />} />
        <Route path="vet/staff" element={<VetStaff />} />
        <Route path="vet/clinic-settings" element={<ClinicSettings />} /> 
        <Route path="vet/login" element={<VetLogin />} />
        <Route path="vet/register" element={<VetRegister />} />
        <Route path="vet/clinic/create" element={<AddClinic />} />
        <Route path="vet/add-new-staff" element={<AddNewStaff />} />  
        <Route path="/vet/clinic-edit/:id" element={<ClinicEdit />} />
        <Route path="/vet/pets/profile/:petId" element={<PetProfileAdmin />} />  

        <Route path="owner/login" element={<OwnerLogin />} />
        <Route path="register" element={<OwnerRegister />} />
        <Route path="/owner/profile" element={<OwnerDashboard />} />
        <Route path="/owner/pets/new" element={<AddPet />} />
        <Route path="/owner/pets/:id" element={<PetProfile />} />
        <Route path="/owner/pets/:id/edit" element={<EditPet />} />
        <Route path="/owner/appointments" element={<BookAppointment />} />
        <Route path="/owner/chat" element={<OwnerChat/>} />
        <Route path="/chatbot" element={<PetChatbot/>} />
        <Route path="/owner/my-appointments" element={<MyAppointments/>} />

        

        <Route path="vet/edit-staff/:id" element={<EditClinicStaff />} /> {/* Add this line */}
        {/*<Route path="vet/edit-vet/:id" element={<EditVet />}  */}


        {/* <Route path="appointments/today" element={<AppointmentsToday />} />
        <Route path="pets/:id" element={<PetDetail />} />
        <Route path="pets/:id/medical-records" element={<MedicalRecords />} />
        <Route path="pets/:id/prescriptions" element={<Prescriptions />} />
        <Route path="chat" element={<ChatInbox />} />
        <Route path="chat/:petId" element={<ChatConversation />} />
        <Route path="staff" element={<StaffManagement />} /> */}

    </Routes>
  );
}

export default App;