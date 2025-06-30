import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./adminstyles/dashboard.css";
import StatsComponent from "./StatsComponent";
import Header from "../Header";
import { useAuth } from "../../auth/AuthProvider";
import ExpenseList from "./ExpenseList";
import { termAPI } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth(); // No need for name from auth
  const [activeTerm, setActiveTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("Admin Dashboard"); // ✅ Use 'Name'

  // Fetch admin name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }
  }, []);

  // Ensure user is authenticated before proceeding
  useEffect(() => {
    if (!isLoggedIn || role !== "admin") {
      navigate("/login");
      return;
    }
  
    termAPI.getActive()
      .then((response) => {
        setActiveTerm(response.data);
      })
      .catch((error) => {
        console.error("Error fetching active term:", error);
        setActiveTerm(null);
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn, role, navigate]);

  const sections = [
    { label: "Students", icon: "📚", path: "/actions" },
    { label: "Staff", icon: "👩🏫", path: "/staff" },
    { label: "Messaging", icon: "🔔", path: "/messaging" },
    { label: "Printouts", icon: "🖨️", path: "/printer" },
    { label: "Terms", icon: "📅", path: "/terms" },
    { label: "Fees", icon: "💰", path: "/fees" },
    { label: "Subjects", icon: "🎓", path: "/subjects" },
    { label: "Classes", icon: "🏫", path: "/classes" },
  ];

  if (loading) return <p>Loading Admin Dashboard...</p>;

  return (
    <div className="admin-dashboard">
      <Header />
      <div className="dashboard-container">
        <h1>Welcome, {name}!</h1>
        <p>Choose your school with these hellfpulltools:</p>

        <div className="dashboard-sections">
          {sections.map((section, index) => (
            <div
              key={index}
              className="dashboard-card"
              onClick={() => navigate(section.path)}
            >
              <div className="card-icon">{section.icon}</div>
              <div className="card-title">{section.label}</div>
            </div>
          ))}
        </div>

        {/* Display Active Term */}
        <h3>Active Term: {activeTerm ? activeTerm.name : "No active term"}</h3>

        {/* Stats and Expense Section */}
        <ExpenseList />

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>
             <span>&copy; 2025</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;