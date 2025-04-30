import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { conditionalLog, escapeRegExp } from "../utils";

const ButtonForm = ({ button, onSubmit, closeForm }) => {
  const [name, setName] = useState(button?.name || "");
  const [replacements, setReplacements] = useState(button?.replacements || []);
  const [params, setParams] = useState(button?.params || []);
  const [actionType, setActionType] = useState(button?.actionType || "redirect");
  const [computedUrl, setComputedUrl] = useState("");

  useEffect(() => {
    if (button) {
      setName(button.name || "");
      setReplacements(button.replacements || []);
      setParams(button.params || []);
      setActionType(button.actionType || "redirect");
      conditionalLog("Pré-remplissage du formulaire :", button);
    }
  }, [button]);

  // Récupérer l'URL dynamique et appliquer les transformations
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let baseUrl = tabs[0]?.url || "URL non disponible";
      let finalUrl = baseUrl;

      replacements.forEach(({ pattern, value, useRegex }) => {
        if (pattern && value) {
          try {
            const regex = useRegex
              ? new RegExp(pattern, "g")
              : new RegExp(escapeRegExp(pattern), "g");
            finalUrl = finalUrl.replace(regex, value);
          } catch (error) {
            conditionalLog("Erreur dans RegExp (aperçu) :", error, pattern);
          }
        }
      });

      if (params.length > 0) {
        const queryString = params
          .filter((p) => p.key.trim() && p.value.trim())
          .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&");
        finalUrl = finalUrl.includes("?")
          ? finalUrl.replace(/(\?.*?)(?=(#|$))/, `$1&${queryString}`)
          : `${finalUrl}?${queryString}`;
      }

      setComputedUrl(finalUrl);
      conditionalLog("URL calculée :", finalUrl);
    });
  }, [replacements, params]);

  const addReplacement = () => {
    setReplacements([...replacements, { pattern: "", value: "", useRegex: false }]);
  };

  const updateReplacement = (index, field, value) => {
    const newReplacements = [...replacements];
    newReplacements[index][field] = value;
    setReplacements(newReplacements);
  };

  const toggleRegex = (index) => {
    const newReplacements = [...replacements];
    newReplacements[index].useRegex = !newReplacements[index].useRegex;
    setReplacements(newReplacements);
  };

  const removeReplacement = (index) => {
    setReplacements(replacements.filter((_, i) => i !== index));
  };

  const addParam = () => {
    setParams([...params, { key: "", value: "" }]);
  };

  const updateParam = (index, field, value) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
  };

  const removeParam = (index) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    conditionalLog("handleSubmit appelé", {
      name,
      replacements,
      params,
      actionType,
    });

    if (!name.trim()) {
      toast.error("Le nom est obligatoire");
      conditionalLog("Erreur de validation : nom vide");
      return;
    }

    // Valider les expressions régulières si useRegex est activé
    for (const { pattern, useRegex } of replacements) {
      if (pattern.trim() && useRegex) {
        try {
          new RegExp(pattern, "g");
        } catch (error) {
          toast.error(`Expression régulière invalide : ${pattern}`);
          conditionalLog("Erreur dans RegExp (soumission) :", error, pattern);
          return;
        }
      }
    }

    const buttonData = {
      name: name.trim(),
      replacements: replacements.filter((r) => r.pattern.trim() && r.value.trim()),
      params: params.filter((p) => p.key.trim() && p.value.trim()),
      actionType,
    };

    try {
      if (typeof onSubmit !== "function") {
        throw new Error("onSubmit n'est pas une fonction");
      }
      onSubmit(buttonData);
      toast.success(button ? "Bouton mis à jour" : "Bouton ajouté");
      conditionalLog("Données soumises :", buttonData);
    } catch (error) {
      toast.error("Erreur lors de la soumission du formulaire");
      conditionalLog("Erreur dans handleSubmit :", error);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <button type="button" className="btn close-form" onClick={closeForm}>
        Fermer
      </button>
      <div className="form-label">
        <label>Nom du bouton</label>
        <input
          className="input text-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Entrez le nom du bouton"
        />
      </div>
      <div className="form-label">
        <label>URL transformée (aperçu basé sur l'onglet courant)</label>
        <div className="url-display">{computedUrl || "Aucune URL disponible"}</div>
      </div>
      <div className="form-label">
        <label>Remplacements</label>
        {replacements.map((replacement, index) => (
          <div className="replacement-row" key={index}>
            <input
              className="input"
              type="text"
              value={replacement.pattern}
              onChange={(e) => updateReplacement(index, "pattern", e.target.value)}
              placeholder={replacement.useRegex ? "Expression régulière (ex: example\.com)" : "Chaîne (ex: example.com)"}
            />
            <input
              className="input"
              type="text"
              value={replacement.value}
              onChange={(e) => updateReplacement(index, "value", e.target.value)}
              placeholder="Valeur de remplacement"
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={replacement.useRegex}
                onChange={() => toggleRegex(index)}
              />
              Regex
            </label>
            <button
              type="button"
              className="btn action-delete"
              onClick={() => removeReplacement(index)}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn action-add"
          onClick={addReplacement}
        >
          Ajouter un remplacement
        </button>
      </div>
      <div className="form-label">
        <label>Paramètres</label>
        {params.map((param, index) => (
          <div className="param-row" key={index}>
            <input
              className="input"
              type="text"
              value={param.key}
              onChange={(e) => updateParam(index, "key", e.target.value)}
              placeholder="Clé"
            />
            <input
              className="input"
              type="text"
              value={param.value}
              onChange={(e) => updateParam(index, "value", e.target.value)}
              placeholder="Valeur"
            />
            <button
              type="button"
              className="btn action-delete"
              onClick={() => removeParam(index)}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button type="button" className="btn action-add" onClick={addParam}>
          Ajouter un paramètre
        </button>
      </div>
      <div className="form-label">
        <label>Type d'action</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="redirect"
              checked={actionType === "redirect"}
              onChange={(e) => setActionType(e.target.value)}
            />
            Redirection
          </label>
          <label>
            <input
              type="radio"
              value="open-tab"
              checked={actionType === "open-tab"}
              onChange={(e) => setActionType(e.target.value)}
            />
            Ouvrir dans un nouvel onglet
          </label>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn action-submit">
          {button ? "Mettre à jour" : "Ajouter"}
        </button>
        <button
          type="button"
          className="btn action-cancel"
          onClick={closeForm}
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

export default ButtonForm;