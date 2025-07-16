import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./../index.css";
import InsightsChart from "../components/InsightsChart";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

function Dashboard() {
  // ========== STATE MANAGEMENT ==========
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { clearUserTheme } = useContext(ThemeContext);
  
  const userName = localStorage.getItem("userName");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", type: "income" });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [budget, setBudget] = useState(() => localStorage.getItem("budget") || "");

  // ========== CALCULATED VALUES ==========
  const income = transactions
    .filter(tx => tx.type === "income")
    .reduce((acc, tx) => acc + Number(tx.amount), 0);
  
  const expense = transactions
    .filter(tx => tx.type === "expense")
    .reduce((acc, tx) => acc + Number(tx.amount), 0);
  
  const balance = income - expense;
  const currentMonth = new Date().getMonth();
  
  const monthlyExpense = transactions
    .filter(tx => tx.type === "expense" && new Date(tx.createdAt).getMonth() === currentMonth)
    .reduce((acc, tx) => acc + Number(tx.amount), 0);
  
  const filteredTxs = filter === "all" ? transactions : transactions.filter((tx) => tx.type === filter);
  const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;
  
  const largestExpense = transactions
    .filter(tx => tx.type === "expense")
    .reduce((acc, tx) => (tx.amount > acc.amount ? tx : acc), { amount: 0, title: 'None' });

  // ========== EFFECT HOOKS ==========
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchTransactions();
    }
  }, [token]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // ========== API FUNCTIONS ==========
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

  // ========== EVENT HANDLERS ==========
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value;
    setBudget(value);
    localStorage.setItem("budget", value);
  };

  const handleEdit = (tx) => {
    setForm({ title: tx.title, amount: tx.amount, type: tx.type });
    setEditingId(tx._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("email");
    clearUserTheme();
    document.body.classList.remove("dark-mode");
    navigate("/login");
  };

  // ========== RENDER COMPONENT ==========
  return (
    <div style={{
      backgroundColor: darkMode ? "#121212" : "#fff",
      color: darkMode ? "#f5f5f5" : "#000",
      minHeight: "100vh",
      padding: "20px",
    }}>
      {/* HEADER */}
      <h2 style={{ color: "rgb(224, 83, 31)", marginBottom: "10px" }}>
        👋 Welcome, {userName}
      </h2>

      {/* MAIN CONTENT GRID */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", 
        gap: "20px",
        alignItems: "flex-start"
      }}>
        
        {/* LEFT COLUMN */}
        <div>
          {/* BUDGET & STATS CARD */}
          <BudgetStatsCard 
            darkMode={darkMode}
            budget={budget}
            monthlyExpense={monthlyExpense}
            balance={balance}
            income={income}
            expense={expense}
            toggleDarkMode={toggleDarkMode}
            handleLogout={handleLogout}
            handleBudgetChange={handleBudgetChange}
          />

          {/* TRANSACTION FORM */}
          <TransactionForm 
            darkMode={darkMode}
            editingId={editingId}
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />

          {/* TRANSACTIONS LIST */}
          <TransactionsList 
            darkMode={darkMode}
            filter={filter}
            setFilter={setFilter}
            filteredTxs={filteredTxs}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* INCOME VS EXPENSE CHART */}
          <InsightsChartCard darkMode={darkMode} income={income} expense={expense} />

          {/* FINANCIAL SUMMARY */}
          <FinancialSummaryCard 
            darkMode={darkMode}
            savingsRate={savingsRate}
            largestExpense={largestExpense}
            transactions={transactions}
            budget={budget}
            monthlyExpense={monthlyExpense}
          />

          {/* MONTHLY EXPENSE SUMMARY */}
          <MonthlyExpenseCard 
            darkMode={darkMode}
            monthlyExpense={monthlyExpense}
            budget={budget}
          />
        </div>
      </div>
    </div>
  );
}

// ========== COMPONENT SUBPARTS ==========

const BudgetStatsCard = ({ 
  darkMode, budget, monthlyExpense, balance, income, expense, 
  toggleDarkMode, handleLogout, handleBudgetChange 
}) => (
  <div style={{ ...styles.card, backgroundColor: darkMode ? "#1e1e1e" : "#fdfdfd" }}>
    {budget && monthlyExpense > Number(budget) && (
      <BudgetWarning budget={budget} monthlyExpense={monthlyExpense} darkMode={darkMode} />
    )}
    <div style={styles.headerRow}>
      <h3>Balance: ₹{balance}</h3>
      <div style={styles.actionBtns}>
        <button onClick={toggleDarkMode} style={styles.iconBtn}>
          {darkMode ? "☀️" : "🌙"}
        </button>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </div>
    <p>Income: ₹{income} | Expense: ₹{expense}</p>
    <BudgetInput 
      budget={budget} 
      handleBudgetChange={handleBudgetChange} 
      darkMode={darkMode} 
    />
  </div>
);

