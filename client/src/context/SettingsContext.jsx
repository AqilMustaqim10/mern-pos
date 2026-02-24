import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchSettings } from "../api/settingsAPI";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // Store the settings object
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load settings when app starts
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetchSettings();
      setSettings(res.data.settings);
    } catch (error) {
      // Use defaults if settings can't be loaded
      console.error("Could not load settings");
    } finally {
      setLoading(false);
    }
  };

  // Called after admin saves new settings
  const refreshSettings = () => {
    loadSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook
export const useSettings = () => useContext(SettingsContext);
