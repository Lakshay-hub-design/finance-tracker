import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InsightsChart from "../components/InsightsChart";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Dashboard.css"

function Dashboard() {
  // State and context
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { clearUserTheme } = useContext(ThemeContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const userName = localStorage.getItem("userName");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Component state
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", type: "income" });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [budget, setBudget] = useState(() => localStorage.getItem("budget") || "");

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth and theme effects
  useEffect(() => {
    if (!token) navigate("/login");
    else fetchTransactions();
  }, [token]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // API functions
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
        toast.success("Transaction updated!");
        setEditingId(null);
      } else {
        await axios.post("http://localhost:5000/api/transactions", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Transaction added!");
      }
      setForm({ title: "", amount: "", type: "income" });
      fetchTransactions();
    } catch (error) {
      toast.error("Error submitting transaction");
    }
  };

  // Event handlers
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBudgetChange = (e) => {
    const value = e.target.value;
    setBudget(value);
    localStorage.setItem("budget", value);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Transaction deleted");
      fetchTransactions();
    } catch (error) {
      toast.error("Error deleting transaction");
    }
  };

  const handleEdit = (tx) => {
    setForm({ title: tx.title, amount: tx.amount, type: tx.type });
    setEditingId(tx._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    toast.info("Logged out");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("email");
    clearUserTheme();
    document.body.classList.remove("dark-mode");
    navigate("/login");
  };

  // Calculated values
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

  return (
    <div className={`dashboard-container ${darkMode ? "dark-mode" : ""}`}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={darkMode ? "dark" : "light"} 
      />
      <h2 className="dashboard-header">👋 Welcome, {userName}</h2>

      <div className="dashboard-content">
        {/* Left Column */}
        <div className="dashboard-column dashboard-column-left">
          {/* Budget & Stats Card */}
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
            windowWidth={windowWidth}
          />

          {/* Transaction Form */}
          <TransactionForm
            darkMode={darkMode}
            editingId={editingId}
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            windowWidth={windowWidth}
          />

          {/* Transactions List */}
          <TransactionsList
            darkMode={darkMode}
            filter={filter}
            setFilter={setFilter}
            filteredTxs={filteredTxs}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            windowWidth={windowWidth}
          />
        </div>

        {/* Right Column */}
        <div className="dashboard-column dashboard-column-right">
          {/* Insights Chart */}
          <InsightsChartCard
            darkMode={darkMode}
            income={income}
            expense={expense}
          />

          {/* Financial Summary */}
          <FinancialSummaryCard
            darkMode={darkMode}
            savingsRate={savingsRate}
            largestExpense={largestExpense}
            transactions={transactions}
            budget={budget}
            monthlyExpense={monthlyExpense}
            windowWidth={windowWidth}
          />

          {/* Monthly Expense Summary */}
          <MonthlyExpenseCard
            darkMode={darkMode}
            monthlyExpense={monthlyExpense}
            budget={budget}
            windowWidth={windowWidth}
          />
        </div>
      </div>
    </div>
  );
}

// Sub-components
const BudgetStatsCard = ({ 
  darkMode, budget, monthlyExpense, balance, income, expense, 
  toggleDarkMode, handleLogout, handleBudgetChange, windowWidth 
}) => (
  <div className={`dashboard-card ${darkMode ? 'dark-mode' : ''}`}>
    {budget && monthlyExpense > Number(budget) && (
      <div className="budget-warning">
        ⚠️ You've exceeded your budget of ₹{budget} this month! <br /> Current expense: ₹{monthlyExpense}
      </div>
    )}
    <div className="card-header-row">
      <h3>Balance: ₹{balance}</h3>
      <div className="action-buttons">
        <button onClick={toggleDarkMode} className="theme-toggle-btn">
          {darkMode ? "☀️" : "🌙"}
        </button>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
    <p>Income: ₹{income} | Expense: ₹{expense}</p>
    <BudgetInput 
      budget={budget} 
      handleBudgetChange={handleBudgetChange} 
      darkMode={darkMode}
      windowWidth={windowWidth}
    />
  </div>
);

const BudgetInput = ({ budget, handleBudgetChange, darkMode, windowWidth }) => (
  <div className={`budget-input-container ${windowWidth <= 480 ? 'mobile' : ''}`}>
    <label><strong>Set Monthly Budget:</strong></label>
    <input
      type="number"
      placeholder="e.g. 10000"
      value={budget}
      onChange={handleBudgetChange}
      className="budget-input"
    />
  </div>
);

const TransactionForm = ({ darkMode, editingId, form, handleChange, handleSubmit, windowWidth }) => (
  <div className={`dashboard-card ${darkMode ? 'dark-mode' : ''}`}>
    <h4>{editingId ? "Update Transaction" : "Add Transaction"}</h4>
    <form onSubmit={handleSubmit} className={`transaction-form ${windowWidth <= 480 ? 'mobile' : ''}`}>
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
        className="form-input"
      />
      <input
        name="amount"
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        required
        className="form-input"
      />
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="form-input"
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <button type="submit" className="submit-btn">
        {editingId ? "Update" : "Add"}
      </button>
    </form>
  </div>
);

