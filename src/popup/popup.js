import React from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ButtonForm from '../components/ButtonForm';
import '../styles/index.css';

// Fonction pour sauvegarder les données du bouton
const saveButtonData = (buttonData) => {
  chrome.storage.local.get(['buttons'], (result) => {
    const buttons = result.buttons || [];
    buttons.push(buttonData);
    chrome.storage.local.set({ buttons }, () => {
      console.log('Bouton sauvegardé:', buttonData);
    });
  });
};

// Fonction pour fermer la popup
const closeForm = () => {
  window.close();
};

// Rendu du composant ButtonForm
const root = createRoot(document.getElementById('root'));
root.render(
  <>
    <ButtonForm onSubmit={saveButtonData} closeForm={closeForm} />
    <ToastContainer />
  </>
);