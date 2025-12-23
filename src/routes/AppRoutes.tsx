import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Assigned from "../pages/Assigned";
import Created from "../pages/Created";
import Announcement from "../pages/Announcement";
import NewMessage from "../pages/NewMessage";
import Departments from "../pages/settings/Departments";
import Statuses from "../pages/settings/Statuses";
import Layout from "../components/Layout";
import { isLoggedIn } from "../api/auth";
import Users from "../pages/settings/Users";
import MessageDetail from "../pages/MessageDetail";

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
            <Route index element={<Dashboard />} />
            <Route path="assigned" element={<Assigned />} />
            <Route path="created" element={<Created />} />
            <Route path="announcement" element={<Announcement />} />
            <Route path="profile" element={<Profile />} />
            <Route path="new-message" element={<NewMessage />} />
            <Route path="/messages/:id" element={<MessageDetail />} />
            <Route path="settings">
                <Route path="users" element={<Users />} />
                <Route path="departments" element={<Departments />} />
                <Route path="statuses" element={<Statuses />} />
            </Route>
        </Route>
    </Routes>
  );
}
