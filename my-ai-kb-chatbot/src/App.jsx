import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";



function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      

      

    </Routes>
  );
}

export default App;