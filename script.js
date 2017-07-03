
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

window.onload = function() {

    // Tableau qui contiendra les id des differents boutons (est utilise pour les raccourcis clavier)
    var keys_id = [];

    // Le fichier options.json contient la configuration de tous les boutons
    $.getJSON( "options.json" ).done(function( data ) {
      //  $("#msg").append('getJSON ok');
      
        $.each(data,function(index,d) {
            var attr = '';
            var jsClass = 'JS' + d.actions.action;
            var target = d.actions.target;

            // On transforme toutes les options des boutons en attributs html pour les utilser facilement
            $.each(d.actions,function(i,opt) {
               // $("#msg").append(i);
               attr    += ' data-' + i + '="' + opt + '"';
            });

            // On genere les boutons en html
            var btn = '<p><a id="btn' + d.id + '" class="JSaction"' + attr + ' target="' + target + '">' + d.name + '</a></p>';

            // On envoie les liens crees dans l'html
            $(".btnActions").append(btn);

            // On alimente le tableau qui contient les ids
            keys_id.push(d.id);

        });
    // En cas d'erreur lors de la lecture du fichier json
    }).fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        $("#msg").append('err=' + err);
    });

    // On recupere l'url de l'onglet actif pour le passer en parametre de la fonction action
    getCurrentTabUrl(function(url) {
        action(url);
    });
   
    // On cree des raccourcis claviers pour chaque bouton
    var keys = {};
    onkeydown = onkeyup = function (e) {
        keys[e.keyCode] = e.type === 'keydown';
        for (id in keys_id) {
            var keynb = parseInt(id)+49;
            // Le premier bouton a pour raccourci la touche "1", le deuxieme la touche "2" ...
            if (keys[keynb]) {
                $('#btn'+keys_id[id]).trigger('click');
            }
        }
    }
}

function action(url) {
    var params = getUrlVars(url);
    $(".JSaction").on("click", function() {

        // Si l'action est de type param, on ajoute le nom et la valeur du param à la fin de l'url
        if ($(this).data('action') == 'param') {
            var params = getUrlVars(url);
            var sep_param = params == "" ? "?" : "&";
            new_url = url + sep_param + $(this).data('code');
        }

        // Si l'action est de type change, on recherche la chaine code1 dans l'url et on la remplace par la chaine code2
        else if ($(this).data('action') == 'change') {
           new_url = url.replace($(this).data('code1'), $(this).data('code2'));
        }

       /* if ($(this).data('target') == 'blank') {
            window.open(new_url);
        }
        else {
            $( window ).load(new_url);
        }*/

        // On ouvre un onglet avec le nouvel url
        window.open(new_url);
        
    });
   
}
