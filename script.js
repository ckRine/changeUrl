// Permet de recuperer l'url de l'onglet courant dans chrome
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    callback(url);
  });
}

// renvoie un tableau qui contient tous les parametres d'une url 
function getUrlVars(href) {
    var vars = [], hash;
    var allVars = '';
    if (href.indexOf('?') > 0) {
        var hashes = href.slice(href.indexOf('?') + 1).split('&');

        for(var i = 0; i < hashes.length; i++) {
            vars.push(hashes[i]);
        }
        for (i in vars) {
            allVars+=vars[i]+"\n";
        }
    }
    return allVars;
}

// Set de boutons par defaut
var buttonsInit = {
    "buttons": [
      {
        "name": "DEV/REC",
        "type": "replace",
        "param": "",
        "code1": ".dev",
        "code2": ".preprod",
        "target": "_self",
      },
      {
        "name": "DisplayXML",
        "type": "param",
        "param": "display_xml",
        "code1": "",
        "code2": "",
        "target": "_self",
      },
    ]
};
    var keys_id = [];

var changeEvent = new Event('change');
var clickEvent  = new Event('click');

window.onload = function() {

    // On recupere l'url de l'onglet actif pour le passer en parametre de la fonction action
    getCurrentTabUrl(function(url) {
        action(url);
    });

    if (!localStorage.getItem("config")) {
        localStorage.setItem("config", JSON.stringify(buttonsInit));
    }

    // Pour réinitialiser les boutons
    localStorage.setItem("config", JSON.stringify(buttonsInit));

    // teste si le navigateur supporte localStorage
    if (!window.localStorage) {
        document.querySelector("#msg").append('Local Storage non supporté');
    }
    else {
        createBtn();
    }

    document.querySelector(".JSBtnForm").addEventListener("click", function() {
        validForm('add');
    });

}

function createBtn() {

    config = localStorage.getItem('config');

    if (config) {
        btns = JSON.parse(config);
    } 
    else {
        document.querySelector("#msg").append('Pas de données stockées');
    }

    var htmlBtn = "";
    if (btns.buttons) {
        for (var i = 0; i < btns.buttons.length; i++) {
          var attr = '';
          btn = btns.buttons[i];
            for (var id in btn) { // On stocke l'identifiant dans « id » pour parcourir l'objet « family »
                attr += ' data-' + id + '="' + btn[id] + '"';
            }
            var btnId = i;
            htmlBtn += '<div class="btn_'+btnId+'" id="'+btnId+'"><button class="btn btn-action JSAction"' + attr + '>' + btn.name + '</button><button class="btn btn-edit JSEdit">Edit</button><button class="JSDel btn btn-supp">X</button></div>';
            keys_id.push(btnId);

        }
        document.querySelector(".btnActions").innerHTML = htmlBtn;
   }

    if (document.querySelector(".JSDel")) {
        var elmDel = document.querySelectorAll(".JSDel");
        for (var i = 0; i < elmDel.length; i++) {
            elmDel[i].addEventListener("click", function(e) {
                delBtn(e.target.parentNode.id);
            });
        }
    }

    if (document.querySelector(".JSEdit")) {
        var elmEdit = document.querySelectorAll(".JSEdit");
        for (var i = 0; i < elmDel.length; i++) {
            elmEdit[i].addEventListener("click", function(e) {
                validForm('edit', e.target.parentNode.id);
            });
        }
    }

    createForm();

    createKey();
}

function createForm () {
    htmlForm = '<form id="formElm" class="form dNone"><select id="type" name="type"><option value="">Choix</option><option value="param">Paramètre</option><option value="replace">Remplacement</option></select><div class="JSname dNone"><label for="name">Nom</label><input type="text" name="name" id="name" /></div><div class="JSparam JSfield dNone""><label for="param">Param</label><input type="text" name="param" id="param"/></div><div class="JSreplace JSfield dNone""><label for="code1">code1</label><input type="text" name="code1" id="code1"/><label for="code2">code2</label><input type="text" name="code2" id="code2"/></div><input type="hidden" name="target" id="target" value="_blank"/><input type="submit" name="btn" id="btn" class="JSbtn dNone btn"/></form>';
    document.querySelector(".JSForm").innerHTML = htmlForm;
}

function createKey () {
    // On cree des raccourcis claviers pour chaque bouton
    var keys = {};
    onkeydown = onkeyup = function (e) {
        keys[e.keyCode] = e.type === 'keydown';
        for (id in keys_id) {
            console.log(id);
            var keynb = parseInt(id)+49;
            // Le premier bouton a pour raccourci la touche "1", le deuxieme la touche "2" ...
            if (keys[keynb]) {
             //   document.querySelector('.btn_'+keys_id[id]+' ').querySelector('.JSAction').dispatchEvent(clickEvent);
            }
        }
    }
}

