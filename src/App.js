import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

// Import layout dan halaman
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Admin */}
        <Route
          path="/admin"
          element={
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          }
        />

        {/* Halaman User */}
        <Route
          path="/user"
          element={
            <DashboardLayout>
              <UserDashboard />
            </DashboardLayout>
          }
        />

        {/* Halaman Default */}
        <Route
          path="/"
          element={
            <DashboardLayout>
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Selamat Datang 👋
                </h1>
                <p className="text-gray-600">
                  Pilih menu di sidebar untuk masuk ke Admin atau User Dashboard.
                </p>
              </div>
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
