// Permet de recuperer l'url de l'onglet courant dans chrome
let tab = '';

function getCurrentTabUrl(callback) {
	let queryInfo = {
		active: true,
		currentWindow: true
	};
	chrome.tabs.query(queryInfo, function(tabs) {
		tab = tabs[0];
		let url = tab.url;
		callback(url);
	});
}

// renvoie un tableau qui contient tous les parametres d'une url 
function getUrlVars(href) {
	let vars = [], hash;
	let allVars = '';
	if (href.indexOf('?') > 0) {
		let hashes = href.slice(href.indexOf('?') + 1).split('&');

		for(let i = 0; i < hashes.length; i++) {
			vars.push(hashes[i]);
		}
		for (i in vars) {
			allVars+=vars[i]+"\n";
		}
	}
	return allVars;
}

// Set de boutons par defaut
let buttonsInit = {
	"version" : "2",
	"buttons": [
		{
			"name" : "DEV / PROD connect",
			"params" : [
				{
					"paramName" : "connected",
					"paramValue" : "1"
				},
			],
			"replace" : [
				{
					"replaceFrom" : ".dev",
					"replaceBy" : ".com"
				},
			],
			"target" : "self",
		},
		{
			"name"   : "out xml",
			"params" : [
				{
					"paramName" : "out",
					"paramValue" : "xml"
				},
			],
			"replace" : [
				{
					"replaceFrom" : "",
					"replaceBy" : ""
				},
			],
			"target" : "self",
		},
	 ]
};

// Initialisation du tableau des raccourcis
let keys_id = [];

// Création des event (pour les trigger)
let changeEvent = new Event('change');
let clickEvent  = new Event('click');

window.onload = function() {

	// On recupere l'url de l'onglet actif pour le passer en parametre de la fonction action
	getCurrentTabUrl(function(url) {
		action(url);
	});

	// teste si le navigateur supporte localStorage
	if (!window.localStorage) {
		document.querySelector("#msg").append('Local Storage non supporté');
	}
	else {

		// Si le local storage ne contient pas encore de onfig, on place deux boutons d'exemple
		if (!localStorage.getItem("config")) {
			localStorage.setItem("config", JSON.stringify(buttonsInit));
		}

		// Pour réinitialiser les boutons
		// localStorage.setItem("config", JSON.stringify(buttonsInit));

		createBtn();
	}

	// SI l'utilisateur click sur le bouton ajouter
	document.querySelector(".JSBtnAdd").addEventListener("click", function() {
		createForm('', 'add');
	});

}

function updateCompatibility () {
	// version 1 -> version 2
	if(btns.buttons[0].code1 !== undefined) {
		let new_btns =  {
			"version" : "2",
			"buttons": [
				{
					"name" : "",
					"params" : [
						{
							'paramName' : "",
							'paramValue' : ""
						}
					],
					"replace" : [
						{
							"replaceFrom" : "",
							"replaceBy" : ""
						}
					],
					"target" : ""
				}
			]
		};
		for (let i = 0; i < btns.buttons.length; i++) {
			new_btns.buttons[i] = {
				"name" : btns.buttons[i].name,
				"params" : [
					 {
						"paramName" : btns.buttons[i].param,
						"paramValue" : ""
					 }
				],
				"replace" : [
					 {
						"replaceFrom" : btns.buttons[i].code1,
						"replaceBy" : btns.buttons[i].code2
					 }
				],
				"target" : btns.buttons[i].target
		  };
		}
		btns=new_btns;
	}
}

function createBtn() {

	// Contiendra les boutons a afficher
	let htmlBtn = "";

	// On recupere la config
	config = localStorage.getItem('config');

	// On parse le contenu
	if (config) {
		btns = JSON.parse(config);
		updateCompatibility(btns);
	}
	else {
		document.querySelector("#msg").append('Pas de données stockées');
	}

	// Génération des boutons
	if (btns.buttons) {
		for (let i = 0; i < btns.buttons.length; i++) {
			btn = btns.buttons[i];
			let btnId = i;
			htmlBtn += '<div class="btn_'+btnId+'" id="'+btnId+'"><button class="btn btn-action JSAction">' + btn.name + '</button><button class="btn btn-txt JSEdit">Edit</button><button class="JSDel btn btn-supp">X</button></div>';
			keys_id.push(btnId);
		}
		document.querySelector(".btnActions").innerHTML = htmlBtn;
	}

	if (document.querySelector(".JSDel")) {
		let elmDel = document.querySelectorAll(".JSDel");
		for (let i = 0; i < elmDel.length; i++) {
			elmDel[i].addEventListener("click", function(e) {
				delBtn(e.target.parentNode.id);
			});
		}
	}

	if (document.querySelector(".JSEdit")) {
		let elmEdit = document.querySelectorAll(".JSEdit");
		for (let i = 0; i < elmEdit.length; i++) {
			elmEdit[i].addEventListener("click", function(e) {
				btnId = this.parentNode.id;
				createForm(btnId, 'edit');
			});
		}
	}

	// createKey(keys_id);
}

