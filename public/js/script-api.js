        // our Twitch Client ID to access the API service
        var ClientID = '04zu3b1v2s1h7dpk5m4om1q6mgck5s';

        // function to display a colored message
        function displayMsg(msg, color){
            $('#infos').append('<p class="center" style="color:' + color + ';">' + msg + '</p>');
        }

        // Function to apply a semi transparent black overlay on the whole page with a loading logo (svg format) at the middle
        function setOverlay(){
            $('body').append(`
            <div class="overlay">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path stroke="none" d="M30 50A20 20 0 0 0 70 50A20 22 0 0 1 30 50" fill="#FF0000"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 51;360 50 51" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></path></svg>
            </div>`);
        }

        // Function to cancel overlay feature
        function removeOverlay(){
            $('.overlay').remove();
        }

        // Function to create a #view to display Ajax inqiry response.
        function initView(){
            //$('#view').remove();
            $('body').append('<div id="view"></div>');
        }

        
        // AJAX query function to fetch user info from Twitch API 
        function getUserById(identif) {
            $.ajax({
                type: 'GET',
                url: 'https://api.twitch.tv/helix/users?id=' + identif,    // we fetch the users 
                dataType: 'json',
                timeout: 30000,
                headers: {
                    'Client-ID': ClientID
                },
                complete: function(){
                    // once request is over, we remove the overlay
                    removeOverlay();
                },
                success: function(data){
                    console.log(data);
                    // call function to prepare location where to display request response
                    initView();

                    let i=1;
                    data.data.forEach(function(user){
                        console.log(user);
                        $('#view').append(`
                        <p class="left">user by ID ` + i + ` ---------------------------------------------------- </p>
                        <p class="left">User id : ` + user.id + `</p>
                        <p class="left">User login : ` + user.login + `</p>
                        <p class="left">User display name : ` + user.display_name + `</p>
                        <p class="left">User profile image url : ` + user.profile_image_url + `</p>
                        <p class="left">User description : ` + user.description + `</p>                        
                        <p class="left">User View count : ` + user.view_count + `</p>`);
                        i++;
                    });    
                },
                error: function(){
                    // If Ajax request fails, we display error message
                    displayMsg('Erreur lors de la récupération des données');
                }
            });
        }

        // AJAX query function to fetch user info from Twitch API 
        function getUserByLogin(identif) {
            $.ajax({
                type: 'GET',
                url: 'https://api.twitch.tv/helix/users?login=' + identif,    // we fetch the users 
                dataType: 'json',
                timeout: 30000,
                headers: {
                    'Client-ID': ClientID
                },
                complete: function(){
                    // once request is over, we remove the overlay
                    removeOverlay();
                },
                success: function(data){
                    console.log(data);
                    // call function to prepare location where to display request response
                    initView();

                    let i=1;
                    data.data.forEach(function(user){
                        console.log(user);
                        $('#view').append(`
                        <p class="left">user by Login ` + i + ` ---------------------------------------------------- </p>
                        <p class="left">User id : ` + user.id + `</p>
                        <p class="left">User login : ` + user.login + `</p>
                        <p class="left">User display name : ` + user.display_name + `</p>
                        <p class="left">User profile image url : ` + user.profile_image_url + `</p>
                        <p class="left">User description : ` + user.description + `</p>                        
                        <p class="left">User View count : ` + user.view_count + `</p>`);
                        i++;
                    });    
                },
                error: function(){
                    // If Ajax request fails, we display error message
                    displayMsg('Erreur lors de la récupération des données');
                }
            });
        }

        // AJAX query function to fetch top 20 game list from Twitch API
        function getGameTop100(){
            $.ajax({
                type: 'GET',
                url: 'https://api.twitch.tv/helix/games/top?first=100',    // we fetch the current top 100 game list 
                dataType: 'json',
                timeout: 30000,
                headers: {
                    'Client-ID': ClientID
                },
                complete: function(){
                    // once request is over, we remove the overlay
                    removeOverlay();
                },
                success: function(data){
                    console.log(data);
                    // call function to prepare location where to display request response
                    initView();

                    let i=1;

                    data.data.forEach(function(game){
                        console.log(game);
                        $('#view').append(`
                        <p class="left">game ` + i + ` ---------------------------------------------------- </p>
                        <p class="left">` + game.id + `</p>
                        <p class="left">` + game.name + `</p>
                        <p class="left">` + game.box_art_url + `</p>`);
                        i++;
                    });    
                },
                error: function(){
                    // If Ajax request fails, we display error message
                    displayMsg('Erreur lors de la récupération des données');
                }
            });
        }
