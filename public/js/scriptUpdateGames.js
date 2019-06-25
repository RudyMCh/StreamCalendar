// Function to create a #view to display Ajax inqiry response.
function initView(){
    $('body').append('<div id="infoGames"></div>');
    }

    // Function to assign a size in the URL of the game picture coming out from the Twitch API
    function resize(pic){
        pic1=pic.replace('{width}','200');
        pic2=pic1.replace('{height}','200');
        return pic2;
    }

    // Function to send data through POST method
    function sendPost(gcode,gname,gpic){
        $.ajax({
            type: 'POST',
            url: targetUpdatGames,
            dataType: 'json',
            data: {id: gcode, name: gname, pic: gpic},
            success: function(data) {
                return true;
            }
        });
    }

    // AJAX query to fetch the games list from Twitch API, query is lanched when page is loaded
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
            let i=1;
            data.data.forEach(function(game){ // we display results using bootstrap cards feature
                $('#infoGames').append(`
                <div class="card mb-3 text-center">
                    <img class="card-img-top col-4" src="` + resize(game.box_art_url) + `" alt="Card image cap">
                    <div class="card-body">
                        <h5 class="card-title">`+game.name+`</h5>
                        <p class="card-text">`+game.id+`</p>
                        <a href="#" class="btn btn-primary" onclick="sendPost('`+game.id+`','`+game.name+`','`+game.box_art_url+`')">Ajouter ce jeu en base de données</a>
                    </div>
                </div>`);
                i++;
            });    
        },
        error: function(){
            // If Ajax request fails, we display error message
            displayMsg('Erreur lors de la récupération des données');
        }
    });
