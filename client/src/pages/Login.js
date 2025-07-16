// src/pages/Login.js
import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import FormWrapper from "../components/FormWrapper";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { setUser } = useContext(ThemeContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/users/login", form);
const { token, name, email } = res.data;
login(token, { name, email });
localStorage.setItem("userName", name);
localStorage.setItem("email", email);
setUser(email);
navigate("/dashboard");                           

    navigate("/dashboard");
  } catch (error) {
    alert(error.response?.data?.message || "Login failed");
  }
};

  return (
    <FormWrapper title="Login">
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


export default Login;
