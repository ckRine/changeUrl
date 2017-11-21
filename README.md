# changeUrl
Plugin Chrome pour modifier une url

Url Webstore : https://chrome.google.com/webstore/detail/change-url/ffnagmjeaolejfandagidkaapfomnofc?authuser=1

Pour installer le plugin, faire glisser le fichier Plugin_chrome.crx dans un onglet chrome.

Il y a 2 types de modifications possibles :
- ajout de paramètre
  - Pour ajouter un paramètre, il suffit d'ajouter le nom du paramètre et en option sa valeur
  - ex : 
      - param
      - param=valeur
  - Le script detecte si il y a déjà des paramètres dans l'url pour ajouter un ? ou un & avant
- remplacement d'une chaine par une autre
  - Le script remplace la chaine 1 par la chaine 2 dans l'url. Si la chaine 2 est vide, il supprime la chaine 1 dans l'url
  
Pour le moment le résultat est affiché dans un nouvel onglet. Par la suite, le script permettra de choisir la target (self ou blank)


Pour les raccourcis clavier :
- Pour lancer le plugin avec un raccourcis clavier, il faut en associer un dans chrome :
  - Outils > Extensins puis en bas de la page, Raccourcis clavier
- Ensuite, chaque bouton aura un raccourci 1 ... 9 (1 pour le premier bouton, 2 pour le deuxiéme ...)