const BudgetWarning = ({ budget, monthlyExpense, darkMode }) => (
  <div style={{ 
    marginTop: 15, 
    marginBottom: 15, 
    backgroundColor: darkMode ? "#330000" : "#ffe6e6", 
    padding: 10, 
    border: "1px solid red", 
    borderRadius: 6, 
    color: "red", 
    fontWeight: "bold" 
  }}>
    ⚠️ You've exceeded your budget of ₹{budget} this month! <br /> Current expense: ₹{monthlyExpense}
  </div>
);

const BudgetInput = ({ budget, handleBudgetChange, darkMode }) => (
  <div style={{ marginTop: 10, display: "flex", alignItems: "center" }}>
    <label style={{ marginRight: 10 }}><strong>Set Monthly Budget:</strong></label>
    <input
      type="number"
      placeholder="e.g. 10000"
      value={budget}
      onChange={handleBudgetChange}
      style={{
        width: 150,
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid #ccc",
        backgroundColor: darkMode ? "#1e1e1e" : "#fff",
        color: darkMode ? "#f5f5f5" : "#000",
      }}
    />
  </div>
);

const TransactionForm = ({ darkMode, editingId, form, handleChange, handleSubmit }) => (
  <div style={{ ...styles.card, backgroundColor: darkMode ? "#1e1e1e" : "#fdfdfd" }}>
    <h4>{editingId ? "Update Transaction" : "Add Transaction"}</h4>
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
        style={getInputStyle(darkMode)}
      />
      <input
        name="amount"
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        required
        style={getInputStyle(darkMode)}
      />
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        style={getInputStyle(darkMode)}
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <button type="submit" style={styles.addBtn}>
        {editingId ? "Update" : "Add"}
      </button>
    </form>
  </div>
);

const TransactionsList = ({ darkMode, filter, setFilter, filteredTxs, handleEdit, handleDelete }) => (
  <div style={{ ...styles.card, backgroundColor: darkMode ? "#1e1e1e" : "#fdfdfd" }}>
    <h4>Your Transactions</h4>
    <FilterTabs filter={filter} setFilter={setFilter} darkMode={darkMode} />
    {filteredTxs.length === 0 ? (
      <p>No transactions found</p>
    ) : (
      <ul style={styles.list}>
        {filteredTxs.map((tx) => (
          <TransactionItem 
            key={tx._id}
            tx={tx}
            darkMode={darkMode}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        ))}
      </ul>
    )}
  </div>
);

const FilterTabs = ({ filter, setFilter, darkMode }) => (
  <div style={styles.filterTabs}>
    {["all", "income", "expense"].map((type) => (
      <button
        key={type}
        onClick={() => setFilter(type)}
        style={{
          ...styles.filterBtn,
          backgroundColor: filter === type ? "rgb(224, 83, 31)" : darkMode ? "#333" : "#e0e0e0",
          color: filter === type ? "#fff" : darkMode ? "#f5f5f5" : "#333",
        }}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </button>
    ))}
  </div>
);

const TransactionItem = ({ tx, darkMode, handleEdit, handleDelete }) => (
  <li
    style={{
      ...styles.transaction,
      backgroundColor: tx.type === "income" 
        ? (darkMode ? "#1a2e22" : "#e6f4ea") 
        : (darkMode ? "#2e1a1a" : "#ffe6e6"),
      borderLeft: `5px solid ${tx.type === "income" ? "green" : "red"}`,
    }}
  >
    <div>
      <strong>{tx.title}</strong> — ₹{tx.amount}<br />
      <small>{new Date(tx.createdAt).toLocaleDateString()}</small>
    </div>
    <div style={styles.btnGroup}>
      <button onClick={() => handleEdit(tx)} style={styles.editBtn}>
        ✏️
      </button>
      <button onClick={() => handleDelete(tx._id)} style={styles.delBtn}>
        ❌
      </button>
    </div>
  </li>
);

const InsightsChartCard = ({ darkMode, income, expense }) => (
  <div style={{ ...styles.card, backgroundColor: darkMode ? "#1e1e1e" : "#fdfdfd" }}>
    <h4>Income vs Expense</h4>
    <InsightsChart income={income} expense={expense} />
  </div>
);

