import React from "react";
import { Link } from "react-router-dom";
import { Package, Bell, LogOut, Home, ShoppingCart, Users, Settings } from "lucide-react";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="p-6 flex items-center gap-2 text-xl font-bold border-b border-indigo-600">
          <Package className="w-6 h-6" />
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-600">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link to="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-600">
            <ShoppingCart className="w-4 h-4" /> Admin
          </Link>
          <Link to="/user" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-600">
            <Users className="w-4 h-4" /> User
          </Link>
          <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-600">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </nav>
        <button className="flex items-center gap-2 px-4 py-3 bg-indigo-800 hover:bg-indigo-600">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-700">Dashboard</h1>
          <button className="relative">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
              3
            </span>
          </button>
        </header>

        {/* Content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
