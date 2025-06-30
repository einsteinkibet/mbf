import React, { useEffect, useState } from "react";
import axios from "axios";

const ExpensesList = ({ activeTerm }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTerm) {
      setLoading(true);
      axios.get(`/expenses?term_id=${activeTerm.id}`)
        .then(response => setExpenses(response.data))
        .catch(error => console.error("Error fetching expenses:", error))
        .finally(() => setLoading(false));
    }
  }, [activeTerm]);

  return (
    <div className="expenses-list">
      <h3>Expenses for {activeTerm ? activeTerm.name : "Current Term"}</h3>
      {loading ? <p>Loading expenses...</p> : (
        <ul>
          {expenses.length > 0 ? expenses.map(expense => (
            <li key={expense.id}>
              {expense.name} - KES {expense.amount.toFixed(2)}
            </li>
          )) : <p>No expenses found.</p>}
        </ul>
      )}
    </div>
  );
};

export default ExpensesList;