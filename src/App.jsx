/**
 * Composant principal de l'application ChangeUrl.
 * Gère la liste des boutons, le formulaire, le guide utilisateur et les paramètres.
 * Main application component for ChangeUrl.
 * Manages button list, form, user guide, and settings.
 */
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import ButtonRow from "./components/ButtonRow";
import ButtonForm from "./components/ButtonForm";
import ImportExport from "./components/ImportExport";
import UserGuide from "./components/UserGuide";
import { conditionalLog } from "./utils";
import "./styles/index.css";

const App = () => {
  const { t, i18n } = useTranslation();
  const [buttons, setButtons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editButton, setEditButton] = useState(null);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(
    localStorage.getItem("debugLogging") === "true"
  );

  // Charge les boutons et la langue depuis le stockage local
  // Load buttons and language from localStorage
  useEffect(() => {
    const storedConfig = JSON.parse(localStorage.getItem("config")) || { buttons: [], language: "en" };
    setButtons(storedConfig.buttons);
    i18n.changeLanguage(storedConfig.language || "en");
  }, [i18n]);

  // Sauvegarde les boutons et la langue dans le stockage local
  // Save buttons and language to localStorage
  const saveToStorage = (updatedButtons) => {
    const config = { buttons: updatedButtons, language: i18n.language };
    localStorage.setItem("config", JSON.stringify(config));
  };

  // Gère l'exécution d'un bouton
  // Handle button execution
  const handleRun = (button) => {
    if (!button) {
      toast.error(t("errors.buttonUndefined"));
      conditionalLog(t("errors.buttonUndefined"), button);
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.url) {
        toast.error(t("errors.noTabUrl"));
        conditionalLog(t("errors.noTabUrl"), tabs);
        return;
      }
      try {
        let finalUrl = tabs[0].url;
        button.replacements?.forEach(({ pattern, value, useRegex }) => {
          try {
            if (pattern && value) {
              const regex = useRegex ? new RegExp(pattern, "g") : new RegExp(escapeRegExp(pattern), "g");
              finalUrl = finalUrl.replace(regex, value);
            }
          } catch (error) {
            if (useRegex) {
              toast.error(`${t("errors.regexError")}: ${pattern}`);
              conditionalLog("Regex error:", error, pattern);
              throw error; // Arrête le traitement si regex invalide
            }
          }
        });
        if (button.params?.length > 0) {
          const queryString = button.params
            .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join("&");
          finalUrl += finalUrl.includes("?") ? `&${queryString}` : `?${queryString}`;
        }
        if (!finalUrl || finalUrl.startsWith("chrome://") || finalUrl.startsWith("file://")) {
          toast.error(t("errors.invalidUrl"));
          conditionalLog("Invalid URL:", finalUrl);
          return;
        }
        conditionalLog(t("logs.runButton"), { button, finalUrl });
        if (button.actionType === "open-tab") {
          window.open(finalUrl, "_blank");
        } else {
          chrome.tabs.update(tabs[0].id, { url: finalUrl });
        }
      } catch (error) {
        toast:error(t("errors.runError"));
        conditionalLog(t("errors.runError"), error);
      }
    });
  };

  // Gère l'édition d'un bouton
  // Handle button edit
  const handleEdit = (button) => {
    setEditButton(button);
    setShowForm(true);
  };

  // Gère la suppression d'un bouton
  // Handle button delete
  const handleDelete = (id) => {
    const updatedButtons = buttons.filter((btn) => btn.id !== id);
    setButtons(updatedButtons);
    saveToStorage(updatedButtons);
    toast.success(t("success.buttonDeleted"));
    conditionalLog(t("logs.buttonDeleted"), id);
  };

  // Bascule la visibilité du formulaire
  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
    setEditButton(null);
  };

  // Bascule la visibilité du guide utilisateur
  // Toggle user guide visibility
  const toggleUserGuide = () => {
    setShowUserGuide(!showUserGuide);
  };

  // Gère la soumission du formulaire
  // Handle form submission
  const handleFormSubmit = (newButton) => {
    let updatedButtons;
    if (editButton) {
      updatedButtons = buttons.map((btn) =>
        btn.id === editButton.id ? { ...newButton, id: btn.id } : btn
      );
    } else {
      updatedButtons = [...buttons, { ...newButton, id: Date.now() }];
    }
    setButtons(updatedButtons);
    saveToStorage(updatedButtons);
    setShowForm(false);
    setEditButton(null);
    toast.success(editButton ? t("success.buttonUpdated") : t("success.buttonAdded"));
  };

  // Gère l'activation/désactivation des logs
  // Handle logging toggle
  const handleLoggingToggle = (e) => {
    const checked = e.target.checked;
    setIsLoggingEnabled(checked);
    localStorage.setItem("debugLogging", checked);
    conditionalLog(t("logs.conditionalLogs"), checked ? t("logs.enabled") : t("logs.disabled"));
  };

  // Gère le changement de langue
  // Handle language change
  const handleLanguageChange = (e) => {
    const language = e.target.value;
    i18n.changeLanguage(language);
    saveToStorage(buttons);
    conditionalLog(t("logs.languageChanged"), language);
  };

  return (
    <div className="app-container">
      <ToastContainer />
      <div className="header">
        <h1>{t("app.title")}</h1>
        <button className="btn action-help" onClick={toggleUserGuide}>
          {t("app.help")}
        </button>
      </div>
      <div className="button-list">
        <h2>{t("app.myButtons")}</h2>
        {buttons.length > 0 ? (
          buttons.map((button) => (
            <ButtonRow
              key={button.id}
              button={button}
              onRun={handleRun}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p>{t("app.noButtons")}</p>
        )}
      </div>
      <button className="btn action-toggle-form" onClick={toggleForm}>
        {showForm ? t("app.hideForm") : t("app.addButton")}
      </button>
      {showForm && (
        <ButtonForm
          button={editButton}
          onSubmit={handleFormSubmit}
          closeForm={toggleForm}
        />
      )}
      {showUserGuide && <UserGuide closeGuide={toggleUserGuide} />}
      <div className="settings-footer">
        <div className="settings-section">
          <h3>{t("app.settings")}</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isLoggingEnabled}
              onChange={handleLoggingToggle}
            />
            {t("app.enableLogging")}
          </label>
          <label className="select-label">
            {t("app.language")}
            <select value={i18n.language} onChange={handleLanguageChange}>
              <option value="en">{t("app.english")}</option>
              <option value="fr">{t("app.french")}</option>
            </select>
          </label>
        </div>
        <ImportExport
          buttons={buttons}
          setButtons={setButtons}
          saveToStorage={saveToStorage}
        />
      </div>
    </div>
  );
};

export default App;