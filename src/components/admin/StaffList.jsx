import React, { useState, useEffect } from "react";
import axios from "axios";
import "./adminstyles/stafflist.css";
import { staffAPI, classAPI } from '../../services/api';

const StaffList = () => {
  const [staffList, setStaffList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState({});
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    phone: "",
    role: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    role: "",
    password: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, classesRes] = await Promise.all([
          staffAPI.getAll(),
          classAPI.getAll()
        ]);
        setStaffList(staffRes.data);
        setClasses(classesRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data. Please try again later.");
      }
    };
    fetchData();
  }, []);
  
  const deleteStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }
    
    try {
      await staffAPI.delete(staffId);
      setStaffList(staffList.filter((staff) => staff.id !== staffId));
    } catch (err) {
      setError("Failed to delete staff. Please try again.");
    }
  };
  
  useEffect(() => {
  console.log("Show modal state:", showModal);
}, [showModal]);

  const assignToClass = async (staffId) => {
  const classId = selectedClasses[staffId];
  if (!classId) {
    setError("Please select a class.");
    return;
  }

  try {
    await axios.post(`${API_URL}/assign-class`, {
      staff_id: staffId,
      class_id: classId,
    });
    setError(null);
    alert("Staff successfully assigned to class!");
  } catch (err) {
    setError("Failed to assign class. Please try again.");
  }
};

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!newStaff.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!newStaff.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10,15}$/.test(newStaff.phone)) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!newStaff.role.trim()) {
      errors.role = "Role is required";
      isValid = false;
    }

    if (!newStaff.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (newStaff.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const addStaff = () => {
    setError(null);
    console.log("Add staff button clicked"); // Add this
    setFormErrors({ name: "", phone: "", role: "", password: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewStaff({ name: "", phone: "", role: "", password: "" });
    setFormErrors({ name: "", phone: "", role: "", password: "" });
  };

  const submitNewStaff = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await staffAPI.create(newStaff);
      const response = await staffAPI.getAll();
      setStaffList(response.data);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="staff-list-container">
      <div className="header-section">
        <h2>Staff Management</h2>
        <button className="add-staff-btn" onClick={addStaff}>
          <i className="fas fa-plus"></i> Add Staff
        </button>
      </div>
      
      {error && (
        <div className="alert error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Staff Member</h3>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={newStaff.name}
                onChange={handleInputChange}
                className={formErrors.name ? "error-input" : ""}
              />
              {formErrors.name && <span className="error-text">{formErrors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={newStaff.phone}
                onChange={handleInputChange}
                className={formErrors.phone ? "error-input" : ""}
              />
              {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={newStaff.role}
                onChange={handleInputChange}
                className={formErrors.role ? "error-input" : ""}
              >
                <option value="">Select a role</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Administrator</option>
                <option value="Support Staff">Support Staff</option>
              </select>
              {formErrors.role && <span className="error-text">{formErrors.role}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={newStaff.password}
                onChange={handleInputChange}
                className={formErrors.password ? "error-input" : ""}
              />
              {formErrors.password && <span className="error-text">{formErrors.password}</span>}
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="submit-btn" 
                onClick={submitNewStaff}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  "Add Staff"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {staffList.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-users"></i>
          <p>No staff members found</p>
        </div>
      ) : (
        <div className="staff-list">
          {staffList.map((staff) => (
            <div key={staff.id} className="staff-card">
              <div className="staff-info">
                <h3>{staff.name}</h3>
                <p><i className="fas fa-phone"></i> {staff.phone}</p>
                <p><i className="fas fa-user-tag"></i> {staff.role}</p>
              </div>
              
              <div className="staff-actions">
                <div className="assign-section">
                  <select
                    className="class-select"
                    value={selectedClasses[staff.id] || ""}
                    onChange={(e) =>
                      setSelectedClasses((prev) => ({
                        ...prev,
                        [staff.id]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Assign to class...</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    className="assign-btn"
                    onClick={() => assignToClass(staff.id)}
                    disabled={!selectedClasses[staff.id]}
                  >
                    <i className="fas fa-link"></i> Assign
                  </button>
                  
                </div>
                
                <button 
                  className="delete-btn"
                  onClick={() => deleteStaff(staff.id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffList;