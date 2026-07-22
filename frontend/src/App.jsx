import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BrowsePublicFunds from "./pages/BrowsePublicFunds";
import HarambeePublic from "./pages/HarambeePublic";
import Dashboard from "./pages/Dashboard";
import CreateFund from "./pages/CreateFund";
import GroupDetail from "./pages/GroupDetail";
import Contribute from "./pages/Contribute";
import Claims from "./pages/Claims";
import NotificationPreferences from "./pages/NotificationPreferences";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/browse" element={<BrowsePublicFunds />} />
          <Route path="/harambee/:slug" element={<HarambeePublic />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups/create" element={<CreateFund />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/groups/:id/contribute" element={<Contribute />} />
            <Route path="/groups/:id/claims" element={<Claims />} />
            <Route path="/notifications" element={<NotificationPreferences />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
