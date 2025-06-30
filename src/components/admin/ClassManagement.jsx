import React, { useState, useEffect } from "react";
import axios from "axios";
import "./adminstyles/classmanagement.css";
import { gradeAPI, classAPI, staffAPI } from '../../services/api';

const ClassManagement = () => {
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [newGrade, setNewGrade] = useState({ name: "" });
  const [newClass, setNewClass] = useState({
    name: "",
    grade_id: "",
    staff_id: "",
  });
  const [selectedGrade, setSelectedGrade] = useState(null);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gradesRes, classesRes, staffRes] = await Promise.all([
          gradeAPI.getAll(),
          classAPI.getAll(),
          staffAPI.getAll()
        ]);
        setGrades(gradesRes.data);
        setClasses(classesRes.data);
        setStaffMembers(staffRes.data.filter(staff => staff.role === "teacher"));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data.");
      }
    };
    fetchData();
  }, []);
  
  const addGrade = async () => {
    if (!newGrade.name) {
      setError("Grade name is required.");
      return;
    }
  
    try {
      const response = await gradeAPI.create(newGrade);
      setGrades([...grades, response.data]);
      setNewGrade({ name: "" });
      setShowGradeModal(false);
      setSuccess("Grade added successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to add grade.");
    }
  };
  // Delete a grade  
  const deleteGrade = async (gradeId) => {
    if (!window.confirm("Are you sure you want to delete this grade? All associated classes will also be deleted.")) {
      return;
    }
  
    try {
      await gradeAPI.delete(gradeId);
      setGrades(grades.filter(grade => grade.id !== gradeId));
      setClasses(classes.filter(cls => cls.grade_id !== gradeId));
      setSuccess("Grade deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete grade.");
    }
  };
  
  const addClass = async () => {
    if (!newClass.name || !newClass.grade_id) {
      setError("Class name and grade are required.");
      return;
    }
  
    try {
      const response = await classAPI.create(newClass);
      setClasses([...classes, response.data]);
      setNewClass({ name: "", grade_id: "", staff_id: "" });
      setShowClassModal(false);
      setSuccess("Class added successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to add class.");
    }
  };
  
  const deleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) {
      return;
    }
  
    try {
      await classAPI.delete(classId);
      setClasses(classes.filter(cls => cls.id !== classId));
      setSuccess("Class deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete class.");
    }
  };
  
  const assignTeacher = async (classId, staffId) => {
    try {
      await classAPI.assignTeacher({
        staff_id: staffId,
        class_id: classId
      });
      
      setClasses(classes.map(cls => 
        cls.id === classId ? { ...cls, staff_id: staffId } : cls
      ));
      
      setSuccess("Teacher assigned successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to assign teacher.");
    }
  };

  return (
    <div className="class-management-container">
      <div className="header-section">
        <h2>Grade and Class Management</h2>
        <div className="action-buttons">
          <button className="btn primary" onClick={() => setShowGradeModal(true)}>
            <i className="fas fa-plus"></i> Add Grade
          </button>
          <button className="btn primary" onClick={() => setShowClassModal(true)}>
            <i className="fas fa-plus"></i> Add Class
          </button>
        </div>
      </div>

      {error && (
        <div className="alert error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {success && (
        <div className="alert success">
          <i className="fas fa-check-circle"></i> {success}
        </div>
      )}

      {/* Grades Section */}
      <div className="grades-section">
        <h3>Grades</h3>
        {grades.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-graduation-cap"></i>
            <p>No grades found</p>
          </div>
        ) : (
          <div className="grades-list">
            {grades.map(grade => (
              <div 
                key={grade.id} 
                className={`grade-card ${selectedGrade?.id === grade.id ? 'active' : ''}`}
                onClick={() => setSelectedGrade(grade)}
              >
                <div className="grade-info">
                  <h4>{grade.grade || `Grade ${grade.id}`}</h4>
                  <span>
                    {classes.filter(c => c.grade_id === grade.id).length} classes
                  </span>
                </div>
                <button 
                  className="btn danger small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGrade(grade.id);
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Classes Section */}
      <div className="classes-section">
        <h3>
          {selectedGrade ? `${selectedGrade.grade} Classes` : "All Classes"}
          {selectedGrade && (
            <button 
              className="btn small"
              onClick={() => setSelectedGrade(null)}
            >
              Show All
            </button>
          )}
        </h3>

        {classes.filter(c => !selectedGrade || c.grade_id === selectedGrade.id).length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-chalkboard"></i>
            <p>No classes found</p>
          </div>
        ) : (
          <div className="classes-list">
            {classes
              .filter(c => !selectedGrade || c.grade_id === selectedGrade.id)
              .map(cls => {
                const grade = grades.find(g => g.id === cls.grade_id);
                const teacher = staffMembers.find(s => s.id === cls.staff_id);
                
                return (
                  <div key={cls.id} className="class-card">
                    <div className="class-info">
                      <h4>{cls.name}</h4>
                      <p>
                        <i className="fas fa-graduation-cap"></i> {grade?.grade || `Grade ID: ${cls.grade_id}`}
                      </p>
                      <p>
                        <i className="fas fa-chalkboard-teacher"></i> {cls.staff_name|| 'No Teacher Assigned'}
                      </p>
                    </div>
                    <div className="class-actions">
                      <select
                        value={cls.staff_id || ""}
                        onChange={(e) => assignTeacher(cls.id, e.target.value)}
                        className="teacher-select"
                      >
                        <option value="">Assign Teacher</option>
                        {staffMembers.map(staff => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role})
                          </option>
                        ))}
                      </select>
                      <button 
                        className="btn danger small"
                        onClick={() => deleteClass(cls.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Add Grade Modal */}
      {showGradeModal && (
        <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Grade</h3>
              <button className="close-btn" onClick={() => setShowGradeModal(false)}>
                &times;
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="gradeName">Grade Name</label>
              <input
                id="gradeName"
                type="text"
                placeholder="e.g., Grade 1, Form 2"
                value={newGrade.name}
                onChange={(e) => setNewGrade({ name: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowGradeModal(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={addGrade}>
                Add Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showClassModal && (
        <div className="modal-overlay" onClick={() => setShowClassModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Class</h3>
              <button className="close-btn" onClick={() => setShowClassModal(false)}>
                &times;
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="className">Class Name</label>
              <input
                id="className"
                type="text"
                placeholder="e.g., Class A, Section B"
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="classGrade">Grade</label>
              <select
                id="classGrade"
                value={newClass.grade_id}
                onChange={(e) => setNewClass({ ...newClass, grade_id: e.target.value })}
              >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                  <option key={grade.id} value={grade.id}>
                    {grade.grade}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="classTeacher">Teacher (Optional)</label>
              <select
                id="classTeacher"
                value={newClass.staff_id}
                onChange={(e) => setNewClass({ ...newClass, staff_id: e.target.value })}
              >
                <option value="">Select Teacher</option>
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowClassModal(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={addClass}>
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;