/**
 * Composant pour créer ou modifier un bouton.
 * Gère les remplacements d'URL, les paramètres et le type d'action.
 * Component for creating or editing a button.
 * Manages URL replacements, parameters, and action type.
 */
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { conditionalLog, escapeRegExp } from "../utils";

const ButtonForm = ({ button, onSubmit, closeForm }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(button?.name || "");
  const [replacements, setReplacements] = useState(button?.replacements || []);
  const [params, setParams] = useState(button?.params || []);
  const [actionType, setActionType] = useState(button?.actionType || "redirect");
  const [computedUrl, setComputedUrl] = useState("");

  // Pré-remplit le formulaire avec les données du bouton
  // Pre-fill form with button data
  useEffect(() => {
    if (button) {
      setName(button.name || "");
      setReplacements(button.replacements || []);
      setParams(button.params || []);
      setActionType(button.actionType || "redirect");
      conditionalLog(t("logs.prefillForm"), button);
    }
  }, [button, t]);

  // Calcule l'URL transformée
  // Compute transformed URL
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let baseUrl = tabs[0]?.url || t("errors.noUrl");
      let finalUrl = baseUrl;

      replacements.forEach(({ pattern, value, useRegex }) => {
        if (pattern && value) {
          try {
            const regex = useRegex ? new RegExp(pattern, "g") : new RegExp(escapeRegExp(pattern), "g");
            finalUrl = finalUrl.replace(regex, value);
          } catch (error) {
            if (useRegex) {
              toast.error(`Erreur dans l'expression régulière : ${pattern}`);
              conditionalLog(t("errors.regexPreview"), error, pattern);
            }
          }
        }
      });

      if (params.length > 0) {
        const queryString = params
          .filter((p) => p.key.trim() && p.value.trim())
          .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&");
        finalUrl = finalUrl.includes("?")
          ? `${finalUrl}&${queryString}`
          : `${finalUrl}?${queryString}`;
      }

      setComputedUrl(finalUrl);
      conditionalLog(t("logs.computedUrl"), finalUrl);
    });
  }, [replacements, params, t]);

  // Ajoute un remplacement
  // Add a replacement
  const addReplacement = () => {
    setReplacements([...replacements, { pattern: "", value: "", useRegex: false }]);
  };

  // Met à jour un remplacement
  // Update a replacement
  const updateReplacement = (index, field, value) => {
    const newReplacements = [...replacements];
    newReplacements[index][field] = value;
    setReplacements(newReplacements);
  };

  // Bascule l'option regex
  // Toggle regex option
  const toggleRegex = (index) => {
    const newReplacements = [...replacements];
    newReplacements[index].useRegex = !newReplacements[index].useRegex;
    setReplacements(newReplacements);
  };

  // Supprime un remplacement
  // Remove a replacement
  const removeReplacement = (index) => {
    setReplacements(replacements.filter((_, i) => i !== index));
  };

  // Ajoute un paramètre
  // Add a parameter
  const addParam = () => {
    setParams([...params, { key: "", value: "" }]);
  };

  // Met à jour un paramètre
  // Update a parameter
  const updateParam = (index, field, value) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
  };

  // Supprime un paramètre
  // Remove a parameter
  const removeParam = (index) => {
    setParams(params.filter((_, i) => i !== index));
  };

  // Gère la soumission du formulaire
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("errors.nameRequired"));
      return;
    }

    for (const { pattern, useRegex } of replacements) {
      if (pattern.trim() && useRegex) {
        try {
          new RegExp(pattern, "g");
        } catch (error) {
          toast.error(`${t("errors.invalidRegex")}: ${pattern}`);
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
      onSubmit(buttonData);
    } catch (error) {
      toast.error(t("errors.formSubmitError"));
      conditionalLog(t("errors.formSubmitError"), error);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <button type="button" className="btn close-form" onClick={closeForm}>
        {t("form.close")}
      </button>
      <div className="form-label">
        <label>{t("form.buttonName")}</label>
        <input
          className="input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("form.buttonNamePlaceholder")}
        />
      </div>
      <div className="form-label">
        <label>{t("form.transformedUrl")}</label>
        <div className="url-display">{computedUrl || t("errors.noUrl")}</div>
      </div>
      <div className="form-label">
        <label>{t("form.replacements")}</label>
        {replacements.map((replacement, index) => (
          <div className="replacement-row" key={index}>
            <input
              className="input"
              type="text"
              value={replacement.pattern}
              onChange={(e) => updateReplacement(index, "pattern", e.target.value)}
              placeholder={replacement.useRegex ? t("form.regexPlaceholder") : t("form.stringPlaceholder")}
            />
            <input
              className="input"
              type="text"
              value={replacement.value}
              onChange={(e) => updateReplacement(index, "value", e.target.value)}
              placeholder={t("form.replacementValuePlaceholder")}
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={replacement.useRegex}
                onChange={() => toggleRegex(index)}
              />
              {t("form.regex")}
            </label>
            <button type="button" className="btn action-delete" onClick={() => removeReplacement(index)}>
              {t("form.delete")}
            </button>
          </div>
        ))}
        <button type="button" className="btn action-add" onClick={addReplacement}>
          {t("form.addReplacement")}
        </button>
      </div>
      <div className="form-label">
        <label>{t("form.parameters")}</label>
        {params.map((param, index) => (
          <div className="param-row" key={index}>
            <input
              className="input"
              type="text"
              value={param.key}
              onChange={(e) => updateParam(index, "key", e.target.value)}
              placeholder={t("form.keyPlaceholder")}
            />
            <input
              className="input"
              type="text"
              value={param.value}
              onChange={(e) => updateParam(index, "value", e.target.value)}
              placeholder={t("form.valuePlaceholder")}
            />
            <button type="button" className="btn action-delete" onClick={() => removeParam(index)}>
              {t("form.delete")}
            </button>
          </div>
        ))}
        <button type="button" className="btn action-add" onClick={addParam}>
          {t("form.addParameter")}
        </button>
      </div>
      <div className="form-label">
        <label>{t("form.actionType")}</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="redirect"
              checked={actionType === "redirect"}
              onChange={(e) => setActionType(e.target.value)}
            />
            {t("form.redirect")}
          </label>
          <label>
            <input
              type="radio"
              value="open-tab"
              checked={actionType === "open-tab"}
              onChange={(e) => setActionType(e.target.value)}
            />
            {t("form.openTab")}
          </label>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn action-submit">
          {button ? t("form.update") : t("form.add")}
        </button>
        <button type="button" className="btn action-cancel" onClick={closeForm}>
          {t("form.cancel")}
        </button>
      </div>
    </form>
  );
};

export default ButtonForm;