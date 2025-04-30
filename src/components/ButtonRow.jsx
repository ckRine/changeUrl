import React from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const ButtonRow = ({ button, onRun, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const handleRun = () => {
    try {
      onRun(button);
      toast.success(t("success.actionExecuted"));
    } catch (error) {
      toast.error(t("errors.runError"));
      console.error(t("errors.runError"), error);
    }
  };

  const handleEdit = () => {
    onEdit(button);
  };

  const handleDelete = () => {
    onDelete(button.id);
  };

  return (
    <div className="button-row">
      <button className="btn action-run" onClick={handleRun}>
        {button.name}
      </button>
      <button className="btn action-edit" onClick={handleEdit}>
        {t("buttonRow.edit")}
      </button>
      <button className="btn action-delete" onClick={handleDelete}>
        {t("buttonRow.delete")}
      </button>
    </div>
  );
};

export default ButtonRow;