// src/pages/Register.js
import React, { useState, useContext } from "react";
import axios from "axios";
import '../index.css'
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import FormWrapper from "../components/FormWrapper";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const nameRegex = /^[A-Za-z ]{3,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  if (!nameRegex.test(form.name)) {
    toast.error("Name should only contain letters and spaces");
    return;
  }

  if (!emailRegex.test(form.email)) {
    toast.error("Please enter a valid email address");
    return;
  }

  if (!passwordRegex.test(form.password)) {
    toast.error("Password must be at least 6 characters and include uppercase, lowercase, number, and special character");
    return;
  }

  try {
    const res = await axios.post("http://localhost:5000/api/users/register", form);
    login(res.data.token);
    localStorage.setItem("userName", form.name);
    toast.success("Registration successful!", { autoClose: 2000 });
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  } catch (error) {
    toast.error(error.response?.data?.message || "Registration failed");
  }
};


  return (
    <FormWrapper title="Register">
      <ToastContainer position="top-right" autoClose={3000} />
      <form autoComplete="off" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          style={inputStyle}
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
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
          Register
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Already have an account?{" "}
        <Link to="/login" style={linkStyle}>
          Login
        </Link>
      </p>
    </FormWrapper>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "15px",
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

export default Register;
