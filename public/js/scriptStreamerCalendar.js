function setError($input, msgText){
    $input.after('<p class="error bg-warning" style="color:red;">' + msgText + '</p>');
}
var modalEvent = `
<div id="myModal2" class="modal col-12">
    <div class="modal-content form-group">
        <span id="close2" class="close">&times;</span>
    </div>
</div>`;
var modalNewEvent = `
<div id="myModal1" class="modal col-12">
    <div class="modal-content">
        <span id="close1" class="close">&times;</span>
        <form id="event" action="{{ path('insert') }}" method="POST" class="form-group col-12" >
            <input type="text" name="title" placeholder="titre" class="form-control">
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
        contentHeight: 500,
        editable:true,
        selectable:true,
        allDaySlot: false,
        navLink: true,
        columnHeaderHtml: function(date) {
            switch (date.getUTCDay()) {
                case 1:
              return '<b>lundi</b>';
                case 2:
              return '<b>mardi</b>';
                case 3:
              return '<b>mercredi</b>';
                case 4:
              return '<b>jeudi</b>';
                case 5:
              return '<b>vendredi</b>';
                case 6:
              return '<b>samedi</b>';
                case 0:
              return '<b>dimanche</b>';
            }
          },
        
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventRender: function(info) {
            var tooltip = new Tooltip(info.el, {
                title: info.event.extendedProps.description,
                placement: 'top',
                trigger: 'hover',
                container: 'body'
            });
        },
        eventMouseEnter: function(mouseEnterInfo){
            console.log(mouseEnterInfo);
            $(mouseEnterInfo.el).css('background-color', 'black');
            
        },
        eventMouseLeave: function(mousEventLeave){
            $(mousEventLeave.el).css('background-color', 'blue');
        },
        events:{
            url : targetExtract,
            color: 'blue'
        },
        timeZone: 'UTC',
        themeSystem: 'bootstrap',
        
        eventDrop: function(info){
            console.log(info);
            console.log(info.event._def.publicId);
            console.log(info.event._instance.range.start.toISOString());
            console.log(info.event._instance.range.end.toISOString());
            $.ajax({
                type: "POST",
                url: targetUpdateDrop,
                dataType: "json",
                data: {start: info.event._instance.range.start.toISOString(), end: info.event._instance.range.end.toISOString(), publicId: info.event._def.publicId },
                success: function(data){
                    if(data.success){
                        console.log("ok");
                        console.log(data.info);
                    }
                    if(data.error){
                        console.log(data.event);
                    }
                },
            })
        },       
        eventResize: function(info){
            console.log('resize');
            console.log(info);
            $.ajax({
                type: "POST",
                url: targetUpdateResize,
                dataType: "json",
                data: {end: info.event._instance.range.end.toISOString(), publicId: info.event._def.publicId},
                success: function(data){
                    if(data.success){
                        console.log("ok");
                    }else{
                        console.log("pas ok");
                    }

                }, error: function(data){
                    if(data.error){
                        console.log("erreur ajax");
                    }
                }
            })
        },
        select: function(info){
            console.log("début : " + info.start.toISOString() + " to " + info.endStr);
            console.log(info);
            $('.error').remove();
            $('p.success').remove();
            //add a listener on the div modalPlace et on cree un formulaire modal
            var $modal = $('#modalPlace');
            $modal.append(modalNewEvent);
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
                    setError($title, 'champ titre vide');
                }
                if($description.length ==0){
                    setError($description, 'champ activité vide');
                }
                if($('.error').length == 0){
                    console.log("demo Form : " + $form.serialize());
                    //si pas d'ereur, on fait la requête AJAX pour traiter le formulaire et joindre la base de données
                    $.ajax({
                        type: "POST",
                        url: targetInsert,
                        dataType: 'json',
                        data: $form.serialize(),
                        success: function(data){
                            if(data.success){
                                $('.success').remove();
                                $('.info').after('<p class="success bg-success" style="color:white">évènement créé avec succès</p>');
                                $('#myModal1').remove();
                                calendar.refetchEvents();
                            }else{
                                console.log(data.errors)
                                setError($(".info"), "erreur bdd");
                            }
                        },
                        error: function(data){
                            if(data.errors){
                                setError($description, "pb bdd");
                            }
                        }
                    })                            
                }
            })
        },
        eventClick: function(info){
            console.log(info);
            var $modal = $('#modalPlace');
            $modal.append(modalEvent);
            $('#myModal2').css('display', 'block');
            $('.eventInfo').remove();
            $('#close2').after('<p class="eventInfo">titre : ' + info.event._def.title + '<br>description : ' + info.event._def.extendedProps.description + '</p>');
            $('#close2').click(function(){
                $('#myModal2').remove();
            });
        }
        
    });
    calendar.render();
});
   