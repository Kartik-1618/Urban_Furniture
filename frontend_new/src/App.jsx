import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Box, Wallet, BookOpen, LogOut, List, Grid, Trash2 } from 'lucide-react';
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
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Urban Furniture Dashboard</h2>
      <p className="text-gray-600">Select an option from the sidebar to manage master data.</p>
    </div>
  );
}

// --- Data Pages (Simplified) ---
function GenericDataPage({ title, endpoint, columns, formFields, itemKey = 'id', supportsKanban = false, onDelete }) {
  const [data, setData] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({});
  const [viewType, setViewType] = React.useState('list');
  const [createdPassword, setCreatedPassword] = React.useState('');

  const fetchData = React.useCallback(() => {
    api.get(endpoint).then(res => setData(res.data)).catch(console.error);
  }, [endpoint]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(endpoint, formData);
      if (res.data.password) {
        setCreatedPassword(res.data.password);
      } else {
        setIsModalOpen(false);
      }
      setFormData({});
      fetchData();
    } catch (err) {
      alert("Error saving data: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting record");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-4">
          {supportsKanban && (
            <div className="flex bg-white border rounded-md overflow-hidden shadow-sm">
              <button onClick={() => setViewType('list')} className={`p-2 ${viewType === 'list' ? 'bg-[#003B95] text-white' : 'text-gray-500 hover:bg-gray-50'}`}><List size={20} /></button>
              <button onClick={() => setViewType('kanban')} className={`p-2 ${viewType === 'kanban' ? 'bg-[#003B95] text-white' : 'text-gray-500 hover:bg-gray-50'}`}><Grid size={20} /></button>
            </div>
          )}
          {formFields && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#003B95] text-white px-4 py-2 rounded-md hover:bg-[#003B95]/90"
            >
              Add New
            </button>
          )}
        </div>
      </div>
      
      {viewType === 'list' ? (
        <div className="bg-white shadow rounded-lg border overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.label}</th>
                ))}
                {onDelete && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map(item => (
                <tr key={item[itemKey]}>
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item[col.key]}</td>
                  ))}
                  {onDelete && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button onClick={() => handleDelete(item[itemKey])} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={columns.length + (onDelete ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">No records found.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map(item => (
            <div key={item[itemKey]} className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow relative">
              {onDelete && (
                <button onClick={() => handleDelete(item[itemKey])} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              )}
              <h3 className="font-semibold text-lg text-[#003B95] mb-2">{item.name || item.reference || 'Item'}</h3>
              <div className="space-y-1">
                {columns.filter(col => col.key !== 'name' && col.key !== 'reference').map(col => (
                  <div key={col.key} className="text-sm">
                    <span className="text-gray-500">{col.label}: </span>
                    <span className="font-medium text-gray-900">{item[col.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {data.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No records found.</div>}
        </div>
      )}

      {isModalOpen && !createdPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Add {title}</h3>
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
            title="Contacts" 
            endpoint="/contacts" 
            supportsKanban={true}
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
            columns={[
              {key: 'date', label: 'Date'}, {key: 'reference', label: 'Reference'}, {key: 'journal_name', label: 'Journal'}, {key: 'total_debit', label: 'Total Debit'}, {key: 'total_credit', label: 'Total Credit'}
            ]} 
          />
        </ProtectedRoute>} />

        <Route path="/accountants" element={<ProtectedRoute>
          <GenericDataPage 
            title="Accountants" 
            endpoint="/users" 
            onDelete={true}
            columns={[
              {key: 'name', label: 'Name'}, {key: 'email', label: 'Email'}, {key: 'role', label: 'Role'}
            ]} 
            formFields={[
              {name: 'name', label: 'Accountant Name', required: true},
              {name: 'email', label: 'Email', type: 'email', required: true}
            ]}
          />
        </ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
