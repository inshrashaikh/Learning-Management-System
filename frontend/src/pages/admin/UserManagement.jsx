import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, Search, Filter, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (role !== 'all') query.append('role', role);

      const res = await api.get(`/admin/users?${query.toString()}`);
      setUsers(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.patch(`/admin/users/${user._id}/status`);
      toast.success(res.message);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: res.data.user.isActive } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Badge variant="purple">Identity & Access Governance</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          User Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Inspect registered accounts, filter by role permissions, and control access states.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['all', 'student', 'instructor', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                role === r
                  ? 'bg-brand-600 text-white shadow-sm border border-brand-600'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Loading registered users..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-slate-400 text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'purple'
                            : u.role === 'instructor'
                            ? 'indigo'
                            : 'emerald'
                        }
                        size="sm"
                        className="capitalize"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.isActive ? 'emerald' : 'rose'} size="sm">
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant={u.isActive ? 'outline' : 'secondary'}
                        size="sm"
                        onClick={() => handleToggleStatus(u)}
                        icon={u.isActive ? UserX : UserCheck}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
