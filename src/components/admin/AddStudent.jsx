import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminstyles/addStudent.css';
import { gradeAPI, busAPI, studentAPI, classAPI } from '../../services/api';

// Fetch grades:
const gradeResponse = await gradeAPI.getAll();

// Fetch destinations:
const destinationResponse = await busAPI.getDestinations();

// Handle submit:
const response = await studentAPI.create(studentData);
const AddStudent = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [admission_number, setAdmission_number] = useState('');
  const [grade, setGrade] = useState('');
  const [use_bus, setUse_bus] = useState(false);
  const [class_id, setClass_id] = useState('');
  const [classes, setClasses] = useState([]);

  const [destination_id, setDestination_id] = useState('');
  const [is_boarding, setIs_boarding] = useState(false);
  const [grades, setGrades] = useState([]);
  const [busDestinations, setBusDestinations] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gradeResponse = await gradeAPI.getAll();
        setGrades(gradeResponse.data);

        const destinationResponse = await busAPI.getDestinations();
        setBusDestinations(destinationResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Failed to load grades or destinations.');
      }
    };

    fetchData();
  }, []);

  const handleGradeChange = async (e) => {
    const selectedGrade = parseInt(e.target.value);
    setGrade(selectedGrade);
    setClass_id('');

    try {
      const res = await gradeAPI.getClasses(selectedGrade);
      setClasses(res.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!grade || !class_id) {
      setMessage('Please select both grade and class.');
      return;
    }
  
    const studentData = {
      name,
      phone,
      admission_number,
      grade_id: parseInt(grade),
      class_id: parseInt(class_id),
      is_boarding,
      use_bus,
      destination_id: use_bus ? parseInt(destination_id) : null,
    };
  
    try {
      const response = await studentAPI.create(studentData);
      setMessage(response.data.message || 'Student added successfully.');
      // Reset form
      setName('');
      setAdmission_number('');
      setGrade('');
      setPhone('');
      setUse_bus(false);
      setClass_id('');
      setDestination_id('');
      setIs_boarding(false);
    } catch (error) {
      console.error('Error adding student:', error);
      setMessage(error.response?.data?.error || 'Error adding student. Please try again.');
    }
  };
  return (
    <div className="add-student-container">
      <div className="form-card">
        <div className="form-header">
          <h1 className="form-title">Add New Student</h1>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Name:
                <span className="required">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone number:
                <span className="required">*</span>
              </label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">
                Admission Number:
                <span className="required">*</span>
              </label>
              <input type="text" value={admission_number} onChange={(e) => setAdmission_number(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">
                Grade:
                <span className="required">*</span>
              </label>
              <select value={grade} onChange={handleGradeChange} className="form-select" required>
                <option value="">Select Grade</option>
                {grades.length > 0 ? (
                  grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.grade}
                    </option>
                  ))
                ) : (
                  <option value="">Loading Grades...</option>
                )}
              </select>
            </div>

            {grade && (
              <div className="form-group">
                <label className="form-label">Class:</label>
                <select
                  value={class_id}
                  onChange={(e) => setClass_id(parseInt(e.target.value))} // ✅ parse to int
                  className="form-select"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.staff_name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={is_boarding} onChange={(e) => setIs_boarding(e.target.checked)} className="checkbox-input" />
                <span className="checkbox-custom"></span> Is Boarding
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={use_bus} onChange={(e) => setUse_bus(e.target.checked)} className="checkbox-input" />
                <span className="checkbox-custom"></span> Will Use Bus
              </label>
            </div>

            {use_bus && (
              <div className="form-group">
                <label className="form-label">
                  Bus Destination:
                  <span className="required">*</span>
                </label>
                <select
                  value={destination_id}
                  onChange={(e) => setDestination_id(parseInt(e.target.value))} // ✅ parse to int
                  className="form-select"
                  required
                >
                  <option value="">Select Destination</option>
                  {busDestinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="submit-button">Add Student</button>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;