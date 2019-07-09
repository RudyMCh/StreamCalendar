$(function(){

    var calendarEl = document.getElementById('viewerCalendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        slotDuration: '01:00:00', /* If we want to split day time each 15minutes */
        minTime: '05:00:00', /* calendar start Timing */
        maxTime: '24:00:00',  /* calendar end Timing */
        plugins: [ 'dayGrid', 'timeGrid', 'bootstrap', 'interaction' ],
        defaultView: 'timeGridWeek',
        locale: 'fr',
        handleWindowResize: true,
        height: 600,
        contentHeight: 550,
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
        //mise en place des tooltips
        eventRender: function(info) {
            var tooltip = new Tooltip(info.el, {
              html: true,
                title: '<div class="card"><div class="card-body"><p class="card-title font-weight-bold" style="wrap: nowrap; border-bottom:solid #0069D9 1px;" >' + info.event.extendedProps.streamer + '</p><p class="card-text"><br>' + info.event.extendedProps.description+'</p></div></div>',
                placement: 'top',
                trigger: 'hover',
                container: 'body'
            });
        },
        events:{
          url: extractFavoritesEvents
        },
        timeZone: 'UTC',
        themeSystem: 'bootstrap',
    });
    calendar.render();
});