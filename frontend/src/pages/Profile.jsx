import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { SERVER_BASE_URL } from '../services/api';

const Profile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  
  // Personal Details
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  
  // Job/Skill Details
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  
  // Bank Details
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  // Password Update
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/employees/${user.userId}`);
      const data = response.data;
      setProfile(data);
      setFullName(data.fullName || '');
      setPhoneNumber(data.phoneNumber || '');
      setGender(data.gender || 'Male');
      setEmergencyContactName(data.emergencyContactName || '');
      setEmergencyContactPhone(data.emergencyContactPhone || '');
      setEducation(data.education || '');
      setExperience(data.experience || '');
      setBankName(data.bankName || '');
      setBankAccountNo(data.bankAccountNo || '');
      setBankIfsc(data.bankIfsc || '');
      setTwoFactorEnabled(data.twoFactorEnabled);
    } catch (err) {
      setError('Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      fullName,
      phoneNumber,
      gender,
      emergencyContactName,
      emergencyContactPhone,
      education,
      experience,
      bankName,
      bankAccountNo,
      bankIfsc
    };

    try {
      const response = await api.put(`/employees/${user.userId}/profile`, payload);
      setSuccess('Profile details modified successfully.');
      updateUserProfile({ fullName: response.data.fullName });
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await api.post(`/employees/${user.userId}/change-password`, null, {
        params: { oldPassword, newPassword }
      });
      setSuccess('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed.');
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return;
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('photo', photoFile);

    try {
      const response = await api.post(`/employees/${user.userId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Profile picture updated successfully.');
      setProfile((prev) => ({ ...prev, photoPath: response.data }));
      setPhotoFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo.');
    }
  };

  const handleToggle2FA = async (e) => {
    const val = e.target.checked;
    setError('');
    setSuccess('');
    try {
      await api.post(`/employees/${user.userId}/toggle-2fa?enabled=${val}`);
      setTwoFactorEnabled(val);
      setSuccess(`Two-factor verification has been ${val ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      setError('Failed to update 2FA configuration.');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;
  }

  return (
    <div className="card-custom animate-fade-in shadow-sm">
      <h4 className="font-weight-bold mb-4">My Account Profile</h4>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      <div className="row g-4">
        {/* Left Col: Photo & 2FA toggle */}
        <div className="col-12 col-md-4 text-center border-end">
          <div className="mb-4">
            <img
              src={profile?.photoPath ? `${SERVER_BASE_URL}${profile.photoPath}` : 'https://via.placeholder.com/150'}
              alt="Avatar"
              className="rounded-circle shadow-sm mb-3"
              width="150"
              height="150"
              style={{ objectFit: 'cover' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
            />
            
            <form onSubmit={handlePhotoUpload} className="d-flex flex-column align-items-center gap-2">
              <input
                type="file"
                className="form-control form-control-sm"
                style={{ maxWidth: '240px' }}
                onChange={(e) => setPhotoFile(e.target.files[0])}
                accept="image/*"
              />
              <button type="submit" className="btn btn-sm btn-outline-primary" disabled={!photoFile}>
                Upload Avatar
              </button>
            </form>
          </div>

          <div className="card bg-light p-3 border-0 rounded text-start mb-3">
            <h6 className="font-weight-bold mb-2">Two-Factor Authenticator</h6>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="toggle2fa"
                checked={twoFactorEnabled}
                onChange={handleToggle2FA}
              />
              <label className="form-check-label text-secondary" style={{ fontSize: '0.85rem' }} htmlFor="toggle2fa">
                Enable 2-Step Login Code
              </label>
            </div>
            <small className="text-muted mt-2 d-block" style={{ fontSize: '0.78rem' }}>
              Enabling this prompts you to verify your identity with a 6-digit code printed on the server console at next login.
            </small>
          </div>
        </div>

        {/* Right Col: Details Form & Password Change */}
        <div className="col-12 col-md-8">
          {/* Section 1: Profile details */}
          <form onSubmit={handleUpdateProfile} className="mb-5">
            <h5 className="font-weight-bold border-bottom pb-2 mb-3">Personal & Contact Settings</h5>
            
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Full Name</label>
                <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Phone Number</label>
                <input type="text" className="form-control" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Gender</label>
                <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <h5 className="font-weight-bold border-bottom pb-2 mt-4 mb-3">Emergency Contact</h5>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Contact Name</label>
                <input type="text" className="form-control" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Contact Phone</label>
                <input type="text" className="form-control" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} />
              </div>
            </div>

            <h5 className="font-weight-bold border-bottom pb-2 mt-4 mb-3">Financial / Bank Account Settings</h5>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Bank Name</label>
                <input type="text" className="form-control" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. JPMorgan Chase" />
              </div>
              <div className="col-md-4">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Account Number</label>
                <input type="text" className="form-control" value={bankAccountNo} onChange={(e) => setBankAccountNo(e.target.value)} placeholder="e.g. 12345678" />
              </div>
              <div className="col-md-4">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>IFSC / Routing Code</label>
                <input type="text" className="form-control" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} placeholder="e.g. IFSC123" />
              </div>
            </div>

            <h5 className="font-weight-bold border-bottom pb-2 mt-4 mb-3">Skills, Education, & Experience</h5>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Education</label>
                <textarea className="form-control" rows="2" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. Master of Computer Science"></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Experience</label>
                <textarea className="form-control" rows="2" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5 Years Senior Lead Engineer at Google"></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-primary-custom px-4 py-2 mt-3">Save Profile</button>
          </form>

          {/* Section 2: Password modifier */}
          <form onSubmit={handlePasswordChange}>
            <h5 className="font-weight-bold border-bottom pb-2 mb-3 text-danger">Update Account Password</h5>
            
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Current Password</label>
                <input type="password" className="form-control" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <div className="col-md-4">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>New Password</label>
                <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <div className="col-md-4">
                <label className="form-label font-weight-bold" style={{ fontSize: '0.85rem' }}>Confirm New Password</label>
                <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="btn btn-danger px-4 py-2 mt-3">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
