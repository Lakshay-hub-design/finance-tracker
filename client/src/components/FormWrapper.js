// src/components/FormWrapper.js
import React from "react";

const FormWrapper = ({ title, children }) => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>{title}</h2>
        {children}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 0 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px", // ✅ restrict width here
  },
  title: {
    textAlign: "center",
    color: "rgb(224, 83, 31)",
    marginBottom: "20px",
  },
};

export default FormWrapper;
