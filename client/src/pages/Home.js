import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.contentBox}>
        <h1 style={styles.heading}>📒 Personal Finance Planner</h1>
        <p style={styles.subheading}>
          Plan your income, expenses, and savings — all in one place.
        </p>

        <ul style={styles.features}>
          <li>💰 Track daily expenses</li>
          <li>📈 Analyze your spending habits</li>
          <li>🎯 Set financial goals</li>
          <li>🔐 Secure login system</li>
        </ul>

        <div style={styles.buttons}>
          <Link to="/login">
            <button style={styles.loginBtn}>Login</button>
          </Link>
          <Link to="/register">
            <button style={styles.registerBtn}>Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundImage: "url('/bg.jpg')", // You saved the uploaded image here
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  contentBox: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    color: "#fff",
    padding: "40px",
    borderRadius: "16px",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  heading: {
    fontSize: "32px",
    marginBottom: "16px",
    color: "rgb(255, 213, 0)", // bright yellow heading
  },
  subheading: {
    fontSize: "18px",
    marginBottom: "24px",
    color: "#eee",
  },
  features: {
    listStyle: "none",
    padding: 0,
    marginBottom: "30px",
    fontSize: "16px",
    textAlign: "left",
    lineHeight: "1.8",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  loginBtn: {
    backgroundColor: "rgb(224, 83, 31)",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  registerBtn: {
    backgroundColor: "#333",
    color: "#fff",
    border: "none",
    padding: "10px 24px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Home;
