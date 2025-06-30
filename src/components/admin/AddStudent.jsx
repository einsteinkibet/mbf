import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminstyles/addStudent.css';
import { gradeAPI, busAPI, studentAPI, classAPI } from '../../services/api';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    admission_number: '',
    grade: '',
    class_id: '',
    use_bus: false,
    destination_id: '',
    is_boarding: false
  });

  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [busDestinations, setBusDestinations] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [gradesRes, destinationsRes] = await Promise.all([
          gradeAPI.getAll(),
          busAPI.getDestinations()
        ]);
        setGrades(gradesRes.data);
        setBusDestinations(destinationsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleGradeChange = async (e) => {
    const selectedGrade = e.target.value;
    setFormData({
      ...formData,
      grade: selectedGrade,
      class_id: ''
    });

    try {
      const res = await gradeAPI.getClasses(selectedGrade);
      setClasses(res.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
      setMessage('Failed to load classes for this grade');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.grade || !formData.class_id) {
      setMessage('Please select both grade and class');
      return;
    }

    try {
      setIsLoading(true);
      const response = await studentAPI.create({
        name: formData.name,
        phone: formData.phone,
        admission_number: formData.admission_number,
        grade_id: parseInt(formData.grade),
        class_id: parseInt(formData.class_id),
        is_boarding: formData.is_boarding,
        use_bus: formData.use_bus,
        destination_id: formData.use_bus ? parseInt(formData.destination_id) : null
      });

      setMessage(response.data.message || 'Student added successfully');
      // Reset form
      setFormData({
        name: '',
        phone: '',
        admission_number: '',
        grade: '',
        class_id: '',
        use_bus: false,
        destination_id: '',
        is_boarding: false
      });
      setClasses([]);
    } catch (error) {
      console.error('Error adding student:', error);
      setMessage(error.response?.data?.error || 'Error adding student. Please try again.');
    } finally {
      setIsLoading(false);
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
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone number:
                <span className="required">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Admission Number:
                <span className="required">*</span>
              </label>
              <input
                type="text"
                name="admission_number"
                value={formData.admission_number}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Grade:
                <span className="required">*</span>
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleGradeChange}
                className="form-select"
                required
                disabled={isLoading}
              >
                <option value="">Select Grade</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.grade && (
              <div className="form-group">
                <label className="form-label">
                  Class:
                  <span className="required">*</span>
                </label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.staff_name || 'No teacher'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_boarding"
                  checked={formData.is_boarding}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span> Is Boarding
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="use_bus"
                  checked={formData.use_bus}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span> Will Use Bus
              </label>
            </div>

            {formData.use_bus && (
              <div className="form-group">
                <label className="form-label">
                  Bus Destination:
                  <span className="required">*</span>
                </label>
                <select
                  name="destination_id"
                  value={formData.destination_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={isLoading}
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

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;