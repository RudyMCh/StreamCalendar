$("form").submit(function(e){
    e.preventDefault();
     var $name= $('input[name=action]').val();
    console.log($name);
    $.ajax({
        type: 'GET',
        url: 'https://api.twitch.tv/helix/users?login='  + $name,    // we fetch the users 
        dataType: 'json',
        timeout: 30000,
        headers: {
            'Client-ID': '04zu3b1v2s1h7dpk5m4om1q6mgck5s'
        },
        success: function(data){
            console.log("ajax " + data.id);
            $.ajax({
                type:'POST',
                url: targetUpdateStreamer,
                dataType:'json',
                data:{ twitchId: data.data[0].id, link: data.data[0].profile_image_url, name : data.data[0].display_name},
                success:function(data){
                    if(data.success){
                        console.log("enregistrement ok");
                        $('input[type=submit]').after('<p style="color:green">l\'utilisateur a été mis à jour avec ses données Twitch</p>')
                    }
                    if(data.error){
                        $('input[type=submit]').after('<p style="color:red">l\'utilisateur n\'existe pas</p>')
                    }
                },
                error: function(){
                    $('input[type=submit]').after('<p style="color:red">probleme ajax</p>')
                }
            })
        },
        error:function(){
            $('input[type=submit]').after('<p style="color:red">l\'utilisateur n\'est pas connu chez twitch</p>')
        }
    })
})