import React, { useState, useEffect } from "react";
     import { toast } from "react-toastify";
     import { useTranslation } from "react-i18next";
     import ButtonRow from "./components/ButtonRow";
     import ButtonForm from "./components/ButtonForm";
     import ImportExport from "./components/ImportExport";
     import UserGuide from "./components/UserGuide";
     import { conditionalLog, escapeRegExp } from "./utils";
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

       // Load buttons from localStorage
       useEffect(() => {
         const storedButtons = JSON.parse(localStorage.getItem("buttons")) || [];
         setButtons(storedButtons);
       }, []);

       // Initialize language from localStorage
       useEffect(() => {
         const savedLanguage = localStorage.getItem("language") || "en";
         i18n.changeLanguage(savedLanguage);
       }, [i18n]);

       // Save buttons to localStorage
       const saveToStorage = (updatedButtons) => {
         localStorage.setItem("buttons", JSON.stringify(updatedButtons));
       };

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
             conditionalLog("Initial URL:", finalUrl);
             button.replacements?.forEach(({ pattern, value, useRegex }) => {
               try {
                 if (useRegex) {
                   const regex = new RegExp(pattern, "g");
                   finalUrl = finalUrl.replace(regex, value);
                 } else {
                   const escapedPattern = escapeRegExp(pattern);
                   const regex = new RegExp(escapedPattern, "g");
                   finalUrl = finalUrl.replace(regex, value);
                 }
               } catch (error) {
                 toast.error(`${t("errors.regexError")}: ${pattern}`);
                 conditionalLog("Regex error:", error, pattern);
               }
             });
             if (button.params?.length > 0) {
               const queryString = button.params
                 .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                 .join("&");
               finalUrl += finalUrl.includes("?") ? `&${queryString}` : `?${queryString}`;
             }
             conditionalLog("Final URL:", finalUrl);
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
             toast.success(`${t("success.actionExecuted")}: ${finalUrl}`);
           } catch (error) {
             toast.error(t("errors.runError"));
             conditionalLog(t("errors.runError"), error);
           }
         });
       };

       // Handle button edit
       const handleEdit = (button) => {
         setEditButton(button);
         setShowForm(true);
       };

       // Handle button delete
       const handleDelete = (id) => {
         const updatedButtons = buttons.filter((btn) => btn.id !== id);
         setButtons(updatedButtons);
         saveToStorage(updatedButtons);
         toast.success(t("success.buttonDeleted"));
         conditionalLog(t("logs.buttonDeleted"), id);
       };

       // Toggle form visibility
       const toggleForm = () => {
         setShowForm(!showForm);
         setEditButton(null);
       };

       // Toggle user guide visibility
       const toggleUserGuide = () => {
         setShowUserGuide(!showUserGuide);
       };

       // Handle form submission
       const handleFormSubmit = (newButton) => {
         conditionalLog(t("logs.formSubmit"), newButton);
         let updatedButtons;
         if (editButton) {
           updatedButtons = buttons.map((btn) =>
             btn.id === editButton.id ? { ...newButton, id: btn.id } : btn
           );
           toast.success(t("success.buttonUpdated"));
           conditionalLog(t("logs.buttonUpdated"), newButton);
         } else {
           updatedButtons = [...buttons, { ...newButton, id: Date.now() }];
           toast.success(t("success.buttonAdded"));
           conditionalLog(t("logs.buttonAdded"), newButton);
         }
         setButtons(updatedButtons);
         saveToStorage(updatedButtons);
         setShowForm(false);
         setEditButton(null);
       };

       // Handle logging toggle
       const handleLoggingToggle = (e) => {
         const checked = e.target.checked;
         setIsLoggingEnabled(checked);
         localStorage.setItem("debugLogging", checked);
         conditionalLog(t("logs.conditionalLogs"), checked ? t("logs.enabled") : t("logs.disabled"));
       };

       // Handle language change
       const handleLanguageChange = (e) => {
         const language = e.target.value;
         i18n.changeLanguage(language);
         localStorage.setItem("language", language);
         conditionalLog(t("logs.languageChanged"), language);
       };

       return (
         <div className="app-container">
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
           <div className="action-buttons">
             <button className="btn action-toggle-form" onClick={toggleForm}>
               {showForm ? t("app.hideForm") : t("app.addButton")}
             </button>
           </div>
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