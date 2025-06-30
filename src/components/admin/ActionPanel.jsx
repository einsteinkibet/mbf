import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./adminstyles/action.css";
import { studentAPI, gradeAPI, classAPI } from '../../services/api';

const ActionPanel = () => {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editedRecord, setEditedRecord] = useState(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 1
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [grades, setGrades] = useState([]);
  const navigate = useNavigate();

  // Generate color from name for avatar
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 45%)`;
  };

  useEffect(() => {
    fetchGrades();
    fetchStudents();
  }, [pagination.page, pagination.per_page, searchTerm, gradeFilter]);

  const fetchGrades = async () => {
    try {
      const response = await gradeAPI.getAll();
      setGrades(response.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };


  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getAll({
        page: pagination.page,
        per_page: pagination.per_page,
        search: searchTerm,
        grade_id: gradeFilter
      });
      setRecords(response.data.students);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPopup = (record) => {
    setSelectedRecord(record);
    setEditedRecord({ 
      ...record,
      grade_id: record.grade?.id || "",
      class_id: record.class?.id || "",
      destination_id: record.transport?.destination?.id || ""
    });
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedRecord(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };


  const saveChanges = async () => {
    try {
      const dataToSend = {
        name: editedRecord.name,
        admission_number: editedRecord.admission_number,
        phone: editedRecord.phone,
        grade_id: editedRecord.grade_id,
        class_id: editedRecord.class_id,
        is_boarding: editedRecord.boarding_status,
        use_bus: editedRecord.transport.use_bus,
        destination_id: editedRecord.transport.use_bus ? editedRecord.destination_id : null
      };

      await studentAPI.update(selectedRecord.id, dataToSend);
      
      setRecords(prev => prev.map(rec => 
        rec.id === selectedRecord.id ? { ...rec, ...editedRecord } : rec
      ));
      
      alert("Student updated successfully!");
      closePopup();
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student. Please try again.");
    }
  };
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="action-panel-container">
      <div className="action-panel-header">
        <h2>Student Records</h2>
        <button 
          className="add-entry-btn" 
          onClick={() => navigate("/add-student")}
        >
          Add New Student
        </button>
      </div>

      <div className="filters-container">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by name or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && fetchStudents()}
          />
          <button className="search-btn" onClick={fetchStudents}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" 
                    fill="currentColor"/>
            </svg>
          </button>
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Grades</option>
          {grades.map(grade => (
            <option key={grade.id} value={grade.id}>
              {grade.name || grade.grade}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading students...</p>
        </div>
      ) : records.length > 0 ? (
        <>
          <div className="record-grid">
            {records.map(record => (
              <div 
                key={record.id} 
                className="record-card" 
                onClick={() => openPopup(record)}
              >
                <div 
                  className="student-avatar" 
                  style={{ backgroundColor: stringToColor(record.name) }}
                >
                  {record.name.charAt(0).toUpperCase()}
                </div>
                <div className="student-info">
                  <div className="student-name">{record.name}</div>
                  <div className="student-details">
                    <div className="detail-row">
                      <span className="detail-label">ADM:</span>
                      <span className="detail-value">{record.admission_number}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Grade:</span>
                      <span className="detail-value">{record.grade?.name || "N/A"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Class:</span>
                      <span className="detail-value">{record.class?.name || "N/A"}</span>
                    </div>
                  </div>
                  <div className={`balance-status ${record.financial.balance < 0 ? 'negative' : 'positive'}`}>
                    <span>Balance:</span>
                    <span>${record.financial.balance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination-controls">
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
            <select
              value={pagination.per_page}
              onChange={(e) => setPagination(prev => ({
                ...prev,
                per_page: parseInt(e.target.value),
                page: 1
              }))}
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </>
      ) : (
        <div className="no-records">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V8M12 16V19M12 1C5.925 1 1 5.925 1 12C1 18.075 5.925 23 12 23C18.075 23 23 18.075 23 12C23 5.925 18.075 1 12 1Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p>No student records found</p>
          <button 
            className="reset-btn"
            onClick={() => {
              setSearchTerm("");
              setGradeFilter("");
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {isPopupVisible && editedRecord && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Edit Student: {editedRecord.name}</h3>
              <button className="close-popup-btn" onClick={closePopup}>
                &times;
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editedRecord.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Admission Number:</label>
                <input
                  type="text"
                  name="admission_number"
                  value={editedRecord.admission_number}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  name="phone"
                  value={editedRecord.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Grade:</label>
                <select
                  name="grade_id"
                  value={editedRecord.grade_id}
                  onChange={handleChange}
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name || grade.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="boarding_status"
                    checked={editedRecord.boarding_status}
                    onChange={handleChange}
                  />
                  Boarding Student
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="transport.use_bus"
                    checked={editedRecord.transport.use_bus}
                    onChange={(e) => {
                      setEditedRecord(prev => ({
                        ...prev,
                        transport: {
                          ...prev.transport,
                          use_bus: e.target.checked
                        }
                      }));
                    }}
                  />
                  Uses School Bus
                </label>
              </div>

              {editedRecord.transport.use_bus && (
                <div className="form-group">
                  <label>Bus Destination:</label>
                  <select
                    name="destination_id"
                    value={editedRecord.destination_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Destination</option>
                    {editedRecord.transport.destination && (
                      <option value={editedRecord.transport.destination.id}>
                        {editedRecord.transport.destination.name}
                      </option>
                    )}
                  </select>
                </div>
              )}

              <div className="financial-display">
                <h4>Financial Information (Read Only)</h4>
                <div className="financial-grid">
                  <div className="financial-item">
                    <span className="financial-label">Current Balance:</span>
                    <span className="financial-value">
                      ${selectedRecord.financial.balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="financial-item">
                    <span className="financial-label">Arrears:</span>
                    <span className="financial-value">
                      ${selectedRecord.financial.arrears.toFixed(2)}
                    </span>
                  </div>
                  <div className="financial-item">
                    <span className="financial-label">Prepayment:</span>
                    <span className="financial-value">
                      ${selectedRecord.financial.prepayment.toFixed(2)}
                    </span>
                  </div>
                  <div className="financial-item">
                    <span className="financial-label">Bus Balance:</span>
                    <span className="financial-value">
                      ${selectedRecord.transport.bus_balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="popup-actions">
              <button className="cancel-btn" onClick={closePopup}>
                Cancel
              </button>
              <button className="save-btn" onClick={saveChanges}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPanel;