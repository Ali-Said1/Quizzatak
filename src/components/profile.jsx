import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProfilePage.css";

function ProfilePage() {
 
  /*
    Expected user object shape from API:
    {
      id: "u123",
      name: "Ali",
      email: "a@mail.com",
      role: "Student",
      memberSince: "2025-09-28T02:49:09Z"
    }
  */

  const [user, setUser] = useState({
    id: "u123",
    name: "Ali",
    email: "a@mail.com",
    role: "Student",
    memberSince: "9/28/2025, 2:49:09 AM",
  });
  return (
    <div className="profile-container">
      <div className="profile-card h-50 ">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2>Profile</h2>
          <button className="btn-sign-out">Sign out</button>
        </div>

        {/* معلومات المستخدم */}
        <div className="info-grid">
          <div className="form-group">
            <label>Name</label>
            <input type="text" readOnly value={user.name} />
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
            <input type="text" readOnly value={user.memberSince} />
          </div>
        </div>

        {/* نموذج التحديث */}
        <form>
          <div className="form-group">
            <label htmlFor="update-name">Update name</label>
            <input type="text" id="update-name" defaultValue={user.name} />
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
          <a href="#">Go to Student Dashboard</a>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
