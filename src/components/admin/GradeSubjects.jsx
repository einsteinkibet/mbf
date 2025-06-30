import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminstyles/gradeSubjects.css';

const GradeSubjects = ({ gradeId, onError, onSuccess }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    total: 0,
    pages: 1
  });

  const API_URL = "http://127.0.0.1:5000";

  const fetchGradeSubjects = async (page = 1, perPage = 20) => {
    setLoading(true);
    onError(null);
    try {
      const response = await axios.get(`${API_URL}/grades/${gradeId}/subjects`, {
        params: {
          page,
          per_page: perPage
        }
      });
      
      setSubjects(response.data.subjects);
      setPagination({
        page: response.data.pagination.current_page,
        perPage: response.data.pagination.per_page,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
        hasNext: response.data.pagination.has_next,
        hasPrev: response.data.pagination.has_prev
      });
    } catch (err) {
      onError(err.response?.data?.error || "Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gradeId) {
      fetchGradeSubjects();
    }
  }, [gradeId]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchGradeSubjects(newPage, pagination.perPage);
    }
  };

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    fetchGradeSubjects(1, newPerPage);
  };

  return (
    <div className="grade-subjects-container">
      {loading && (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Loading subjects...
        </div>
      )}
      
      <div className="subjects-list">
        {subjects.map(subject => (
          <div key={subject.id} className="subject-card">
            <div className="subject-info">
              <h4>{subject.subject_name}</h4>
              <p>Term: {subject.term_name} ({subject.year})</p>
            </div>
          </div>
        ))}
      </div>
      
      {subjects.length === 0 && !loading && (
        <div className="empty-state">
          No subjects found for this grade
        </div>
      )}
      
      <div className="pagination-controls">
        <button 
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPrev || loading}
        >
          <i className="fas fa-chevron-left"></i> Previous
        </button>
        
        <span>
          Page {pagination.page} of {pagination.pages}
        </span>
        
        <button 
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={!pagination.hasNext || loading}
        >
          Next <i className="fas fa-chevron-right"></i>
        </button>
        
        <select 
          value={pagination.perPage} 
          onChange={handlePerPageChange}
          disabled={loading}
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
      </div>
    </div>
  );
};

export default GradeSubjects;