import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./ProfilePage.css";
import Header from "../../components/Header/Header";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

function ProfilePage() {
  const { theme } = useContext(ThemeContext);

  /*
    Expected user object shape from API:
    {
      id: "u123",
      username: "Ali",
      email: "a@mail.com",
      role: "Student",
      createdAt: "2025-09-28T02:49:09Z"
    }
  */

  const user = useAuth().user;
  console.log(user);
  
  return (
    <div className={`main-wrapper ${theme}`}>
      <Header />
      <div className="profile-container">
        <div className="profile-card h-50">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h2>Profile</h2>
            <button className="btn-sign-out">Sign out</button>
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
          <form>
            <div className="form-group">
              <label htmlFor="update-username">Update username</label>
              <input type="text" id="update-username" defaultValue={user.username} />
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New password</label>
              <input
                type="password"
                id="new-password"
                placeholder="Leave blank to keep current"
              />
            </div>

            <div className="form-footer">
              <button type="submit" className="btn-primary">
                Save changes
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
