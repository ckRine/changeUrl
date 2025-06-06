import React from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { conditionalLog } from "../utils";

const ImportExport = ({ buttons, setButtons, saveToStorage }) => {
  const { t } = useTranslation();

  const handleExport = () => {
    const dataStr = JSON.stringify({ buttons, language: localStorage.getItem("language") || "fr" }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "config.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t("success.exportSuccess"));
    conditionalLog(t("logs.exportDone"), buttons);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.buttons && Array.isArray(data.buttons)) {
          // Convertir les anciennes clés (key) en pattern et ajouter useRegex
          const cleanedButtons = data.buttons.map((btn) => {
            const { url, ...rest } = btn;
            const replacements = rest.replacements?.map(({ key, pattern, useRegex, ...r }) => ({
              pattern: key || pattern || "",
              value: r.value || "",
              useRegex: useRegex !== undefined ? useRegex : !!key, // Par défaut, key implique regex
            }));
            return { ...rest, replacements };
          });
          setButtons(cleanedButtons);
          if (data.language) {
            localStorage.setItem("language", data.language);
            window.i18n.changeLanguage(data.language);
          }
          saveToStorage(cleanedButtons);
          toast.success(t("success.importSuccess"));
          conditionalLog(t("logs.importDone"), cleanedButtons);
        } else {
          toast.error(t("errors.invalidJson"));
        }
      } catch (error) {
        toast.error(t("errors.importError"));
        conditionalLog(t("errors.importError"), error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="import-export">
      <button
        className="btn action-export"
        onClick={handleExport}
        title={t("importExport.exportTitle")}
      >
        {t("importExport.export")}
      </button>
      <label className="btn action-import" title={t("importExport.importTitle")}>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
        />
        {t("importExport.import")}
      </label>
    </div>
  );
};

export default ImportExport;