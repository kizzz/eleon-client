import { Component, OnInit, ViewChild  } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { EventClickArg } from '@fullcalendar/core';
import { Calendar } from '@fullcalendar/core';
import listPlugin from '@fullcalendar/list';
import { CalendarOptions } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  standalone: false,
  selector: 'app-calendar-display',
  templateUrl: './calendar-display.component.html',
  styleUrls: ['./calendar-display.component.scss']
})
export class CalendarDisplayComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @ViewChild('calendar') calendar: Calendar;

  calendarOptions: CalendarOptions = {
    plugins: [ dayGridPlugin, googleCalendarPlugin,listPlugin, interactionPlugin ],
    googleCalendarApiKey: 'AIzaSyDUeNtu6FoFi-jUQVAeAbNr_Cq2WWjxMt4',
    events: {
      googleCalendarId: 'd0in51q1t3o3plpkunc8a9edjc@group.calendar.google.com',
      className: 'gcal-event',
      color: 'white',
      textColor: 'white',
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,listMonth'
    },
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
  };

  handleDateClick(arg: any): void {
    const clickedDate = new Date(arg?.date);
    const formattedDate = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(clickedDate);
    alert('Selected date: ' + formattedDate);
  }

  handleEventClick(arg: EventClickArg): void {
    arg.jsEvent.preventDefault();
    if (arg.event.url) {
      window.open(arg.event.url);
    }
  }
}