function delBtn(btnIdToDel) {
    var msg = 'Supprimer '+btns.buttons[btnIdToDel].name+' ?';
    var htmlConfirm = '<p id="confirmMsg">'+msg+'</p><button class="btn btn-confirm yes">yes</button><button class="btn btn-confirm no">no</button>';
    document.getElementById('confirm').innerHTML = htmlConfirm;
    document.getElementById('confirm').style.display = 'block';
    var btnConfirmYes = document.querySelector(".btn-confirm.yes");
    var btnConfirmNo  = document.querySelector(".btn-confirm.no");
    
    btnConfirmYes.addEventListener("click", function(e) {
        btns.buttons.splice(btnIdToDel,1);
        document.getElementById('confirm').style.display = 'none';
        localStorage.setItem("config", JSON.stringify(btns));
        createBtn();
    });

    btnConfirmNo.addEventListener("click", function(e) {
        document.getElementById('confirm').style.display = 'none';
    });
    
}

function action(url) {

    var new_url = '';
    var elmAction = document.querySelectorAll(".JSAction");
    for (var i = 0; i < elmAction.length; i++) {
        elmAction[i].addEventListener("click", function(e) {       

            // Si l'action est de type param, on ajoute le nom et la valeur du param à la fin de l'url
            if (e.target.dataset.type == 'param') {
                var urlParams = getUrlVars(url);
                var sep_param = urlParams == "" ? "?" : "&";
                new_url = url + sep_param + e.target.dataset.param;
                window.open(new_url);
            }

            // Si l'action est de type change, on recherche la chaine code1 dans l'url et on la remplace par la chaine code2
            else if (e.target.dataset.type == 'replace') {
                new_url = url.replace(e.target.dataset.code1, e.target.dataset.code2);
                window.open(new_url);
            }

           /* if (this.data('target') == 'blank') {
                window.open(new_url);
            }
            else {
                $( window ).load(new_url);
            }*/

            // On ouvre un onglet avec le nouvel url
        });
    }

}

function validForm (action, btnId = '') {

    var formElm      = document.getElementById('formElm');
    var select       = formElm.elements['type'];

    formElm.style.display = 'block';

    select.addEventListener('change', function() {
        var selectIndex  = select.selectedIndex;
        var type         = select.options[selectIndex].value;
        var classToShow  = 'JS'+type;
        var elemsToShow  = formElm.querySelectorAll("."+classToShow);
        var elemsToHide  = formElm.querySelectorAll(".JSfield");
        formElm.querySelector(".JSname").style.display = 'block';
        formElm.querySelector(".JSbtn").style.display = 'block';
        for (var i = 0; i < elemsToHide.length; i++) {
            elemsToHide[i].style.display = 'none';
        }
        for (var i = 0; i < elemsToShow.length; i++) {
            elemsToShow[i].style.display = 'block';
        }
    });

    if (action == 'edit') {
        formElm.name.value   = document.getElementById(btnId).querySelector('.JSAction').getAttribute('data-name');
        formElm.type.value   = document.getElementById(btnId).querySelector('.JSAction').getAttribute('data-type');
        formElm.param.value  = document.getElementById(btnId).querySelector('.JSAction').getAttribute('data-param');
        formElm.code1.value  = document.getElementById(btnId).querySelector('.JSAction').getAttribute('data-code1');
        formElm.code2.value  = document.getElementById(btnId).querySelector('.JSAction').getAttribute('data-code2');
        formElm.target.value = document.getElementById(btnId).querySelector('.JSAction').getAttribute('data-target');
        select.dispatchEvent(changeEvent);
    }

    formElm.addEventListener('submit', function(e) {
        event.preventDefault();
        if (action == 'edit') {
            btns.buttons[btnId] = {
                "name"   : formElm.name.value,
                "type"   : formElm.type.value,
                "param"  : formElm.param.value,
                "code1"  : formElm.code1.value,
                "code2"  : formElm.code2.value,
                "target" : formElm.target.value,
            };
        }
        else if (action == 'add') {
            btns.buttons.push({
                "name"   : formElm.name.value,
                "type"   : formElm.type.value,
                "param"  : formElm.param.value,
                "code1"  : formElm.code1.value,
                "code2"  : formElm.code2.value,
                "target" : formElm.target.value,
            });
        }
        localStorage.setItem("config", JSON.stringify(btns));
        createBtn();
        formElm.style.display = 'none';
        formElm.reset();

    });
}