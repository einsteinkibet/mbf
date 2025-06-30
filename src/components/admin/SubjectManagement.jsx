import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GradeSubjects from './GradeSubjects';
import './adminstyles/subjectmanagement.css';
import { subjectAPI, gradeAPI, staffAPI } from '../../services/api';

const SubjectManagement = () => {
  // Main state
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [terms] = useState([
    { id: 1, name: 'Term 1' },
    { id: 2, name: 'Term 2' },
    { id: 3, name: 'Term 3' }
  ]);
  
  // Modal and form states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showStaffAssignmentModal, setShowStaffAssignmentModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    is_compulsory: false,
    grade_assignments: []
  });
  const [currentAssignment, setCurrentAssignment] = useState({
    grade_id: '',
    term_id: '1',
    year: new Date().getFullYear(),
    auto_enroll: true
  });
  const [selectedSubjectForAssignment, setSelectedSubjectForAssignment] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // UI states
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // View management
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'gradeView'
  const [selectedGrade, setSelectedGrade] = useState(null);

  // Fetch initial data

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subjectsRes, gradesRes, staffRes] = await Promise.all([
        subjectAPI.getAll(),
        gradeAPI.getAll(),
        staffAPI.getAll()
      ]);
      setSubjects(subjectsRes.data);
      setGrades(gradesRes.data);
      setStaffList(staffRes.data);
    } catch (err) {
      setError("Failed to fetch data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);

const createSubject = async () => {
  if (!newSubject.name || !newSubject.code) {
    setError("Name and code are required");
    return;
  }

  setIsLoading(true);
  try {
    const response = await subjectAPI.create(newSubject);
    setSubjects([...subjects, response.data]);
    setShowSubjectModal(false);
    setNewSubject({
      name: '',
      code: '',
      is_compulsory: false,
      grade_assignments: []
    });
    setSuccess("Subject created successfully!");
    setTimeout(() => setSuccess(null), 3000);
  } catch (err) {
    setError(err.response?.data?.error || "Failed to create subject");
  } finally {
    setIsLoading(false);
  }
};

  // Delete subject
  const deleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    
    setIsLoading(true);
    try {
      await subjectAPI.delete(id);
      setSubjects(subjects.filter(subject => subject.id !== id));
      setSuccess("Subject deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete subject");
    } finally {
      setIsLoading(false);
    }
  };


  // Add grade assignment
  const addGradeAssignment = () => {
    if (!currentAssignment.grade_id) {
      setError("Please select a grade");
      return;
    }
    
    setNewSubject(prev => ({
      ...prev,
      grade_assignments: [
        ...prev.grade_assignments,
        currentAssignment
      ]
    }));
    
    setCurrentAssignment({
      grade_id: '',
      term_id: '1',
      year: new Date().getFullYear(),
      auto_enroll: true
    });
    setError(null);
  };

  // Remove grade assignment
  const removeGradeAssignment = (index) => {
    setNewSubject(prev => ({
      ...prev,
      grade_assignments: prev.grade_assignments.filter((_, i) => i !== index)
    }));
  };

  // View subjects for a grade
  const viewGradeSubjects = (gradeId) => {
    setSelectedGrade(gradeId);
    setViewMode('gradeView');
  };

  // Return to main list
  const returnToList = () => {
    setViewMode('list');
    setSelectedGrade(null);
  };

  // Assign subject to staff
  const assignSubjectToStaff = async () => {
    if (!selectedSubjectForAssignment || !selectedStaff) {
      setError("Please select both a subject and staff member");
      return;
    }
  
    setIsLoading(true);
    try {
      await staffAPI.assignSubject({
        staff_id: selectedStaff.id,
        subject_id: selectedSubjectForAssignment.id
      });
      setSuccess(`Subject assigned to ${selectedStaff.name} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      setShowStaffAssignmentModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign subject");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="subject-management-container">
      {/* Main List View */}
      {viewMode === 'list' ? (
        <>
          <div className="header-section">
            <h2>Subject Management</h2>
            <button 
              className="btn primary" 
              onClick={() => setShowSubjectModal(true)}
              disabled={isLoading}
            >
              <i className="fas fa-plus"></i> Add Subject
            </button>
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

          <div className="grade-filter">
            <select
              value={selectedGrade || ''}
              onChange={(e) => setSelectedGrade(e.target.value || null)}
              disabled={isLoading}
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade.id} value={grade.id}>{grade.name}</option>
              ))}
            </select>
            <button 
              className="btn secondary"
              onClick={() => selectedGrade && viewGradeSubjects(selectedGrade)}
              disabled={!selectedGrade || isLoading}
            >
              <i className="fas fa-eye"></i> View Subjects
            </button>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i> Loading subjects...
            </div>
          ) : subjects.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-book-open"></i>
              <p>No subjects found</p>
            </div>
          ) : (
            <div className="subjects-list">
              {subjects.map(subject => (
                <div key={subject.id} className="subject-card">
                  <div className="subject-info">
                    <h3>{subject.name}</h3>
                    <p><strong>Code:</strong> {subject.code}</p>
                    <p>
                      <strong>Type:</strong> 
                      {subject.is_compulsory ? ' Compulsory' : ' Elective'}
                    </p>
                    {subject.grades && subject.grades.length > 0 && (
                      <div className="subject-grades">
                        <strong>Assigned to:</strong>
                        <ul>
                          {subject.grades.map((grade, index) => (
                            <li key={index}>
                              {grade.grade_name} (Term {grade.term_id}, {grade.year})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="subject-actions">
                    <button 
                      className="btn info small"
                      onClick={() => {
                        setSelectedSubjectForAssignment(subject);
                        setShowStaffAssignmentModal(true);
                      }}
                      disabled={isLoading}
                    >
                      <i className="fas fa-user-plus"></i> Assign Staff
                    </button>
                    <button 
                      className="btn danger small"
                      onClick={() => deleteSubject(subject.id)}
                      disabled={isLoading}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Grade Subjects View */
        <>
          <div className="header-section">
            <button className="btn secondary" onClick={returnToList}>
              <i className="fas fa-arrow-left"></i> Back to All Subjects
            </button>
            <h2>Subjects for Grade {selectedGrade}</h2>
          </div>
          
          <GradeSubjects 
            gradeId={selectedGrade} 
            onError={setError}
            onSuccess={setSuccess}
          />
        </>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="modal-overlay" onClick={() => !isLoading && setShowSubjectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Subject</h3>
              <button 
                className="close-btn" 
                onClick={() => !isLoading && setShowSubjectModal(false)}
                disabled={isLoading}
              >
                &times;
              </button>
            </div>
            
            <div className="form-group">
              <label>Subject Name*</label>
              <input
                type="text"
                value={newSubject.name}
                onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                placeholder="e.g., Mathematics"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label>Subject Code*</label>
              <input
                type="text"
                value={newSubject.code}
                onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                placeholder="e.g., MATH101"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="is_compulsory"
                checked={newSubject.is_compulsory}
                onChange={(e) => setNewSubject({...newSubject, is_compulsory: e.target.checked})}
                disabled={isLoading}
              />
              <label htmlFor="is_compulsory">Compulsory Subject</label>
            </div>

            <div className="grade-assignments">
              <h4>Assign to Grades (Optional)</h4>
              <div className="assignment-form">
                <div className="form-group">
                  <label>Grade</label>
                  <select
                    value={currentAssignment.grade_id}
                    onChange={(e) => setCurrentAssignment({...currentAssignment, grade_id: e.target.value})}
                    disabled={isLoading}
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>{grade.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Term</label>
                  <select
                    value={currentAssignment.term_id}
                    onChange={(e) => setCurrentAssignment({...currentAssignment, term_id: e.target.value})}
                    disabled={isLoading}
                  >
                    {terms.map(term => (
                      <option key={term.id} value={term.id}>{term.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={currentAssignment.year}
                    onChange={(e) => setCurrentAssignment({...currentAssignment, year: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="auto_enroll"
                    checked={currentAssignment.auto_enroll}
                    onChange={(e) => setCurrentAssignment({...currentAssignment, auto_enroll: e.target.checked})}
                    disabled={isLoading}
                  />
                  <label htmlFor="auto_enroll">Auto-enroll students</label>
                </div>
                
                <button 
                  type="button" 
                  className="btn small primary"
                  onClick={addGradeAssignment}
                  disabled={!currentAssignment.grade_id || isLoading}
                >
                  Add Assignment
                </button>
              </div>

              {newSubject.grade_assignments.length > 0 && (
                <div className="assignments-list">
                  {newSubject.grade_assignments.map((assignment, index) => {
                    const grade = grades.find(g => g.id === assignment.grade_id);
                    const term = terms.find(t => t.id === parseInt(assignment.term_id));
                    return (
                      <div key={index} className="assignment-item">
                        <span>
                          {grade?.name} - {term?.name} ({assignment.year})
                          {assignment.auto_enroll && ' (Auto-enroll)'}
                        </span>
                        <button
                          type="button"
                          className="btn small danger"
                          onClick={() => removeGradeAssignment(index)}
                          disabled={isLoading}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn" 
                onClick={() => !isLoading && setShowSubjectModal(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn primary" 
                onClick={createSubject}
                disabled={!newSubject.name || !newSubject.code || isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Creating...
                  </>
                ) : (
                  'Create Subject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showStaffAssignmentModal && (
        <div className="modal-overlay" onClick={() => !isLoading && setShowStaffAssignmentModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Subject to Staff</h3>
              <button 
                className="close-btn" 
                onClick={() => !isLoading && setShowStaffAssignmentModal(false)}
                disabled={isLoading}
              >
                &times;
              </button>
            </div>
            
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={selectedSubjectForAssignment?.name || ''}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label>Staff Member*</label>
              <select
                value={selectedStaff?.id || ''}
                onChange={(e) => {
                  const staff = staffList.find(s => s.id === parseInt(e.target.value));
                  setSelectedStaff(staff || null);
                }}
                disabled={isLoading}
              >
                <option value="">Select Staff Member</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name}</option>
                ))}
              </select>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn" 
                onClick={() => !isLoading && setShowStaffAssignmentModal(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="btn primary" 
                onClick={assignSubjectToStaff}
                disabled={!selectedStaff || isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Assigning...
                  </>
                ) : (
                  'Assign Subject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;