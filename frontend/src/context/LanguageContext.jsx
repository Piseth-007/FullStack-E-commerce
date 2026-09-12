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
    (key, fallbackOrParams = "", maybeParams = null) => {
      let fallback = "";
      let params = null;

      if (typeof fallbackOrParams === "object" && fallbackOrParams !== null) {
        params = fallbackOrParams;
      } else {
        fallback = typeof fallbackOrParams === "string" ? fallbackOrParams : "";
        if (typeof maybeParams === "object" && maybeParams !== null) {
          params = maybeParams;
        }
      }

      let text = translations[language]?.[key] ?? translations.en?.[key];
      if (text === undefined) {
        text = fallback || key;
      }

      if (params && typeof text === "string") {
        const mergedParams = { ...params };
        if (mergedParams.current !== undefined && mergedParams.page === undefined) {
          mergedParams.page = mergedParams.current;
        }
        if (mergedParams.page !== undefined && mergedParams.current === undefined) {
          mergedParams.current = mergedParams.page;
        }

        Object.entries(mergedParams).forEach(([paramKey, paramVal]) => {
          text = text.replaceAll(`{${paramKey}}`, String(paramVal ?? ""));
        });

        if (text.includes("{total}") && mergedParams.total === undefined) {
          text = text
            .replaceAll(" of {total}", "")
            .replaceAll(" នៃ {total}", "")
            .replaceAll("{total}", "");
        }
      }

      return text;
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

