import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import "./stats.css";

const StatsComponent = () => {
  const [stats, setStats] = useState(null);
  const [term, setTerm] = useState(null);
  const [view, setView] = useState("term");
  const schoolChartRef = useRef(null);
  const expenseChartRef = useRef(null);

  useEffect(() => {
    axios.get("http://100.154.44.10:5000/term/current")
      .then(response => setTerm(response.data))
      .catch(error => console.error("Error fetching term:", error));
  }, []);

  const fetchStats = (type) => {
    const url =
      type === "term"
        ? "http://100.154.44.10:5000/stats/term"
        : type === "monthly"
        ? "http://100.154.44.10:5000/stats/monthly"
        : "http://100.154.44.10:5000/stats/yearly";

    axios.get(url)
      .then(response => {
        setStats(response.data);
        renderCharts(response.data);
      })
      .catch(error => console.error("Error fetching stats:", error));
  };

  useEffect(() => {
    fetchStats("term");
  }, []);

  const renderCharts = (data) => {
    if (!data) return;

    if (schoolChartRef.current) schoolChartRef.current.destroy();
    if (expenseChartRef.current) expenseChartRef.current.destroy();

    const ctx1 = document.getElementById("schoolChart").getContext("2d");
    schoolChartRef.current = new Chart(ctx1, {
      type: "doughnut",
      data: {
        labels: ["Collected Fees", "Remaining Fees"],
        datasets: [
          {
            data: [data.collected_fees, data.total_fees - data.collected_fees],
            backgroundColor: ["#4CAF50", "#FF5252"],
          },
        ],
      },
    });

    const ctx2 = document.getElementById("expenseChart").getContext("2d");
    expenseChartRef.current = new Chart(ctx2, {
      type: "bar",
      data: {
        labels: ["Expenses", "In-Kind Payments", "Net Profit"],
        datasets: [
          {
            label: "Financial Overview",
            data: [data.total_expenses, data.inkind_payments, data.net_profit],
            backgroundColor: ["#FF9800", "#3F51B5", "#8BC34A"],
          },
        ],
      },
    });
  };

  if (!stats) return <p>Loading stats...</p>;

  return (
    <div className="stats-container">
      <h2>School Statistics - {term ? term.name : "Loading Term..."}</h2>

      <div className="stats-overview">
        <div>
          <h3>Total Revenue: Ksh {stats.total_revenue}</h3>
          <h3>Total Expenses: Ksh {stats.total_expenses}</h3>
        </div>
        <div>
          <h3>Total Fees Collected: Ksh {stats.collected_fees}</h3>
          <h3>Collection Percentage: {stats.percentage_collected}%</h3>
        </div>
        <div>
          <h3>In-Kind Payments: Ksh {stats.inkind_payments}</h3>
          <h3>Net Profit: Ksh {stats.net_profit}</h3>
        </div>
      </div>

      <div className="chart-section">
        <canvas id="schoolChart"></canvas>
        <h3>Financial Overview</h3>
        <canvas id="expenseChart"></canvas>
      </div>

      <div className="toggle-buttons">
        <button onClick={() => fetchStats("term")}>Termly</button>
        <button onClick={() => fetchStats("monthly")}>Monthly</button>
        <button onClick={() => fetchStats("yearly")}>Yearly</button>
      </div>
    </div>
  );
};

export default StatsComponent;