const FinancialSummaryCard = ({ 
  darkMode, savingsRate, largestExpense, transactions, budget, monthlyExpense 
}) => (
  <div style={{ ...styles.card, backgroundColor: darkMode ? "#1e1e1e" : "#fdfdfd" }}>
    <h4>Financial Summary</h4>
    <div style={{ 
      display: "grid", 
      gap: "12px",
      gridTemplateColumns: "1fr 1fr" 
    }}>
      <SummaryItem 
        label="Savings Rate" 
        value={`${savingsRate}%`} 
        darkMode={darkMode} 
        large 
      />
      <SummaryItem 
        label="Largest Expense" 
        value={`${largestExpense.title}: ₹${largestExpense.amount}`} 
        darkMode={darkMode} 
      />
      <SummaryItem 
        label="Total Transactions" 
        value={transactions.length} 
        darkMode={darkMode} 
        large 
      />
      <SummaryItem 
        label="Budget Status" 
        value={budget ? `₹${monthlyExpense}/${budget}` : "Not set"} 
        darkMode={darkMode} 
        color={budget && monthlyExpense > Number(budget) ? "red" : "green"}
      />
    </div>
  </div>
);

const SummaryItem = ({ label, value, darkMode, large, color }) => (
  <div>
    <div style={{ fontSize: "0.9rem", color: darkMode ? "#aaa" : "#666" }}>{label}</div>
    <div style={{ 
      fontSize: large ? "1.5rem" : "1.1rem", 
      fontWeight: large ? "bold" : "normal",
      color: color || "inherit"
    }}>
      {value}
    </div>
  </div>
);

const MonthlyExpenseCard = ({ darkMode, monthlyExpense, budget }) => (
  <div style={{ ...styles.card, backgroundColor: darkMode ? "#1e1e1e" : "#fdfdfd" }}>
    <h4>Monthly Expense Summary</h4>
    <div style={{ marginTop: "15px" }}>
      <div style={styles.summaryRow}>
        <span>Current Month:</span>
        <strong>{new Date().toLocaleString('default', { month: 'long' })}</strong>
      </div>
      
      <div style={styles.summaryRow}>
        <span>Total Expenses:</span>
        <span style={{ color: "rgb(224, 83, 31)", fontWeight: "bold" }}>
          ₹{monthlyExpense}
        </span>
      </div>
      
      {budget ? (
        <BudgetProgress 
          monthlyExpense={monthlyExpense} 
          budget={budget} 
          darkMode={darkMode} 
        />
      ) : (
        <NoBudgetPrompt darkMode={darkMode} />
      )}
    </div>
  </div>
);

const BudgetProgress = ({ monthlyExpense, budget, darkMode }) => (
  <>
    <div style={styles.summaryRow}>
      <span>Budget:</span>
      <span>₹{budget}</span>
    </div>
    
    <div style={{ 
      height: "8px",
      backgroundColor: darkMode ? "#333" : "#eee",
      borderRadius: "4px",
      margin: "10px 0",
      overflow: "hidden"
    }}>
      <div style={{ 
        width: `${Math.min(100, (monthlyExpense / budget) * 100)}%`,
        height: "100%",
        backgroundColor: monthlyExpense > budget ? "#ff4d4f" : "#52c41a"
      }} />
    </div>
    
    <div style={styles.summaryRow}>
      <span>Remaining:</span>
      <span style={{ 
        color: monthlyExpense > budget ? "#ff4d4f" : "#52c41a",
        fontWeight: "bold"
      }}>
        ₹{Math.max(0, budget - monthlyExpense)}
      </span>
    </div>
  </>
);

const NoBudgetPrompt = ({ darkMode }) => (
  <div style={{ 
    padding: "10px",
    backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
    borderRadius: "6px",
    textAlign: "center",
    marginTop: "10px"
  }}>
    <p>No budget set for this month</p>
    <button 
      onClick={() => document.getElementById('budget-input')?.focus()}
      style={styles.budgetBtn}
    >
      Set Budget
    </button>
  </div>
);

// ========== STYLES & UTILITIES ==========
const getInputStyle = (darkMode) => ({
  backgroundColor: darkMode ? "#1e1e1e" : "#fff", 
  color: darkMode ? "#f5f5f5" : "#000",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #ccc"
});

const styles = {
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
  actionBtns: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  iconBtn: {
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    padding: "6px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px"
  },
  budgetBtn: {
    padding: "5px 10px",
    backgroundColor: "rgb(224, 83, 31)",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }
};

export default Dashboard;