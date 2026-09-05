import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Box, Wallet, BookOpen, LogOut } from 'lucide-react';
import api from './lib/api';

// --- Login Page ---
function Login() {
  const [email, setEmail] = React.useState('admin@example.com');
  const [password, setPassword] = React.useState('admin123');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Urban Furniture</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-[#003B95] focus:border-[#003B95]" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-[#003B95] focus:border-[#003B95]" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003B95] hover:bg-[#003B95]/90">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Layout ---
function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-[#003B95] text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-white/20 flex items-center gap-2">
          <div className="bg-white text-[#003B95] p-1 rounded font-black text-sm">UF</div>
          Urban Furniture
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/contacts" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><Users size={20} /> Contacts</Link>
          <Link to="/products" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><Box size={20} /> Products</Link>
          <Link to="/accounts" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><Wallet size={20} /> Chart of Accounts</Link>
          <Link to="/journals" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><BookOpen size={20} /> Journals</Link>
        </nav>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Accounting System</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500"><LogOut size={20} /></button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// --- Protect Route ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

// --- Dashboard ---
function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Urban Furniture Dashboard</h2>
      <p className="text-gray-600">Select an option from the sidebar to manage master data.</p>
    </div>
  );
}

// --- Data Pages (Simplified) ---
function GenericDataPage({ title, endpoint, columns, itemKey = 'id' }) {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    api.get(endpoint).then(res => setData(res.data)).catch(console.error);
  }, [endpoint]);

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="bg-white shadow rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(item => (
              <tr key={item[itemKey]}>
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item[col.key]}</td>
                ))}
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">No records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- App Root ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/contacts" element={<ProtectedRoute>
          <GenericDataPage title="Contacts" endpoint="/contacts" columns={[{key: 'name', label: 'Name'}, {key: 'type', label: 'Type'}, {key: 'email', label: 'Email'}]} />
        </ProtectedRoute>} />
        
        <Route path="/products" element={<ProtectedRoute>
          <GenericDataPage title="Products" endpoint="/products" columns={[{key: 'sku', label: 'SKU'}, {key: 'name', label: 'Name'}, {key: 'type', label: 'Type'}, {key: 'sales_price', label: 'Sales Price'}]} />
        </ProtectedRoute>} />
        
        <Route path="/accounts" element={<ProtectedRoute>
          <GenericDataPage title="Chart of Accounts" endpoint="/accounts" columns={[{key: 'code', label: 'Code'}, {key: 'name', label: 'Name'}, {key: 'type', label: 'Type'}, {key: 'balance', label: 'Balance'}]} />
        </ProtectedRoute>} />

        <Route path="/journals" element={<ProtectedRoute>
          <GenericDataPage title="Journals" endpoint="/journals" columns={[{key: 'name', label: 'Name'}, {key: 'type', label: 'Type'}]} />
        </ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