const TransactionsList = ({ darkMode, filter, setFilter, filteredTxs, handleEdit, handleDelete, windowWidth }) => (
  <div className={`dashboard-card ${darkMode ? 'dark-mode' : ''}`}>
    <h4>Your Transactions</h4>
    <FilterTabs filter={filter} setFilter={setFilter} darkMode={darkMode} windowWidth={windowWidth} />
    {filteredTxs.length === 0 ? (
      <p className="no-transactions">No transactions found</p>
    ) : (
      <ul className="transaction-list">
        {filteredTxs.map((tx) => (
          <TransactionItem 
            key={tx._id}
            tx={tx}
            darkMode={darkMode}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            windowWidth={windowWidth}
          />
        ))}
      </ul>
    )}
  </div>
);

const FilterTabs = ({ filter, setFilter, darkMode, windowWidth }) => (
  <div className={`filter-tabs ${windowWidth <= 480 ? 'mobile' : ''}`}>
    {["all", "income", "expense"].map((type) => (
      <button
        key={type}
        onClick={() => setFilter(type)}
        className={`filter-btn ${filter === type ? 'active' : ''} ${darkMode ? 'dark' : ''}`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </button>
    ))}
  </div>
);

const TransactionItem = ({ tx, darkMode, handleEdit, handleDelete, windowWidth }) => (
  <li
    className={`transaction-item ${tx.type} ${windowWidth <= 480 ? 'mobile' : ''} ${darkMode ? 'dark-mode' : ''}`}
  >
    <div className="transaction-info">
      <strong>{tx.title}</strong> — ₹{tx.amount}<br />
      <small>{new Date(tx.createdAt).toLocaleDateString()}</small>
    </div>
    <div className="btn-group">
      <button onClick={() => handleEdit(tx)} className="edit-btn">
        ✏️
      </button>
      <button onClick={() => handleDelete(tx._id)} className="del-btn">
        ❌
      </button>
    </div>
  </li>
);

const InsightsChartCard = ({ darkMode, income, expense }) => (
  <div className={`dashboard-card ${darkMode ? 'dark-mode' : ''}`}>
    <h4>Income vs Expense</h4>
    <InsightsChart income={income} expense={expense} />
  </div>
);

const FinancialSummaryCard = ({ 
  darkMode, savingsRate, largestExpense, transactions, budget, monthlyExpense, windowWidth 
}) => (
  <div className={`dashboard-card ${darkMode ? 'dark-mode' : ''}`}>
    <h4>Financial Summary</h4>
    <div className={`financial-summary-grid ${windowWidth <= 480 ? 'mobile' : ''}`}>
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
  <div className="summary-item">
    <div className="summary-item-label">{label}</div>
    <div 
      className={`summary-item-value ${large ? 'large' : ''}`}
      style={{ color: color || 'inherit' }}
    >
      {value}
    </div>
  </div>
);

const MonthlyExpenseCard = ({ darkMode, monthlyExpense, budget, windowWidth }) => (
  <div className={`dashboard-card ${darkMode ? 'dark-mode' : ''}`}>
    <h4>Monthly Expense Summary</h4>
    <div className="monthly-expense-content">
      <div className="monthly-expense-row">
        <span>Current Month:</span>
        <strong>{new Date().toLocaleString('default', { month: 'long' })}</strong>
      </div>
      
      <div className="monthly-expense-row">
        <span>Total Expenses:</span>
        <span className="expense-amount">₹{monthlyExpense}</span>
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
    <div className="monthly-expense-row">
      <span>Budget:</span>
      <span>₹{budget}</span>
    </div>
    
    <div className="budget-progress">
      <div 
        className="budget-progress-bar"
        style={{ 
          width: `${Math.min(100, (monthlyExpense / budget) * 100)}%`,
          backgroundColor: monthlyExpense > budget ? "#ff4d4f" : "#52c41a"
        }} 
      />
    </div>
    
    <div className="monthly-expense-row">
      <span>Remaining:</span>
      <span className="remaining-amount" style={{ 
        color: monthlyExpense > budget ? "#ff4d4f" : "#52c41a"
      }}>
        ₹{Math.max(0, budget - monthlyExpense)}
      </span>
    </div>
  </>
);

const NoBudgetPrompt = ({ darkMode }) => (
  <div className="no-budget-prompt">
    <p>No budget set for this month</p>
    <button 
      onClick={() => document.getElementById('budget-input')?.focus()}
      className="set-budget-btn"
    >
      Set Budget
    </button>
  </div>
);

export default Dashboard;