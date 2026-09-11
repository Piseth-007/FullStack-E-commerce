import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { translations } from "../i18n/translations";

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("app_language") || "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = useCallback((lang) => {
    const target = lang === "km" ? "km" : "en";
    setLanguageState(target);
    try {
      localStorage.setItem("app_language", target);
    } catch {
      // ignore localStorage quota or access errors
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "km" ? "en" : "km");
  }, [language, setLanguage]);

  useEffect(() => {
    const isKm = language === "km";
    document.documentElement.lang = isKm ? "km" : "en";
    document.documentElement.classList.toggle("font-khmer", isKm);
    if (document.body) {
      document.body.classList.toggle("font-khmer", isKm);
    }
  }, [language]);

  const t = useCallback(
    (key, fallback = "") => {
      const text = translations[language]?.[key] ?? translations.en?.[key];
      if (text !== undefined) return text;
      return fallback || key;
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      isKhmer: language === "km",
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

