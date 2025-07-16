import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

useEffect(() => {
  // Try to get saved email from localStorage
  const email = localStorage.getItem("email");
  if (email) {
    setUserEmail(email); // update state
    const encoded = btoa(email);
    const saved = localStorage.getItem(`darkMode-${encoded}`);
    const isDark = saved === "true";

    setDarkMode(isDark);
    document.body.classList.toggle("dark-mode", isDark);
  }
}, []);

  // Toggle theme and save to localStorage
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (userEmail) {
      const encoded = btoa(userEmail);
      localStorage.setItem(`darkMode-${encoded}`, JSON.stringify(newMode));
    }

    document.body.classList.toggle("dark-mode", newMode);
  };

  // Call this after login
  const setUser = (email) => {
    setUserEmail(email);

    // ⬇️ Load theme immediately if it exists
    const encoded = btoa(email);
    const saved = localStorage.getItem(`darkMode-${encoded}`);
    const isDark = saved === "true";

    setDarkMode(isDark);
    document.body.classList.toggle("dark-mode", isDark);
  };

  const clearUserTheme = () => {
    setUserEmail(null);
    setDarkMode(false);
    document.body.classList.remove("dark-mode");
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setUser, clearUserTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
