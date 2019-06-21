$(function(){

    var calendarEl = document.getElementById('viewerCalendar');

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
        footer: true,
        selectable:true,
        allDaySlot: false,
        navLink: true,
        columnHeaderHtml: function(date) {
            switch (date.getUTCDay()) {
                case 1:
              return '<p>lundi </b>' + date.getDate();
                case 2:
              return '<p>mardi </b>' + date.getDate();
                case 3:
              return '<p>mercredi </b>' + date.getDate();
                case 4:
              return '<p>jeudi </b>' + date.getDate();
                case 5:
              return '<p>vendredi </b>' + date.getDate();
                case 6:
              return '<p>samedi </b>' + date.getDate();
                case 0:
              return '<p>dimanche </>' + date.getDate();
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
            $(mouseEnterInfo.el).css('background-color', 'black');
            
        },
        eventMouseLeave: function(mousEventLeave){
            $(mousEventLeave.el).css('background-color', 'orange');
        },
        events:{
          url: extractFavoritesEvents,
          color: 'orange'
        },
        timeZone: 'UTC',
        themeSystem: 'bootstrap',
        
        
        eventClick: function(info){
            console.log(info.event._def.title);
            console.log(info.event._def.extendedProps.description);
        }
    });
    calendar.render();
});