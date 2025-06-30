import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { studentAPI, gradeAPI } from '../../services/api';

const Printer = () => {
  const [students, setStudents] = useState([]);
  const [amount, setAmount] = useState("");
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [allGrades, setAllGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("balance");
  const [combinedFilter, setCombinedFilter] = useState(false);


  // Fetch all grades on component mount
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await gradeAPI.getAll();
        setAllGrades(response.data);
      } catch (error) {
        console.error("Error fetching grades:", error);
      }
    };
    fetchGrades();
  }, []);

  // Fetch functions with error handling
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (activeTab === 'balance') {
        response = await studentAPI.getByBalance(amount);
      } else if (activeTab === 'grades') {
        response = await studentAPI.getByGrade({ grades: selectedGrades });
      } else {
        response = await studentAPI.getByGradeAndBalance({ 
          grades: selectedGrades, 
          amount 
        });
      }
      setStudents(response.data);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch data");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSelect = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedGrades(options);
  };

  const exportToExcel = () => {
    if (!students.length) {
      alert("No students to export!");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students_report.xlsx");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Student Records Portal</h1>
        <p>Filter and analyze student financial data</p>
      </header>

      <div className="control-panel">
        <div className="filter-tabs">
          <button
            className={`tab ${activeTab === 'balance' ? 'active' : ''}`}
            onClick={() => setActiveTab('balance')}
          >
            Balance Filter
          </button>
          <button
            className={`tab ${activeTab === 'grades' ? 'active' : ''}`}
            onClick={() => setActiveTab('grades')}
          >
            Grade Filter
          </button>
          <button
            className={`tab ${combinedFilter ? 'active' : ''}`}
            onClick={() => setCombinedFilter(true)}
          >
            Combined Filter
          </button>
        </div>

        <div className="filter-card">
          {combinedFilter ? (
            <>
              <h3>Filter by Grade and Balance</h3>
              <div className="filter-group">
                <label>Select Grades:</label>
                <select 
                  multiple 
                  value={selectedGrades}
                  onChange={handleGradeSelect}
                  className="multi-select"
                >
                  {allGrades.map(grade => (
                    <option key={grade.id} value={grade.grade}>
                      {grade.grade}
                    </option>
                  ))}
                </select>
                <small>Hold Ctrl/Cmd to select multiple</small>
              </div>
              <div className="filter-group">
                <label>Minimum Balance:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <button
                onClick={() => fetchData(`${BASE_URL}/students/by-grade-and-balance`, {
                  grades: selectedGrades,
                  amount: amount
                })}
                disabled={!amount || !selectedGrades.length || isLoading}
              >
                {isLoading ? 'Searching...' : 'Apply Filters'}
              </button>
            </>
          ) : activeTab === 'balance' ? (
            <>
              <h3>Students with Balance Above</h3>
              <div className="filter-group">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter minimum amount"
                />
                <button
                  onClick={() => fetchData(`${BASE_URL}/students/by-balance?amount=${amount}`)}
                  disabled={!amount || isLoading}
                >
                  {isLoading ? 'Loading...' : 'Search'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>Filter by Grade Level</h3>
              <div className="filter-group">
                <select
                  multiple
                  value={selectedGrades}
                  onChange={handleGradeSelect}
                  className="multi-select"
                >
                  {allGrades.map(grade => (
                    <option key={grade.id} value={grade.grade}>
                      {grade.grade}
                    </option>
                  ))}
                </select>
                <small>Hold Ctrl/Cmd to select multiple</small>
                <button
                  onClick={() => fetchData(`${BASE_URL}/students/by-grades`, {
                    grades: selectedGrades
                  })}
                  disabled={!selectedGrades.length || isLoading}
                >
                  {isLoading ? 'Loading...' : 'Search'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="data-display">
        <div className="data-header">
          <h3>Student Records ({students.length} found)</h3>
          <button 
            onClick={exportToExcel}
            disabled={!students.length}
            className="export-btn"
          >
            Export to Excel
          </button>
        </div>

        {students.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Admission No.</th>
                  <th>Contact</th>
                  <th>Balance</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.admission_number}</td>
                    <td>{student.phone || '-'}</td>
                    <td className={student.balance > 0 ? 'negative' : 'positive'}>
                      {student.balance.toLocaleString()}
                    </td>
                    <td>{student.grade || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>No student records found</p>
            <p>Apply filters to view data</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          color: #333;
        }
        
        .dashboard-header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #4f6afb, #8a4af3);
          color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .dashboard-header h1 {
          margin: 0;
          font-size: 2rem;
        }
        
        .control-panel {
          background: white;
          border-radius: 10px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .tab {
          padding: 0.75rem 1.5rem;
          background: #f5f7ff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .tab.active {
          background: #4f6afb;
          color: white;
        }
        
        .filter-card {
          background: #f9fafc;
          padding: 1.5rem;
          border-radius: 8px;
        }
        
        .filter-group {
          margin-bottom: 1rem;
        }
        
        .filter-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        input, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .multi-select {
          min-height: 120px;
        }
        
        button {
          padding: 0.75rem 1.5rem;
          background: #4f6afb;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }
        
        button:hover {
          background: #3a5af5;
        }
        
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .error-message {
          padding: 1rem;
          background: #ffebee;
          color: #d32f2f;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .data-display {
          background: white;
          border-radius: 10px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .data-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .export-btn {
          background: #4caf50;
        }
        
        .export-btn:hover {
          background: #3d8b40;
        }
        
        .table-wrapper {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          background: #f5f7ff;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
        }
        
        td {
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        tr:hover {
          background: #f9f9f9;
        }
        
        .negative {
          color: #d32f2f;
          font-weight: 500;
        }
        
        .positive {
          color: #4caf50;
          font-weight: 500;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        @media (max-width: 768px) {
          .filter-tabs {
            flex-direction: column;
          }
          
          .data-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Printer;