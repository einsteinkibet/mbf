import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, Tab, Box } from '@mui/material';
import './adminstyles/history.css';
import { studentAPI } from '../../services/api';

const PerformanceHistory = ({ studentId }) => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exams');

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getPerformance(studentId);
        setPerformanceData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load performance data');
        setLoading(false);
        console.error('Error fetching performance data:', err);
      }
    };
    

    if (studentId) {
      fetchPerformanceData();
    }
  }, [studentId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <div className="loading-container">Loading performance data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!performanceData || performanceData.length === 0) {
    return <div className="no-data">No performance data available</div>;
  }

  // Process data for charts
  const examData = performanceData.reduce((acc, term) => {
    term.exams?.forEach(exam => {
      const existingExam = acc.find(e => e.exam_id === exam.exam_id);
      if (existingExam) {
        existingExam.marks.push(...exam.marks);
      } else {
        acc.push({
          exam_id: exam.exam_id,
          exam_name: exam.exam_name,
          term_name: term.term_name,
          marks: [...exam.marks]
        });
      }
    });
    return acc;
  }, []);

  const subjectData = performanceData.reduce((acc, term) => {
    term.subjects?.forEach(subject => {
      const existingSubject = acc.find(s => s.subject_id === subject.subject_id);
      if (existingSubject) {
        existingSubject.marks.push(...subject.marks);
      } else {
        acc.push({
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
          marks: [...subject.marks]
        });
      }
    });
    return acc;
  }, []);

  return (
    <div className="performance-history">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="By Exam" value="exams" />
          <Tab label="By Subject" value="subjects" />
          <Tab label="Trends" value="trends" />
        </Tabs>
      </Box>

      <div className="tab-content">
        {activeTab === 'exams' && (
          <div className="exam-performance">
            <h3>Exam Performance</h3>
            {examData.map(exam => (
              <div key={`exam-${exam.exam_id}`} className="exam-chart-container">
                <h4>{exam.exam_name} ({exam.term_name})</h4>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={exam.marks}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject_name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#3498db" name="Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="exam-marks-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Score</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exam.marks.map(mark => (
                        <tr key={`${exam.exam_id}-${mark.subject_id}`}>
                          <td>{mark.subject_name}</td>
                          <td>{mark.score}</td>
                          <td className={`grade-${mark.grade}`}>{mark.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="subject-performance">
            <h3>Subject Performance</h3>
            {subjectData.map(subject => (
              <div key={`subject-${subject.subject_id}`} className="subject-chart-container">
                <h4>{subject.subject_name}</h4>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={subject.marks}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="exam_name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#2ecc71" name="Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="subject-marks-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Exam</th>
                        <th>Term</th>
                        <th>Score</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subject.marks.map(mark => (
                        <tr key={`${subject.subject_id}-${mark.exam_id}`}>
                          <td>{mark.exam_name}</td>
                          <td>{performanceData.find(t => t.exams?.some(e => e.exam_id === mark.exam_id))?.term_name}</td>
                          <td>{mark.score}</td>
                          <td className={`grade-${mark.grade}`}>{mark.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="performance-trends">
            <h3>Performance Trends</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={performanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="term_name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average_score" fill="#9b59b6" name="Average Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceHistory;