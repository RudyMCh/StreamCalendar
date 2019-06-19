document.addEventListener('DOMContentLoaded', () => {
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
        contentHeight: 350,
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
        
        
        eventClick: function(info){
            console.log(info);
        }
    });
    calendar.render();
});