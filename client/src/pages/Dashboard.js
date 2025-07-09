import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./../index.css"; // Ensure this is imported

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "income",
    category: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchTransactions();
    }
  }, [token]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (error) {
      alert("Error fetching transactions");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/transactions", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ title: "", amount: "", type: "income", category: "" });
      fetchTransactions();
    } catch (error) {
      alert("Error adding transaction");
    }
  };

  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const expense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const balance = income - expense;

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <h2 style={{ color: "rgb(224, 83, 31)" }}>💰 Dashboard</h2>

      <div className="card">
        <h3>Balance: ₹{balance}</h3>
        <p>Income: ₹{income} | Expense: ₹{expense}</p>
      </div>

      <div className="card">
        <h4>Add Transaction</h4>
        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <input
            name="amount"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
          />
          <button type="submit">Add</button>
        </form>
      </div>

      <div className="card">
        <h4>Your Transactions</h4>
        {transactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          <ul style={{ paddingLeft: 20 }}>
            {transactions.map((tx) => (
              <li key={tx._id}>
                <strong>{tx.title}</strong> - ₹{tx.amount} ({tx.type}) [{tx.category}]
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
