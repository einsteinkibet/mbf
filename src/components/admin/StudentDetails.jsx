import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab, Tabs, Box } from '@mui/material';
import PerformanceHistory from './PerformanceHistory';
import './adminstyles/studentDetails.css';
import { studentAPI } from '../../services/api';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [currentTab, setCurrentTab] = useState('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, [id]);
  const fetchStudent = async () => {
  try {
    const response = await studentAPI.getById(id);
    setStudent(response.data);
    fetchPerformance(response.data.id);
  } catch (error) {
    console.error('Error fetching student:', error);
  } finally {
    setLoading(false);
  }
};

  const fetchPerformance = async (studentId) => {
    try {
      const response = await studentAPI.getPerformance(studentId);
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) return <div>Loading student details...</div>;
  if (!student) return <div>No student found</div>;

  return (
    <div className="student-details full-page">
      <div className="details-header">
        <h2>{student.name}</h2>
        <button className="close-btn" onClick={() => navigate(-1)}>×</button>
      </div>

      <div className="basic-info">
        <p><strong>Admission No.:</strong> {student.admission_number}</p>
        <p><strong>Grade:</strong> {student.grade?.name || 'N/A'}</p>
        <p><strong>Class:</strong> {student.student_class?.name || 'N/A'}</p>
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Info" value="info" />
          <Tab label="Performance" value="performance" />
          <Tab label="Reports" value="reports" />
        </Tabs>
      </Box>

      <div className="tab-content">
        {currentTab === 'info' && (
          <div className="info-tab">
            <div className="info-section">
              <h3>Contact Information</h3>
              <p><strong>Phone:</strong> {student.phone}</p>
            </div>

            <div className="info-section">
              <h3>Financial Information</h3>
              <p><strong>Balance:</strong> KES {student.balance?.toFixed(2) || '0.00'}</p>
              <p><strong>Arrears:</strong> KES {student.arrears?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        )}

        {currentTab === 'performance' && (
          <PerformanceHistory 
            data={performanceData} 
            loading={loading} 
            studentId={student.id} 
          />
        )}

        {currentTab === 'reports' && (
          <div className="reports-tab">
            <p>Report cards and teacher remarks will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;