import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zhCN from "./locales/zh-CN.json";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";

const savedLang = localStorage.getItem("i18nextLng");
const detectedLng = savedLang || (typeof navigator !== "undefined" && navigator.language.startsWith("zh") ? "zh-CN" : "en");

i18n.use(initReactI18next).init({
  lng: detectedLng,
  resources: {
    "zh-CN": zhCN,
    en,
    ja,
    ko,
    fr,
    de,
  },
  fallbackLng: "zh-CN",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
