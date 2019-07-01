// Function to create a view #infoGames to display Ajax inqiry response.
function initView(){
    $('body').append('<div id="infoGames"></div>');
    }

// Function to set an overlay over the current page
function setOverlay(){
    $('body').append(`
    <div class="overlay">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path stroke="none" d="M30 50A20 20 0 0 0 70 50A20 22 0 0 1 30 50" fill="#FF0000"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 51;360 50 51" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></path></svg>
    </div>`);
}

// Function to remove the overlay
function removeOverlay(){
    $('.overlay').remove();
}

// Function to escape HTML metacharacters (same as PHP htmlspecialchars function)
function escapeHtml(text) {
    var text1=text.toString();
    var text2=text1.replace(/[&<>"']/g, '');
    return text2;
}

// Function to assign a size in the URL of the game picture coming out from the Twitch API
function resize(pic){
    pic1=pic.replace('{width}','200');
    pic2=pic1.replace('{height}','200');
    return pic2;
}

// Function to send data through POST method
function sendPost(gcode,gname,gpic){
    setOverlay();
    $.ajax({
        type: 'POST',
        url: targetUpdateGames,
        dataType: 'json',
        data: {id: gcode, name: gname, pic: gpic},
        success: function(data) {
            document.location.reload(true);
            return true;
        },
        // we reload the page so the game list is updated (registered games won't appear anymore)
        complete: function() {
            removeOverlay();
            document.location.reload(true);
        }
    });
}

// we set the overlay before to launch AJAX quiry at page landing
setOverlay();

// AJAX query to fetch the games list from Twitch API, query is launched when page is loaded
$.ajax({
    type: 'GET',
    url: 'https://api.twitch.tv/helix/games/top?first=100',    // we fetch the current top 100 game list 
    dataType: 'json',
    timeout: 30000,
    headers: {
        'Client-ID': '04zu3b1v2s1h7dpk5m4om1q6mgck5s'
    },
    success: function(data){
        // console.log(data);
        // call function to prepare location where to display request response
        initView();
        data.data.forEach(function(game){ // we display results using bootstrap cards feature
            alreadyIs = false;
            //console.log(gList);
            gList.forEach(function(gL){
                //console.log(gL);
                if (gL == game.id){
                    alreadyIs=true;
                    return;
                }
            });

            if (alreadyIs==false){
                $('#infoGames').after(`
                <div class="card mb-3 col-2 text-center">
                    <img class="card-img-top " src="` + escapeHtml(resize(game.box_art_url)) + `" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">TITRE: `+ escapeHtml(game.name) +`</h5>
                        <p class="card-text">`+escapeHtml(game.id)+`</p>
                        <a href="#" class="btn btn-primary" onclick="sendPost('`+escapeHtml(game.id)+`','`+escapeHtml(game.name)+`','`+escapeHtml(game.box_art_url)+`')">Ajouter ce jeu en base de données</a>
                    </div>
                </div>`);
            }

        });    
    },
    complete: function(){
        // Once the query is completed then we cancel the overlay
        removeOverlay();
    },
    error: function(){
        // If Ajax request fails, we display error message
        //displayMsg('Erreur lors de la récupération des données');
        removeOverlay();
    }
});
