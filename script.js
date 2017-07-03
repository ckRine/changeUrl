
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


// Ajout d'un param
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
    var keys_id = [];

    $.getJSON( "options.json" ).done(function( data ) {
      //  $("#msg").append('getJSON ok');
        $.each(data,function(index,d) {
            var attr = '';
            var jsClass = 'JS' + d.actions.action;
            var target = d.actions.target;
            $.each(d.actions,function(i,opt) {
               // $("#msg").append(i);
               attr    += ' data-' + i + '="' + opt + '"';
            });
            var btn = '<p><a id="btn' + d.id + '" class="JSaction"' + attr + ' target="' + target + '">' + d.name + '</a></p>';
            $(".btnActions").append(btn);
            keys_id.push(d.id);
        });
    }).fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        $("#msg").append('err=' + err);
    });
    getCurrentTabUrl(function(url) {
        action(url);
    });
   
    var keys = {};
    onkeydown = onkeyup = function (e) {
        keys[e.keyCode] = e.type === 'keydown';
        for (id in keys_id) {
            var keynb = parseInt(id)+49;
            if (keys[keynb]) {
                $('#btn'+keys_id[id]).trigger('click');
            }
        }
    }
}

function action(url) {
    var params = getUrlVars(url);
    $(".JSaction").on("click", function() {

        if ($(this).data('action') == 'param') {
            var params = getUrlVars(url);
            var sep_param = params == "" ? "?" : "&";
            new_url = url + sep_param + $(this).data('code');
        }
        else if ($(this).data('action') == 'change') {
           new_url = url.replace($(this).data('code1'), $(this).data('code2'));
        }

       /* if ($(this).data('target') == 'blank') {
            window.open(new_url);
        }
        else {
            $( window ).load(new_url);
        }*/

        window.open(new_url);
        
    });
   
}
