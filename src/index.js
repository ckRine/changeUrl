import { createRoot } from "react-dom/client";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en/translation.json";
import frTranslation from "./locales/fr/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    fr: { translation: frTranslation },
  },
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const root = createRoot(document.getElementById("root"));
root.render(<App />);