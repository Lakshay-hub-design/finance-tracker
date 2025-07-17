// src/pages/Login.js
import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import '../index.css'
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import FormWrapper from "../components/FormWrapper";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { setUser, darkMode } = useContext(ThemeContext);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#121212" : "#fff";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [darkMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, form);
      const { token, name, email } = res.data;
      login(token, { name, email });
      localStorage.setItem("userName", name);
      localStorage.setItem("email", email);
      setUser(email);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
    backgroundColor: darkMode ? "#1e1e1e" : "#fff",
    color: darkMode ? "#f5f5f5" : "#000",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: "rgb(224, 83, 31)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  };

  const linkStyle = {
    color: "rgb(224, 83, 31)",
    textDecoration: "none",
    fontWeight: "bold",
  };

  return (
    <FormWrapper title="Login">
      <ToastContainer position="top-right" autoClose={3000} />
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <button type="submit" style={buttonStyle}>
          Login
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Don’t have an account?{" "}
        <Link to="/register" style={linkStyle}>
          Register
        </Link>
      </p>
    </FormWrapper>
  );
}

export default Login;
