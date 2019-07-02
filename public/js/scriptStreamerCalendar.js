var modalEvent = `
<div id="myModal2" class="modal col-12">
    <div class="modal-content form-group">
        <span id="close2" class="close">&times;</span>
        <form id="eventDelete" action="{{ path('delete') }}" method="POST" class="form-group col-12">
        <input type="submit" class="btn btn-danger" value="supprimer">
        </form>
    </div>
</div>`;
var modalNewEvent = `
<div id="myModal1" class="modal col-12">
    <div class="modal-content">
        <span id="close1" class="close">&times;</span>
        <form id="event" action="{{ path('insert') }}" method="POST" class="form-group col-12" >
            <input type="text" id="bloodhound" name="title" placeholder="titre" class="form-control typeahead">
            <input type="text" name="description" placeholder="description" class="form-control">
            <input type="text" name="start" class="form-control" style="display:none">
            <input type="text" name="end" class="form-control" style="display:none">
            <input type="submit" class="btn btn-primary">
        </form>
    </div>
</div>`;


document.addEventListener('DOMContentLoaded', () => {
    var calendarEl = document.getElementById('streamerCalendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        slotDuration: '01:00:00', /* If we want to split day time each 15minutes */
        minTime: '05:00:00', /* calendar start Timing */
        maxTime: '24:00:00',  /* calendar end Timing */
        plugins: [ 'dayGrid', 'timeGrid', 'bootstrap', 'interaction' ],
        defaultView: 'timeGridWeek',
        locale: 'fr',
        themeSystem: "bootstrap",
        handleWindowResize: true,
        height: 600,
        contentHeight: 550,
        dayNumber: true,
        footer: true,
        editable:true,
        selectable:true,
        allDaySlot: false,
        navLink: true,
        columnHeaderHtml: function(date) {
            switch (date.getUTCDay()) {
                case 1:
              return '<b>lundi </b>' + date.getDate();
                case 2:
              return '<b>mardi </b>' + date.getDate();
                case 3:
              return '<b>mercredi </b>' + date.getDate();
                case 4:
              return '<b>jeudi </b>' + date.getDate();
                case 5:
              return '<b>vendredi </b>' + date.getDate();
                case 6:
              return '<b>samedi </b>' + date.getDate();
                case 0:
              return '<b>dimanche </b>' + date.getDate();
            }
          },
        
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventRender: function(info) {
            var tooltip = new Tooltip(info.el, {
                html:true,
                title: '<div class="card"><div class="card-body"><p class="card-title font-weight-bold" style="wrap: nowrap; border-bottom:solid #0069D9 1px;" >' + info.event.title + '</p><p class="card-text"><br>' + info.event.extendedProps.description+'</p></div></div>',
                placement: 'top',
                trigger: 'hover',
                container: 'body'
            });
        },
        events:{
            url : targetExtract
        },
        timeZone: 'UTC',
        themeSystem: 'bootstrap',
        
        eventDrop: function(info){
            $.ajax({
                type: "POST",
                url: targetUpdateDrop,
                dataType: "json",
                data: {start: info.event._instance.range.start.toISOString(), end: info.event._instance.range.end.toISOString(), publicId: info.event._def.publicId },
                success: function(data){
                    if(data.success){
                        $('.tooltip').remove();
                        calendar.refetchEvents();
                        $('.navbar').after('<p style="background-color: rgba(114, 124, 113, 0.8); position: absolute;" class="rounded  col-12 col-md-2 success text-white text-center"><i class="fas fa-check"></i> évènement déplacé avec succès</p>');
                        setTimeout(function(){
                            $('.success').remove();
                        }, 4000);
                    }
                    if(data.error){
                        $('.navbar').after('<p style="background-color: rgba(224, 100, 100, 0.8);position: absolute;" class="col-12 col-md-2 error text-white text-center"><i class="fas fa-exclamation-circle"></i> problème rencontré</p>');
                        setTimeout(function(){
                            $('.success').remove();
                        }, 4000);
                    }
                },
            })
        },       
        eventResize: function(info){
            $.ajax({
                type: "POST",
                url: targetUpdateResize,
                dataType: "json",
                data: {end: info.event._instance.range.end.toISOString(), publicId: info.event._def.publicId},
                success: function(data){
                    if(data.success){
                        $('.tooltip').remove();
                        calendar.refetchEvents();
                        $('.navbar').after('<p style="background-color: rgba(114, 124, 113, 0.8); position: absolute;" class="rounded mb-3 mx-auto col-12 col-md-2 success text-white text-center"><i class="fas fa-check"></i> évènement modifié avec succès</p>');
                        setTimeout(function(){
                            $('.success').remove();
                        }, 4000);


                    }else{
                        $('.navbar').after('<p style="background-color: rgba(224, 100, 100, 0.8);position: absolute;" class="mx-auto col-12 col-md-2 error text-white text-center"><i class="fas fa-exclamation-circle"></i> problème rencontré</p>');
                        setTimeout(function(){
                            $('.error').remove();
                        }, 4000);
                    }

                }, error: function(data){
                    if(data.error){
                    }
                }
            })
        },
        select: function(info){
            $('.error').remove();
            $('p.success').remove();
            //add a listener on the div modalPlace et on cree un formulaire modal
            var $modal = $('#modalPlace');
            $modal.append(modalNewEvent);
            var activity = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.whitespace,
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                
                local: activities
                });
        
                $('#bloodhound.typeahead').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'activity',
                    source: activity
                });
        
            $('#close1').click(function(){
                $('#myModal1').remove();
            });
            $('input[name=start]').val(info.startStr);
            $('input[name=end]').val(info.endStr);
            $('form').submit(function(e){
                var $title = $('input[name=title]').val();
                var $description = $('input[name=description]').val();
                var $form = $(this);
                e.preventDefault();
                
                if($title.length ==0){
                    $($title).after('<p class="bg-danger error text-white text-center"></p><i class="fas fa-exclamation-circle"></i> le champs titre ne peut pas être vide</p>')
                }
                if($('.error').length == 0){
                    //si pas d'ereur, on fait la requête AJAX pour traiter le formulaire et joindre la base de données
                    $.ajax({
                        type: "POST",
                        url: targetInsert,
                        dataType: 'json',
                        data: $form.serialize(),
                        success: function(data){
                            if(data.success){
                                $('.navbar').after('<p style="background-color: rgba(114, 124, 113, 0.8); position: absolute;" class="rounded mx-auto col-12 col-md-2 success text-white text-center"><i class="fas fa-check"></i> évènement créé avec succès</p>');
                                $('#myModal1').remove();
                                setTimeout(function(){
                                    $('.success').remove();
                                }, 4000);
                                
                                calendar.refetchEvents();
                            }else{
                                $('#myModal1').remove();
                                $('.navbar').after('<p style="background-color: rgba(224, 100, 100, 0.8);position: absolute;" class="mx-auto col-12 col-md-2 error text-white text-center"><i class="fas fa-exclamation-circle"></i> ce jeux ne fait pas parti de vos activités</p>');
                                setTimeout(function(){
                                    $('.error').remove();
                                }, 4000);
                            }
                        },
                        error: function(data){
                            if(data.errors){
                                $('.navbar').after('<p style="background-color: rgba(224, 100, 100, 0.8);position: absolute;" class="mx-auto col-12 col-md-2 error text-white text-center">pb bdd</p>');
                                setTimeout(function(){
                                    $('.error').remove();
                                }, 4000);
                            }
                        }
                    })                            
                }
            })
        },
        eventClick: function(info){
            var $modal = $('#modalPlace');
            $modal.append(modalEvent);
            $('#myModal2').css('display', 'block');
            $('.eventInfo').remove();
            $('#close2').after('<p class="eventInfo">titre : ' + info.event._def.title + '<br>description : ' + info.event._def.extendedProps.description + '</p>');
            $('#close2').click(function(){
                $('#myModal2').remove();
            });
            $('#eventDelete').submit(function(e){
                e.preventDefault();
                $.ajax({
                    type: 'POST',
                    url: deleteTarget,
                    dataType: 'json',
                    data:{publicId: info.event._def.publicId},
                    success: function(data){
                        if(data.success){
                            $('.navbar').after('<p style="background-color: rgba(114, 124, 113, 0.8); position: absolute;" class="rounded mx-auto col-12 col-md-2 success text-white text-center"><i class="fas fa-check"></i> évènement supprimé avec succès</p>');
                            $('#myModal2').remove();
                            setTimeout(function(){
                                $('.success').remove();
                            }, 4000);
                            calendar.refetchEvents();
                        }
                    },
                    error: function(data){
                        $('#myModal2').remove();
                        $('.navbar').after('<p style="background-color: rgba(224, 100, 100, 0.8);position: absolute;" class="mx-auto col-12 col-md-2 error text-white text-center">échec de suppression</p>');
                        setTimeout(function(){
                            $('.error').remove();
                        }, 4000);
                    }
                })

            })
        }
        
    });
    calendar.render();
});
   