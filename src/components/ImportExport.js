import React from "react";
import { toast } from "react-toastify";
import { conditionalLog } from "../utils";

const ImportExport = ({ buttons, setButtons, saveToStorage }) => {
  const handleExport = () => {
    const dataStr = JSON.stringify({ buttons }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "config.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Configuration exportée avec succès");
    conditionalLog("Exportation effectuée :", buttons);
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
          saveToStorage(cleanedButtons);
          toast.success("Configuration importée avec succès");
          conditionalLog("Importation effectuée :", cleanedButtons);
        } else {
          toast.error("Fichier JSON invalide");
        }
      } catch (error) {
        toast.error("Erreur lors de l'importation");
        conditionalLog("Erreur d'importation :", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="import-export">
      <button
        className="btn action-export"
        onClick={handleExport}
        title="Exporter la configuration JSON"
      >
        Exporter
      </button>
      <label className="btn action-import" title="Importer une configuration JSON">
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
        />
        Importer
      </label>
    </div>
  );
};

export default ImportExport;