# changeUrl
Plugin Chrome pour modifier une url

Url Webstore : https://chrome.google.com/webstore/detail/change-url/ffnagmjeaolejfandagidkaapfomnofc?authuser=1

Pour installer le plugin, faire glisser le fichier Plugin_chrome.crx dans un onglet chrome.

Il y a 2 types de modifications possibles :
- ajout de paramètre
  - Pour ajouter un paramètre, il suffit d'ajouter le nom du paramètre et en option sa valeur
  - Le script detecte si il y a déjà des paramètres dans l'url pour ajouter un ? ou un & avant et garde les ancres de l'url d'origine
 
- remplacement d'une chaine par une autre
  - Le script remplace la chaine 1 par la chaine 2 dans l'url. Si la chaine 2 est vide, il supprime la chaine 1 dans l'url
  
Le résultat est affiché dans un nouvel onglet.
