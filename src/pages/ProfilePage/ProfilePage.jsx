import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./ProfilePage.css";
import Header from "../../components/Header/Header";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

function ProfilePage() {
  const { theme } = useContext(ThemeContext);
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState({ username: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ username: user.username || "", email: user.email || "" });
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!profileForm.username.trim() || !profileForm.email.trim()) {
      Swal.fire({ icon: "warning", title: "Missing fields", text: "Username and email are required." });
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ username: profileForm.username.trim(), email: profileForm.email.trim() });
      Swal.fire({ icon: "success", title: "Profile updated" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Update failed", text: error.message || "Unable to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      Swal.fire({ icon: "warning", title: "Missing fields", text: "Enter both current and new passwords." });
      return;
    }
    setUpdatingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      Swal.fire({ icon: "success", title: "Password updated" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Unable to update password", text: error.message || "Please try again." });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      Swal.fire({ icon: "error", title: "Logout failed", text: error.message || "Please try again." });
    }
  };

  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />
      <div className="profile-container">
        <div className="profile-card h-50">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h2>Profile</h2>
            <button className="btn-sign-out" onClick={handleLogout}>Sign out</button>
          </div>

        {/* معلومات المستخدم */}
          <div className="info-grid">
            <div className="form-group">
              <label>Name</label>
              <input type="text" readOnly value={user.username} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="text" readOnly value={user.email} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" readOnly value={user.role} />
            </div>
            <div className="form-group">
              <label>Member since</label>
              <input type="text" readOnly value={user.createdAt} />
            </div>
          </div>

        {/* نموذج التحديث */}
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="update-username">Update username</label>
              <input
                type="text"
                id="update-username"
                value={profileForm.username}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>

            
            <div className="form-footer">
              <button type="submit" className="btn-primary" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>

          <form className="mt-4" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="new-password">New password</label>
              <input
                type="password"
                id="new-password"
                placeholder="Leave blank to keep current"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="current-password">Current password</label>
              <input
                type="password"
                id="current-password"
               value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>

            <div className="form-footer">
              <button type="submit" className="btn-primary" disabled={updatingPassword}>
                {updatingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>

          <div className="card-footer">
            <Link className="fw-bolder" to="/dashboard">Go to {user.role} dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
