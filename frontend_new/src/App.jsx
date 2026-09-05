import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Box, Wallet, BookOpen, LogOut, List, Grid, Trash2, Edit2 } from 'lucide-react';
import api from './lib/api';

// --- Login Page ---
function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.must_change_password) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
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
              <input type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-[#003B95] focus:border-[#003B95]" placeholder="Enter email" onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 pr-10 focus:ring-[#003B95] focus:border-[#003B95]" placeholder="Enter password" onChange={e => setPassword(e.target.value)} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-gray-500 hover:text-gray-700" onClick={() => { const input = document.getElementById("password"); input.type = input.type === "password" ? "text" : "password"; }}>👁</button>    </div>
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

// --- Change Password Page ---
function ChangePassword() {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      await api.post('/change-password', { newPassword });
      const user = JSON.parse(localStorage.getItem('user'));
      user.must_change_password = false;
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Change Default Password</h2>
            <p className="mt-2 text-sm text-gray-600">Please secure your account before continuing.</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-[#003B95] focus:border-[#003B95]" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-[#003B95] focus:border-[#003B95]" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003B95] hover:bg-[#003B95]/90">
              Update Password
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
          <Link to="/transactions" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><BookOpen size={20} /> Transactions</Link>
          <Link to="/contacts" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><Users size={20} /> Contacts</Link>
          <Link to="/products" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><Box size={20} /> Products</Link>
          <Link to="/accounts" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><Wallet size={20} /> Chart of Accounts</Link>
          <Link to="/journals" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><BookOpen size={20} /> Journals</Link>
          <Link to="/accountants" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded"><Users size={20} /> Accountants</Link>
        </nav>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Accounting System</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500 font-light capitalize">{user.role === 'admin' ? 'Owner' : 'Accountant'}</div>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500"><LogOut size={20} /></button>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}

// --- Protect Route ---
const ProtectedRoute = ({ children, requirePasswordChange = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) return <Navigate to="/login" />;
  
  if (user.must_change_password && !requirePasswordChange) {
    return <Navigate to="/change-password" />;
  }
  if (!user.must_change_password && requirePasswordChange) {
    return <Navigate to="/dashboard" />;
  }

  return requirePasswordChange ? children : <DashboardLayout>{children}</DashboardLayout>;
};

// --- Dashboard ---
function Dashboard() {
  const [stats, setStats] = React.useState(null);
  
  React.useEffect(() => {
    api.get('/dashboard-stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="p-4 flex justify-center items-center h-full text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex gap-8 border-b pb-4 text-gray-500 font-medium">
        <span className="text-[#003B95] border-b-2 border-[#003B95] pb-4 -mb-4 cursor-pointer">Sales</span>
        <span className="cursor-pointer hover:text-gray-800">Purchase</span>
        <span className="cursor-pointer hover:text-gray-800">Account</span>
        <span className="cursor-pointer hover:text-gray-800">Report</span>
      </div>

      {/* Sales Section */}
      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Sales</h3>
          <Link to="/transactions" className="px-8 py-2 bg-[#003B95] text-white rounded-md text-sm font-medium hover:bg-[#003B95]/90 transition-colors shadow-sm">New</Link>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="border-2 border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#003B95] hover:bg-gray-50 transition-all">
            <span className="text-sm font-semibold text-gray-600 mb-1">All</span>
            <span className="text-3xl font-black text-gray-900">{stats.sales.all}</span>
          </div>
          <div className="border-2 border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#003B95] hover:bg-gray-50 transition-all">
            <span className="text-sm font-semibold text-gray-600 mb-1">Confirmed</span>
            <span className="text-3xl font-black text-gray-900">{stats.sales.confirmed}</span>
          </div>
          <div className="border-2 border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#003B95] hover:bg-gray-50 transition-all">
            <span className="text-sm font-semibold text-gray-600 mb-1">Draft</span>
            <span className="text-3xl font-black text-gray-900">{stats.sales.draft}</span>
          </div>
        </div>
      </div>

      {/* Purchase Section */}
      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Purchase</h3>
          <Link to="/transactions" className="px-8 py-2 bg-[#003B95] text-white rounded-md text-sm font-medium hover:bg-[#003B95]/90 transition-colors shadow-sm">New</Link>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="border-2 border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#003B95] hover:bg-gray-50 transition-all">
            <span className="text-sm font-semibold text-gray-600 mb-1">All</span>
            <span className="text-3xl font-black text-gray-900">{stats.purchase.all}</span>
          </div>
          <div className="border-2 border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#003B95] hover:bg-gray-50 transition-all">
            <span className="text-sm font-semibold text-gray-600 mb-1">Confirmed</span>
            <span className="text-3xl font-black text-gray-900">{stats.purchase.confirmed}</span>
          </div>
          <div className="border-2 border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#003B95] hover:bg-gray-50 transition-all">
            <span className="text-sm font-semibold text-gray-600 mb-1">Draft</span>
            <span className="text-3xl font-black text-gray-900">{stats.purchase.draft}</span>
          </div>
        </div>
      </div>

      {/* Budget Reports Section */}
      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Budget Reports</h3>
          <button className="px-8 py-2 bg-[#003B95] text-white rounded-md text-sm font-medium hover:bg-[#003B95]/90 transition-colors shadow-sm">Report</button>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="border-2 border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#003B95] hover:bg-gray-50 transition-all">
            <span className="text-sm font-semibold text-gray-600 mb-1">Achieved</span>
            <span className="text-3xl font-black text-gray-900">{stats.budget.achieved}</span>
          </div>
          <div className="border-2 border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#003B95] hover:bg-gray-50 transition-all">
            <span className="text-sm font-semibold text-gray-600 mb-1">Budget</span>
            <span className="text-3xl font-black text-gray-900">{stats.budget.budget}</span>
          </div>
          <div className="border-2 border-gray-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#003B95] hover:bg-gray-50 transition-all">
            <span className="text-sm font-semibold text-gray-600 mb-1">Committed</span>
            <span className="text-3xl font-black text-gray-900">{stats.budget.committed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Data Pages (Simplified) ---
function GenericDataPage({ title, endpoint, columns, formFields, itemKey = 'id', supportsKanban = false, onDelete, onEdit, filterConfigs = [] }) {
  const [data, setData] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState(null);
  const [formData, setFormData] = React.useState({});
  const [editingId, setEditingId] = React.useState(null);
  const [viewType, setViewType] = React.useState('list');
  const [createdPassword, setCreatedPassword] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterValues, setFilterValues] = React.useState({});

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAccountant = user.role === 'accountant';
  const canEdit = onEdit && !isAccountant;
  const canDelete = onDelete && !isAccountant;

  const fetchData = React.useCallback(() => {
    api.get(endpoint).then(res => setData(res.data)).catch(console.error);
  }, [endpoint]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = React.useMemo(() => {
    return data.filter(item => {
      const matchesSearch = Object.values(item).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterConfigs.every(config => {
        if (!filterValues[config.key]) return true;
        return item[config.key] === filterValues[config.key];
      });
      return matchesSearch && matchesFilter;
    });
  }, [data, searchQuery, filterValues, filterConfigs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editingId 
        ? await api.put(`${endpoint}/${editingId}`, formData)
        : await api.post(endpoint, formData);
        
      if (res.data?.password) {
        setCreatedPassword(res.data.password);
      } else {
        setIsModalOpen(false);
      }
      setFormData({});
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert("Error saving data: " + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item[itemKey]);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`${endpoint}/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Error deleting record: " + (err.response?.data?.error || err.message));
      setDeleteConfirmId(null);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-10 bg-gray-100 px-6 py-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <input 
            type="text" 
            placeholder="Search..." 
            className="border rounded-md p-2 text-sm focus:ring-[#003B95] w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {filterConfigs.map(config => (
            <select
              key={config.key}
              value={filterValues[config.key] || ''}
              onChange={(e) => setFilterValues(prev => ({...prev, [config.key]: e.target.value}))}
              className="border rounded-md p-2 text-sm focus:ring-[#003B95]"
            >
              <option value="">All {config.label}</option>
              {config.options.map(opt => (
                <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
              ))}
            </select>
          ))}
          {supportsKanban && (
            <div className="flex bg-white border rounded-md overflow-hidden shadow-sm">
              <button onClick={() => setViewType('list')} className={`p-2 ${viewType === 'list' ? 'bg-[#003B95] text-white' : 'text-gray-500 hover:bg-gray-50'}`}><List size={20} /></button>
              <button onClick={() => setViewType('kanban')} className={`p-2 ${viewType === 'kanban' ? 'bg-[#003B95] text-white' : 'text-gray-500 hover:bg-gray-50'}`}><Grid size={20} /></button>
            </div>
          )}
          {formFields && (
            <button 
              onClick={() => { setFormData({}); setEditingId(null); setIsModalOpen(true); }}
              className="bg-[#003B95] text-white px-4 py-2 rounded-md hover:bg-[#003B95]/90"
            >
              Add New
            </button>
          )}
        </div>
      </div>
      
      <div className="px-6 pb-6">
        {viewType === 'list' ? (
          <div className="bg-white shadow rounded-lg border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(col => (
                    <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.label}</th>
                  ))}
                  {(canDelete || canEdit) && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map(item => (
                  <tr key={item[itemKey]}>
                    {columns.map((col, idx) => (
                      <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                      </td>
                    ))}
                    {(canDelete || canEdit) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex justify-end gap-2">
                        {canEdit && <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700"><Edit2 size={18} /></button>}
                        {canDelete && <button onClick={() => handleDelete(item[itemKey])} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>}
                      </td>
                    )}
                  </tr>
                ))}
                {filteredData.length === 0 && <tr><td colSpan={columns.length + ((canDelete || canEdit) ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">No records found.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map(item => (
              <div key={item[itemKey]} className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  {canEdit && <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-blue-500"><Edit2 size={16} /></button>}
                  {canDelete && <button onClick={() => handleDelete(item[itemKey])} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>}
                </div>
                <h3 className="font-semibold text-lg text-[#003B95] mb-2">{item.name || item.reference || 'Item'}</h3>
                <div className="space-y-1">
                  <div className="flex flex-col gap-1 mt-2">
                    {columns.map((col, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-500">{col.label}:</span>
                        <span className="font-medium text-gray-900">{col.render ? col.render(item[col.key], item) : item[col.key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No records found.</div>}
          </div>
        )}
      </div>

      {isModalOpen && !createdPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit' : 'Add'} {title}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {formFields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select 
                      name={field.name} 
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      className="w-full border rounded-md p-2 focus:ring-[#003B95] focus:border-[#003B95]"
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : field.type === 'datalist' ? (
                    <>
                      <input 
                        list={`${field.name}-list`}
                        name={field.name}
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        autoComplete="off"
                        className="w-full border rounded-md p-2 focus:ring-[#003B95] focus:border-[#003B95]"
                      />
                      <datalist id={`${field.name}-list`}>
                        {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </datalist>
                    </>
                  ) : (
                    <input 
                      type={field.type || 'text'} 
                      name={field.name} 
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      className="w-full border rounded-md p-2 focus:ring-[#003B95] focus:border-[#003B95]"
                    />
                  )}
                </div>
              ))}
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003B95] text-white rounded-md hover:bg-[#003B95]/90">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {createdPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Accountant Created!</h3>
            <p className="text-gray-600 mb-4">Please share this default password with the accountant. They will be forced to change it upon first login.</p>
            <div className="bg-gray-100 p-4 rounded-md font-mono text-2xl tracking-widest text-[#003B95] mb-6">
              {createdPassword}
            </div>
            <button 
              onClick={() => { setCreatedPassword(''); setIsModalOpen(false); }}
              className="w-full py-2 bg-[#003B95] text-white rounded-md hover:bg-[#003B95]/90"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl transform transition-all scale-100 opacity-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Urban Furniture</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this record? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setDeleteConfirmId(null)} 
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- App Root ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ProtectedRoute requirePasswordChange={true}><ChangePassword /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/contacts" element={<ProtectedRoute>
          <GenericDataPage 
            title="Contacts (Customers/Vendors)" 
            endpoint="/contacts" 
            supportsKanban={true}
            onDelete={true}
            onEdit={true}
            filterConfigs={[
              { key: 'type', label: 'Type', options: ['Customer', 'Vendor', 'Both'] }
            ]}
            columns={[
              {key: 'name', label: 'Name'}, {key: 'type', label: 'Type'}, {key: 'email', label: 'Email'}, {key: 'phone', label: 'Mobile'}, {key: 'city', label: 'City'}
            ]} 
            formFields={[
              {name: 'name', label: 'Name', required: true},
              {name: 'type', label: 'Type', type: 'select', required: true, options: [{value: 'Customer', label: 'Customer'}, {value: 'Vendor', label: 'Vendor'}, {value: 'Both', label: 'Both'}]},
              {name: 'email', label: 'Email', type: 'email'},
              {name: 'phone', label: 'Mobile'},
              {name: 'state', label: 'State', type: 'datalist', required: true, options: [
                {value: 'Gujarat', label: 'Gujarat'},
                {value: 'Maharashtra', label: 'Maharashtra'},
                {value: 'Karnataka', label: 'Karnataka'},
                {value: 'Delhi', label: 'Delhi'},
                {value: 'West Bengal', label: 'West Bengal'}
              ]},
              {name: 'city', label: 'City', type: 'datalist', required: true, options: [
                {value: 'Ahmedabad', label: 'Ahmedabad'},
                {value: 'Surat', label: 'Surat'},
                {value: 'Mumbai', label: 'Mumbai'},
                {value: 'Pune', label: 'Pune'},
                {value: 'Bengaluru', label: 'Bengaluru'},
                {value: 'New Delhi', label: 'New Delhi'},
                {value: 'Kolkata', label: 'Kolkata'}
              ]},
              {name: 'pincode', label: 'Pincode'}
            ]}
          />
        </ProtectedRoute>} />
        
        <Route path="/products" element={<ProtectedRoute>
          <GenericDataPage 
            title="Products" 
            endpoint="/products" 
            supportsKanban={true}
            onDelete={true}
            onEdit={true}
            filterConfigs={[
              { key: 'type', label: 'Type', options: ['Goods', 'Service', 'Combo'] },
              { key: 'category', label: 'Category', options: ['Tables', 'Chairs', 'Sofas', 'Beds', 'Storage', 'Living', 'Bedroom', 'Office', 'Services'] }
            ]}
            columns={[
              {key: 'name', label: 'Product Name'}, {key: 'type', label: 'Type'}, {key: 'category', label: 'Category'}, {key: 'sales_price', label: 'Sales Price'}, {key: 'cost_price', label: 'Cost Price'}
            ]} 
            formFields={[
              {name: 'name', label: 'Product Name', required: true},
              {name: 'type', label: 'Type', type: 'select', required: true, options: [{value: 'Goods', label: 'Goods'}, {value: 'Service', label: 'Service'}, {value: 'Combo', label: 'Combo'}]},
              {name: 'category', label: 'Category', type: 'datalist', required: true, options: [
                {value: 'Tables', label: 'Tables'},
                {value: 'Chairs', label: 'Chairs'},
                {value: 'Sofas', label: 'Sofas'},
                {value: 'Beds', label: 'Beds'},
                {value: 'Storage', label: 'Storage'},
                {value: 'Living', label: 'Living'},
                {value: 'Bedroom', label: 'Bedroom'},
                {value: 'Office', label: 'Office'},
                {value: 'Services', label: 'Services'}
              ]},
              {name: 'sales_price', label: 'Sales Price', type: 'number', required: true},
              {name: 'cost_price', label: 'Cost Price', type: 'number', required: true}
            ]}
          />
        </ProtectedRoute>} />
        
        <Route path="/accounts" element={<ProtectedRoute>
          <GenericDataPage 
            title="Chart of Accounts" 
            endpoint="/accounts" 
            filterConfigs={[
              { key: 'type', label: 'Type', options: ['Asset', 'Liability', 'Expense', 'Income', 'Capital'] }
            ]}
            columns={[
              {key: 'name', label: 'Account Name'}, {key: 'type', label: 'Type'}, {key: 'balance', label: 'Balance'}
            ]} 
            formFields={[
              {name: 'name', label: 'Account Name', required: true},
              {name: 'type', label: 'Type', type: 'select', required: true, options: [
                {value: 'Asset', label: 'Asset'}, {value: 'Liability', label: 'Liability'}, {value: 'Expense', label: 'Expense'}, {value: 'Income', label: 'Income'}, {value: 'Capital', label: 'Capital'}
              ]},
              {name: 'balance', label: 'Opening Balance', type: 'number', required: true}
            ]}
          />
        </ProtectedRoute>} />

        <Route path="/journals" element={<ProtectedRoute>
          <GenericDataPage 
            title="Journals" 
            endpoint="/journals" 
            filterConfigs={[
              { key: 'type', label: 'Type', options: ['Sales', 'Purchase', 'Cash', 'Bank'] }
            ]}
            columns={[
              {key: 'name', label: 'Journal Name'}, {key: 'type', label: 'Type'}, {key: 'default_account_name', label: 'Default Account'}
            ]} 
            formFields={[
              {name: 'name', label: 'Journal Name', required: true},
              {name: 'type', label: 'Type', type: 'select', required: true, options: [
                {value: 'Sales', label: 'Sales'}, {value: 'Purchase', label: 'Purchase'}, {value: 'Cash', label: 'Cash'}, {value: 'Bank', label: 'Bank'}
              ]},
              {name: 'default_account_id', label: 'Default Account ID (Optional)', type: 'number'}
            ]}
          />
        </ProtectedRoute>} />

        <Route path="/transactions" element={<ProtectedRoute>
          <GenericDataPage 
            title="Journal Entries (Deals)" 
            endpoint="/transactions" 
            filterConfigs={[
              { key: 'status', label: 'Status', options: ['Draft', 'Confirmed'] }
            ]}
            columns={[
              {key: 'date', label: 'Date'}, 
              {key: 'reference', label: 'Reference'}, 
              {
                key: 'status', 
                label: 'Status', 
                render: (val) => <span className={`font-semibold ${val === 'Confirmed' ? 'text-green-600' : 'text-amber-500'}`}>{val}</span>
              }, 
              {key: 'journal_name', label: 'Journal'}, 
              {key: 'total_debit', label: 'Total Debit'}, 
              {key: 'total_credit', label: 'Total Credit'}
            ]} 
            formFields={[
              {name: 'date', label: 'Date', type: 'date', required: true},
              {name: 'reference', label: 'Reference (e.g. INV-101)', required: true},
              {name: 'journal_id', label: 'Journal ID (Numeric)', type: 'number', required: true},
              {name: 'status', label: 'Status', type: 'select', required: true, options: [{value: 'Draft', label: 'Draft'}, {value: 'Confirmed', label: 'Confirmed'}]}
            ]}
          />
        </ProtectedRoute>} />

        <Route path="/accountants" element={<ProtectedRoute>
          <GenericDataPage 
            title="Accountants" 
            endpoint="/users" 
            onDelete={true}
            onEdit={true}
            filterConfigs={[
              { key: 'department', label: 'Department', options: ['Sales', 'Purchase', 'Accounts'] }
            ]}
            columns={[
              {key: 'name', label: 'Name'}, {key: 'email', label: 'Email'}, {key: 'department', label: 'Department'}
            ]} 
            formFields={[
              {name: 'name', label: 'Accountant Name', required: true},
              {name: 'email', label: 'Email', type: 'email', required: true},
              {name: 'department', label: 'Department', type: 'select', required: true, options: [{value: 'Sales', label: 'Sales'}, {value: 'Purchase', label: 'Purchase'}, {value: 'Accounts', label: 'Accounts'}]}
            ]}
          />
        </ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
