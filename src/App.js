import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, LogIn, UserPlus, Lock } from 'lucide-react';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [view, setView] = useState('welcome');
  const [loginForm, setLoginForm] = useState({ name: '', phone: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await window.storage.get('users').catch(() => null);
      if (result?.value) {
        setUsers(JSON.parse(result.value));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const save = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  };

  const handleLogin = () => {
    // Validasi input
    if (!loginForm.name.trim()) {
      setError('Nama harus diisi');
      return;
    }
    if (!loginForm.phone.trim()) {
      setError('Nomor HP harus diisi');
      return;
    }

    // Cari user
    const user = users.find(
      u => u.phone === loginForm.phone.trim() && u.name === loginForm.name.trim()
    );

    if (user) {
      setCurrentUser(user);
      setView(user.isAdmin ? 'admin' : 'user');
      setError('');
      setLoginForm({ name: '', phone: '' });
    } else {
      setError('User tidak ditemukan! Periksa nama dan nomor HP Anda.');
    }
  };

  const handleRegister = async () => {
    // Validasi input
    if (!registerForm.name.trim()) {
      setError('Nama harus diisi');
      return;
    }
    if (!registerForm.address.trim()) {
      setError('Alamat harus diisi');
      return;
    }
    if (!registerForm.phone.trim()) {
      setError('Nomor HP harus diisi');
      return;
    }

    // Validasi format nomor HP
    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(registerForm.phone.replace(/\s|-/g, ''))) {
      setError('Nomor HP tidak valid (10-13 digit)');
      return;
    }

    // Cek apakah nomor HP sudah terdaftar
    const existingUser = users.find(u => u.phone === registerForm.phone.trim());
    if (existingUser) {
      setError('Nomor HP sudah terdaftar!');
      return;
    }

    // Buat user baru (user pertama otomatis jadi admin)
    const newUser = {
      id: Date.now().toString(),
      name: registerForm.name.trim(),
      address: registerForm.address.trim(),
      phone: registerForm.phone.trim(),
      isAdmin: users.length === 0, // User pertama jadi admin
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    const saved = await save('users', updatedUsers);

    if (saved) {
      setUsers(updatedUsers);
      setCurrentUser(newUser);
      setView(newUser.isAdmin ? 'admin' : 'user');
      setError('');
      setRegisterForm({ name: '', address: '', phone: '' });
      
      // Show welcome message
      if (newUser.isAdmin) {
        alert('Selamat datang Admin! Anda adalah pengguna pertama.');
      }
    } else {
      setError('Gagal menyimpan data. Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('welcome');
    setLoginForm({ name: '', phone: '' });
    setRegisterForm({ name: '', address: '', phone: '' });
    setError('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-lg">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistem Pre-Order</h1>
            <p className="text-gray-600">Kelola pesanan dropship dengan mudah</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => { setView('login'); setError(''); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <LogIn className="w-5 h-5" />
              Masuk
            </button>
            <button
              onClick={() => { setView('register'); setError(''); }}
              className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <UserPlus className="w-5 h-5" />
              Daftar Akun Baru
            </button>
          </div>

          {users.length === 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                ℹ️ Belum ada pengguna. Daftar sekarang untuk menjadi Admin!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Login Screen
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Masuk</h2>
            <button
              onClick={() => { setView('welcome'); setError(''); setLoginForm({ name: '', phone: '' }); }}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={loginForm.name}
                onChange={e => setLoginForm({ ...loginForm, name: e.target.value })}
                onKeyPress={e => handleKeyPress(e, handleLogin)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor HP
              </label>
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={loginForm.phone}
                onChange={e => setLoginForm({ ...loginForm, phone: e.target.value })}
                onKeyPress={e => handleKeyPress(e, handleLogin)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Masuk
            </button>

            <p className="text-center text-sm text-gray-600">
              Belum punya akun?{' '}
              <button
                onClick={() => { setView('register'); setError(''); setLoginForm({ name: '', phone: '' }); }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Daftar di sini
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Register Screen
  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Daftar Akun</h2>
            <button
              onClick={() => { setView('welcome'); setError(''); setRegisterForm({ name: '', address: '', phone: '' }); }}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {users.length === 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Akun pertama otomatis menjadi Admin
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={registerForm.name}
                onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                onKeyPress={e => handleKeyPress(e, handleRegister)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap *
              </label>
              <textarea
                placeholder="Masukkan alamat lengkap"
                value={registerForm.address}
                onChange={e => setRegisterForm({ ...registerForm, address: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor HP *
              </label>
              <input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={registerForm.phone}
                onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                onKeyPress={e => handleKeyPress(e, handleRegister)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Gunakan nomor yang bisa dihubungi (10-13 digit)
              </p>
            </div>

            <button
              onClick={handleRegister}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Daftar Sekarang
            </button>

            <p className="text-center text-sm text-gray-600">
              Sudah punya akun?{' '}
              <button
                onClick={() => { setView('login'); setError(''); setRegisterForm({ name: '', address: '', phone: '' }); }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Masuk di sini
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Views
  if (view === 'admin') {
  return <AdminDashboard currentUser={currentUser} setCurrentUser={handleLogout} />;
  }

  if (view === 'user') {
  return <UserDashboard currentUser={currentUser} setCurrentUser={handleLogout} />;
  }

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-indigo-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition"
            >
              Keluar
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">
              Admin Dashboard akan dimuat di sini
            </p>
            <p className="text-sm text-gray-500">
              Import komponen AdminDashboard untuk melihat fitur lengkap
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'user') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-indigo-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">User Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition"
            >
              Keluar
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">
              User Dashboard akan dimuat di sini
            </p>
            <p className="text-sm text-gray-500">
              Import komponen UserDashboard untuk melihat fitur lengkap
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