function createForm (btnId = '', action) {
	let currentBtnName  = btnId == '' ? '' : btns.buttons[btnId]['name'];
	currentBtnName = currentBtnName !== undefined ? currentBtnName : "";
	let htmlFormParams  = '';
	let htmlFormReplace = '';
	htmlForm  = '<form id="formElm" class="form dNone">';
	htmlForm += '<label class="formText" for="name">Nom</label>';
	htmlForm += '<input type="text" id="name" value="'+currentBtnName+'"/>';

	if(btnId != '') {
		let paramsList  = btns.buttons[btnId].params;
		for (let i = 0; i < paramsList.length; i++) {
			let paramName = paramsList[i].paramName !== undefined ? paramsList[i].paramName : '';
			let paramValue = paramsList[i].paramValue !== undefined ? paramsList[i].paramValue : '';
			htmlFormParams += '<div class="formField paramField">';
			htmlFormParams += '<input type="text" class="JSInputParamsName" id="paramName'+i+'" value="'+paramName+'"/>';
			htmlFormParams += '<span class="formText"> = </span>';
			htmlFormParams += '<input type="text" class="JSInputParamsValue" id="paramValue'+i+'" value="'+paramValue+'"/>';
			htmlFormParams += '</div>';
		}

		let replaceList = btns.buttons[btnId].replace;
		for (let j = 0; j < replaceList.length; j++) {
			let replaceFrom = replaceList[j].replaceFrom !== undefined ? replaceList[j].replaceFrom : '';
			let replaceBy = replaceList[j].replaceBy !== undefined ? replaceList[j].replaceBy : '';
			htmlFormReplace += '<div class="formField replaceField">';
			htmlFormReplace += '<input type="text" class="JSInputReplaceFrom" id="replaceFrom'+j+'" value="'+replaceFrom+'"/>';
			htmlFormReplace += '<span class="formText"> par </span>';
			htmlFormReplace += '<input type="text" class="JSInputReplaceBy" id="replaceBy'+j+'" value="'+replaceBy+'"/>';
			htmlFormReplace += '</div>';
		}
	} else {
		htmlFormParams += '<div class="formField paramField">';
		htmlFormParams += '<input type="text" class="JSInputParamsName" id="paramName'+0+'" value=""/>';
		htmlFormParams += '<span class="formText"> = </span>';
		htmlFormParams += '<input type="text" class="JSInputParamsValue" id="paramValue'+0+'" value=""/>';
		htmlFormParams += '</div>';
		htmlFormReplace += '<div class="formField replaceField">';
		htmlFormReplace   += '<input type="text" class="JSInputReplaceFrom" id="replaceFrom'+0+'" value=""/>';
		htmlFormReplace   += '<span class="formText"> par </span>';
		htmlFormReplace   += '<input type="text" class="JSInputReplaceBy" id="replaceBy'+0+'" value=""/>';
		htmlFormReplace += '</div>';
	}
	if ( htmlFormParams != '' ) {
		htmlForm += '<p class="formText">Paramètres</p>';
		htmlForm += htmlFormParams;
	}
	if ( htmlFormReplace != '' ) {
		htmlForm += '<p class="formText">Remplacer</p>';
		htmlForm += htmlFormReplace;
	}
	htmlForm += '<input type="hidden" name="target" id="target" value="_self"/>';
	htmlForm += '<input type="submit" name="btnValid" id="btnValid" class="JSbtnValid btn btn-txt"/>';
	htmlForm += '</form>';
	document.querySelector(".JSForm").innerHTML = htmlForm;
	i = 0; j = 0;
	let formElm = document.getElementById('formElm');

	formElm.style.display = 'block';

	document.querySelector(".JSbtnValid").addEventListener("click", function() {
		event.preventDefault();
		validForm(formElm, btnId);
	});
}

