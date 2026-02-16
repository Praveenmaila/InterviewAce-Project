import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Target,
  Code,
  Save,
  Camera,
  Shield,
  Bell,
  Trash2,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { LoadingSpinner, Badge } from '../components/ui';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    target_role: '',
    experience_level: '',
    skills: []
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        target_role: user.target_role || '',
        experience_level: user.experience_level || '',
        skills: user.skills || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (formData.skills.includes(newSkill.trim())) {
      toast.error('Skill already added');
      return;
    }
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const updated = await authService.updateProfile(formData);
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setSaving(true);
      await authService.changePassword({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const experienceLevels = [
    { value: 'student', label: 'Student' },
    { value: 'fresh', label: 'Fresh Graduate (0-1 years)' },
    { value: 'junior', label: 'Junior (1-3 years)' },
    { value: 'mid', label: 'Mid-Level (3-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' }
  ];

  const suggestedSkills = [
    'JavaScript', 'Python', 'React', 'Django', 'Node.js', 'Java',
    'SQL', 'AWS', 'Docker', 'Git', 'TypeScript', 'MongoDB'
  ].filter(s => !formData.skills.includes(s));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'security'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </div>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                  {formData.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {formData.first_name || formData.last_name 
                    ? `${formData.first_name} ${formData.last_name}`.trim() 
                    : 'Your Name'}
                </h3>
                <p className="text-gray-500">{formData.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Professional Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-600" />
                Professional Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Role
                  </label>
                  <input
                    type="text"
                    name="target_role"
                    value={formData.target_role}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Full Stack Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select experience level</option>
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary-600" />
                Skills
              </h3>
              
              {/* Current Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map(skill => (
                  <Badge key={skill} variant="primary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {formData.skills.length === 0 && (
                  <p className="text-sm text-gray-500">No skills added yet</p>
                )}
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="input flex-1"
                  placeholder="Add a skill..."
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Suggested Skills */}
              {suggestedSkills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Suggested skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.slice(0, 8).map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          skills: [...prev.skills, skill]
                        }))}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            {/* Change Password */}
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                Change Password
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="input"
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="input"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="input"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Update Password
                  </>
                )}
              </button>
            </form>

            {/* Account Actions */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Actions</h3>
              
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </h4>
                <p className="text-sm text-red-600 mb-4">
                  Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                <button className="btn bg-red-600 text-white hover:bg-red-700">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
