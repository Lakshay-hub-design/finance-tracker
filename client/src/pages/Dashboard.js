import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./../index.css";
import InsightsChart from "../components/InsightsChart";
import { AuthContext } from "../context/AuthContext";



function Dashboard() {
  const { user } = useContext(AuthContext);
  const userName = localStorage.getItem("userName");

  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "income",
  });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const [budget, setBudget] = useState(() => {
  return localStorage.getItem("budget") || "";
  });

  const handleBudgetChange = (e) => {
  const value = e.target.value;
  setBudget(value);
  localStorage.setItem("budget", value);
};


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
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/transactions/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingId(null);
      } else {
        await axios.post("http://localhost:5000/api/transactions", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ title: "", amount: "", type: "income" });
      fetchTransactions();
    } catch (error) {
      alert("Error submitting transaction");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions();
    } catch (error) {
      alert("Error deleting transaction");
    }
  };

  const handleEdit = (tx) => {
    setForm({
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
    });
    setEditingId(tx._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((acc, tx) => acc + Number(tx.amount), 0);

  const expense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => acc + Number(tx.amount), 0);

  const balance = income - expense;

  const currentMonth = new Date().getMonth();
  const monthlyExpense = transactions
    .filter(tx => tx.type === "expense" && new Date(tx.createdAt).getMonth() === currentMonth)
    .reduce((acc, tx) => acc + Number(tx.amount), 0);

  const filteredTxs =
    filter === "all"
      ? transactions
      : transactions.filter((tx) => tx.type === filter);

  return (
    <div style={styles.container}>
    
      <h2 style={{ color: "rgb(224, 83, 31)", marginBottom: "10px" }}>
        👋 Welcome, {userName}
      </h2>
      <div style={styles.card}>
        {budget && monthlyExpense > Number(budget) && (
        <div
          style={{
            marginTop: "15px",
            marginBottom: "15px",
            backgroundColor: "#ffe6e6",
            padding: "10px",
            border: "1px solid red",
            borderRadius: "6px",
            color: "red",
            fontWeight: "bold",
          }}
        >
          ⚠️ You’ve exceeded your budget of ₹{budget} this month! <br />
          Current expense: ₹{monthlyExpense}
        </div>
      )}
        <div style={styles.headerRow}>
          <h3>Balance: ₹{balance}</h3>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
        <p>
          Income: ₹{income} | Expense: ₹{expense}
        </p>
        <div style={{ marginTop: "10px", display: "flex", }}>
          <label>
            <strong>Set Monthly Budget:</strong>
          </label>
          <input
            type="number"
            placeholder="e.g. 10000"
            value={budget}
            onChange={handleBudgetChange}
            style={{
              marginLeft: "10px",
              width: "150px",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      </div>

      <div style={styles.card}>
        <h4>{editingId ? "Update Transaction" : "Add Transaction"}</h4>
        <form onSubmit={handleSubmit} style={styles.form}>
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
          <button type="submit" style={styles.addBtn}>
            {editingId ? "Update" : "Add"}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <InsightsChart income={income} expense={expense} />
      </div>

      <div style={styles.card}>
        <h4>Your Transactions</h4>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {["all", "income", "expense"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                ...styles.filterBtn,
                backgroundColor:
                  filter === type ? "rgb(224, 83, 31)" : "#e0e0e0",
                color: filter === type ? "#fff" : "#333",
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {filteredTxs.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          <ul style={styles.list}>
            {filteredTxs.map((tx) => (
              <li
                key={tx._id}
                style={{
                  ...styles.transaction,
                  backgroundColor: tx.type === "income" ? "#e6f4ea" : "#ffe6e6",
                  borderLeft: `5px solid ${
                    tx.type === "income" ? "green" : "red"
                  }`,
                }}
              >
                <div>
                  <strong>{tx.title}</strong> — ₹{tx.amount}
                  <br />
                  <small>{tx.type}</small>
                </div>
                <div style={styles.btnGroup}>
                  <button onClick={() => handleEdit(tx)} style={styles.editBtn}>
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(tx._id)}
                    style={styles.delBtn}
                  >
                    ❌
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    margin: "auto",
    maxWidth: "700px",
    position: "relative",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  logoutBtn: {
    backgroundColor: "rgb(224, 83, 31)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  card: {
    background: "#fdfdfd",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 8px rgba(0,0,0,0.05)",
  },
  form: {
    display: "grid",
    gap: "10px",
  },
  addBtn: {
    backgroundColor: "rgb(224, 83, 31)",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    paddingLeft: 0,
    marginTop: "10px",
  },
  transaction: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  btnGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  editBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#333",
  },
  delBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "rgb(224, 83, 31)",
  },
  filterTabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  filterBtn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Dashboard;