function validForm (formElm, btnId = '') {

	let newBtnId = btnId == '' ? btns.buttons.length : btnId;
	btns.buttons[newBtnId] = {
		"name"   : "",
		"params" : [
			{
				"paramName" : "",
				"paramValue" : ""
			}
		],
		"replace"   : [
			{
				"replaceFrom" : "",
				"replaceBy" : ""
			}
		],
		"target" : "self"
	};

	let newBtnName = formElm.name.value != '' ? formElm.name.value : 'New Button';

	btns.buttons[newBtnId].name = newBtnName;
	for (let i = 0; i < formElm.querySelectorAll(".JSInputParamsName").length; i++) {
		let inputsParamsName = formElm.querySelectorAll("#paramName"+i);
		let inputsParamsValue = formElm.querySelectorAll("#paramValue"+i);
		let paramName = inputsParamsName[0].value;
		let paramValue = inputsParamsValue[0].value;
		btns.buttons[newBtnId].params[i].paramName = paramName;
		btns.buttons[newBtnId].params[i].paramValue = paramValue;
	}

	for (let i = 0; i < formElm.querySelectorAll(".JSInputReplaceFrom").length; i++) {
		let inputsReplaceFrom = formElm.querySelectorAll("#replaceFrom"+i);
		let inputsReplaceBy = formElm.querySelectorAll("#replaceBy"+i);
		let replaceFrom = inputsReplaceFrom[0].value;
		let replaceBy = inputsReplaceBy[0].value;
		btns.buttons[newBtnId].replace[i].replaceFrom = replaceFrom;
		btns.buttons[newBtnId].replace[i].replaceBy = replaceBy;
	}

	localStorage.setItem("config", JSON.stringify(btns));
	createBtn();
	formElm.style.display = 'none';
	formElm.reset();
}

// function createKey(keys_id) {

//     // On cree des raccourcis claviers pour chaque bouton
//     let keys = {};
//     onkeyup = function (e) {
//         console.log('keyup', e);
//         keys[e.keyCode] = e.type === 'keyup';
//         console.log('keys', keys);
//         for (id in keys_id) {
//             let keynb = parseInt(id)+49;
//             // Le premier bouton a pour raccourci la touche "1", le deuxieme la touche "2" ...
//             if (keys[keynb]) {
//                 document.querySelector('.btn_'+keys_id[id]+' ').querySelector('.JSAction').dispatchEvent(clickEvent);
//             }
//         }
//     }
// }

function delBtn(btnIdToDel) {
	let msg = 'Supprimer '+btns.buttons[btnIdToDel].name+' ?';
	let htmlConfirm = '<p id="confirmMsg">'+msg+'</p><button class="btn btn-confirm yes">yes</button><button class="btn btn-confirm no">no</button>';
	document.getElementById('confirm').innerHTML = htmlConfirm;
	document.getElementById('confirm').style.display = 'block';
	let btnConfirmYes = document.querySelector(".btn-confirm.yes");
	let btnConfirmNo  = document.querySelector(".btn-confirm.no");

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
	let new_url = '';
	let elmAction = document.querySelectorAll(".JSAction");
	for (let a = 0; a < elmAction.length; a++) {
		elmAction[a].addEventListener("click", function(e) {
			let index = a;

			for (let r = 0; r < btns.buttons[index].replace.length; r++) {
				let fromString = btns.buttons[index].replace[r].replaceFrom;
				let byString = btns.buttons[index].replace[r].replaceBy;;
				new_url = url.replace(fromString, byString);
			}
			console.log('new_url',new_url);

			// Gestion des paramètres
			let urlParams = getUrlVars(new_url);
			let sep_param = urlParams == "" ? "?" : "&";
			let cl = '';
			if(new_url.indexOf('#') > 0){
				cl = new_url.indexOf('#');
				urlhash = new_url.substring(new_url.indexOf('#'),new_url.length);
			} else {
				urlhash = '';
				cl = new_url.length;
			}
			new_url = new_url.substring(0,cl);
			new_url = new_url + sep_param;
			console.log('new_url',new_url);

			for (let p = 0; p < btns.buttons[index].params.length; p++) {
				sep_param = sep_param !== "" ? "" : "&"
				let paramslist = btns.buttons[index].params[p];
				//  let value = paramslist.paramValue !== ''
				let newParam = sep_param+paramslist.paramName+'='+paramslist.paramValue;
				new_url += newParam;
				sep_param = "&";
			}
			new_url+= urlhash;
			console.log('new_url',new_url);

			// On ouvre un onglet avec le nouvel url
			if (btns.buttons[index].target == 'blank') {
				chrome.tabs.update(tab.id, {active: true,url: new_url});
			}
			else if (btns.buttons[index].target == 'self') {
				window.open(new_url);
			}

		});
	}
}
