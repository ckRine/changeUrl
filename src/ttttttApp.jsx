import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ButtonRow from "./components/ButtonRow";
import ButtonForm from "./components/ButtonForm";
import ImportExport from "./components/ImportExport";
import { conditionalLog } from "./utils";
import "./styles/index.css";

const App = () => {
  const [buttons, setButtons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editButton, setEditButton] = useState(null);

  // Charger les boutons depuis localStorage au montage
  useEffect(() => {
    const storedButtons = JSON.parse(localStorage.getItem("buttons")) || [];
    setButtons(storedButtons);
  }, []);

  // Sauvegarder les boutons dans localStorage
  const saveToStorage = (updatedButtons) => {
    localStorage.setItem("buttons", JSON.stringify(updatedButtons));
  };

  // Gérer l'exécution d'un bouton
  const handleRun = (button) => {
    if (!button || !button.url) {
      toast.error("Erreur : URL du bouton non définie");
      conditionalLog("Erreur : URL du bouton non définie", button);
      return;
    }
    try {
      let finalUrl = button.url;
      // Appliquer les remplacements
      button.replacements?.forEach(({ key, value }) => {
        finalUrl = finalUrl.replace(new RegExp(key, "g"), value);
      });
      // Ajouter les paramètres
      if (button.params?.length > 0) {
        const queryString = button.params
          .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&");
        finalUrl += finalUrl.includes("?") ? `&${queryString}` : `?${queryString}`;
      }
      conditionalLog("Exécution du bouton :", { button, finalUrl });
      // Exécuter l'action selon actionType
      if (button.actionType === "open-tab") {
        window.open(finalUrl, "_blank");
      } else {
        window.location.href = finalUrl;
      }
      toast.success(`Action exécutée : ${finalUrl}`);
    } catch (error) {
      toast.error("Erreur lors de l'exécution");
      conditionalLog("Erreur dans handleRun :", error);
    }
  };

  // Gérer l'édition d'un bouton
  const handleEdit = (button) => {
    setEditButton(button);
    setShowForm(true);
  };

  // Gérer la suppression d'un bouton
  const handleDelete = (id) => {
    const updatedButtons = buttons.filter((btn) => btn.id !== id);
    setButtons(updatedButtons);
    saveToStorage(updatedButtons);
    toast.success("Bouton supprimé");
    conditionalLog("Bouton supprimé, ID :", id);
  };

  // Basculer l'affichage du formulaire
  const toggleForm = () => {
    setShowForm(!showForm);
    setEditButton(null);
  };

  // Gérer la soumission du formulaire
  const handleFormSubmit = (newButton) => {
    conditionalLog("handleFormSubmit appelé :", newButton);
    let updatedButtons;
    if (editButton) {
      updatedButtons = buttons.map((btn) =>
        btn.id === editButton.id ? { ...newButton, id: btn.id } : btn
      );
      toast.success("Bouton mis à jour");
      conditionalLog("Bouton mis à jour :", newButton);
    } else {
      updatedButtons = [...buttons, { ...newButton, id: Date.now() }];
      toast.success("Bouton ajouté");
      conditionalLog("Bouton ajouté :", newButton);
    }
    setButtons(updatedButtons);
    saveToStorage(updatedButtons);
    setShowForm(false);
    setEditButton(null);
  };

  return (
    <div className="app-container">
      <div className="button-list">
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
          <p>Aucun bouton configuré.</p>
        )}
      </div>
      <button className="btn action-toggle-form" onClick={toggleForm}>
        {showForm ? "Masquer le formulaire" : "Ajouter un bouton"}
      </button>
      {showForm && (
        <ButtonForm
          button={editButton}
          onSubmit={handleFormSubmit}
          closeForm={toggleForm}
        />
      )}
      <div className="settings-footer">
        <div className="settings-section">
          <h3>Paramètres</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localStorage.getItem("conditionalLog") === "true"}
              onChange={(e) =>
                localStorage.setItem("conditionalLog", e.target.checked)
              }
            />
            Activer les logs conditionnels
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