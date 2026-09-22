import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { User, Mail, Lock, Shield, Save, KeyRound } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card, { CardBody, CardHeader } from '../../components/common/Card';

const UserProfile = ({ portalRole = 'student' }) => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, headline, bio, avatar });
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Password update failed');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Badge variant="indigo">Account Settings</Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Profile & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your account credentials, biography, and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: User Summary Card */}
        <div className="md:col-span-4 space-y-6">
          <Card className="text-center p-6 space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <img
                src={
                  avatar ||
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                }
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 shadow-md"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="pt-2">
                <Badge variant="emerald" size="sm" className="capitalize">
                  {user?.role} Role
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Profile + Change Password */}
        <div className="md:col-span-8 space-y-6">
          {/* Edit Profile Card */}
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" />
                Personal Information
              </h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Professional Headline / Major
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior CS Student / Lead Architect"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Biography / Academic Background
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your peers and instructors about yourself..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={savingProfile}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand-600" />
                Update Security Password
              </h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 chars"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    isLoading={changingPassword}
                    icon={Lock}
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
