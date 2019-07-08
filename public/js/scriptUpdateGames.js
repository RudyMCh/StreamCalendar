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

// Function to escape HTML metacharacters (actually this function deletes the metachars from a string)
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
        url: targetsendResp,
        dataType: 'json',
        data: {id: gcode, name: gname, pic: gpic},
        success: function(data) {
            if (typeof (data.success)!='undefined') {
                if (data.success==true) {
                    console.log(data.success);
                $('#infoResult').append(`
                <h4 class="text-center mt-2 mb-4">Jeu ajouté</h4>
                `);
                }
            }
            if (typeof(data.errors)!='undefined') {
                console.log(data.errors);
                if (data.errors.AlreadyExist==true) {
                    $('#infoResult').append(`
                    <h4 class="text-center mt-2 mb-4">Ce jeu est déjà en base</h4>
                    `);
                }
            }
        },
        // once completed then we reload the page for updating the game list (registered games won't appear anymore)
        complete: function() {
            // we wait for a few seconds so the user have time enough for reading the success message
            setTimeout(function(){
                removeOverlay(); // anyway we keep the overlay till the end to prevent the user to add another game too quickly
                document.location.reload(true); // we reload the page after the few seconds
            }, 3000);
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
                <div class="card mb-3 col-10 col-sm-6 col-md-4 col-lg-2 col-xl-1 text-center">
                    <img class="card-img-top " src="` + escapeHtml(resize(game.box_art_url)) + `" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">`+ escapeHtml(game.name) +`</h5>
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
