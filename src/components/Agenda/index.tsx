import React, { ReactElement, useContext, useMemo, useState, useEffect } from 'react'
import { DateTime } from 'luxon'

import greeting from 'lib/greeting'

import Calendar from 'src/models/Calendar'
import Event from 'src/models/Event'
import AccountContext from 'src/context/accountContext'

import List from './List'
import EventCell from './EventCell'

import style from './style.scss'

type AgendaItem = {
  calendar: Calendar
  event: Event
}

const compareByDateTime = (a: AgendaItem, b: AgendaItem) =>
  a.event.date.diff(b.event.date).valueOf()

/**
 * Agenda component
 * Displays greeting (depending on time of day)
 * and list of calendar events
 */

const Agenda = (): ReactElement => {
  const account = useContext(AccountContext);
  const [hour, setHour] = useState(DateTime.local().hour);
  const [filterIndex, setFilterIndex] = useState(0);
  const [calendarsToLoad, setCalendarsToLoad] = useState(account.calendars);
  const [isSortedByDepartment, setIsSortedByDepartment] = useState(false)

  //Level 1: Agenda's title bug fix
  //Bug was caused by 'title' having no dependencies as the second argument of its useMemo(), this resulted in title's value only being initialized, but never updating
  //to fix the bug I created an 'hour' state that tracks the current hour, and used that as a dependency so 'title' updates every time the hour changes
  useEffect(() => {
    setInterval(() =>{
        let currentHour = DateTime.local().hour;
        if(hour != currentHour){
            setHour(currentHour)
        }
    }, 60000)
  }, []);

  //Level 3: Filter agenda events by calendar
  //To implement this feature I created a filterIndex state and a calendarsToLoad state
  useEffect(() => {
      if(filterIndex != 0){
        setCalendarsToLoad([account.calendars[filterIndex - 1]]);//subtract 1: '0' spot is occupied by "All"
      }
      else{setCalendarsToLoad(account.calendars)};
  }, [filterIndex]);

  const handleFilterSelection = () => {
    let selectElement = document.getElementById('SelectFilter') as HTMLSelectElement;
    setFilterIndex(selectElement.selectedIndex);
  }

  //Level 4: I ran out of time on this one.  The button is implemented and connected to a state - isSortedByDepartment.  I've set the return of Agenda to render different code/html depending on this state (line 101).
  //in terms of the approach/logic for the remainder of this implementation, I would need to add some additional logic to reorganize/sort the events array into separate arrays based on department (if isSortedByDepartment === true)
  //then I would iterate/map through those - displaying each sections title, and its corresponding events
  const events: AgendaItem[] = useMemo(
    () =>
    calendarsToLoad
        .flatMap((calendar) =>
          calendar.events.map((event) => ({ calendar, event })),
        )
        .sort(compareByDateTime),
    [account, calendarsToLoad],
  )
  const title = useMemo(() => greeting(hour), [hour]);
  const disconnectedErrorMessage = account.isDisconnected ? <div className={style.errorMessage}>Experiencing connection issues: list may not be up to date</div> : "";

  return (
    <div className={style.outer}>
      <div className={style.container}>
        <div className={style.header}>
          <span className={style.title}>{title}</span>
        </div>

        <div className={style.filterSelectContainer}>
          <select className={style.filterSelect} id={"SelectFilter"} onChange={handleFilterSelection}>
            <option key={0}>All</option>
            {account.calendars.map((calendar, i) =>
              <option key={i + 1} className={style.filterSelectOption} style={{color: calendar.color}}>{calendar.id}</option>
            )}
          </select>
          <button className={style.sortByDepartment} onClick={() => setIsSortedByDepartment(!isSortedByDepartment)}>
              Sort By Department
          </button>
        </div>

        {disconnectedErrorMessage}
        
        <List>
        
          {
          isSortedByDepartment ? 
            //TO DO: 
            <div>
              {
                events.map(({ calendar, event }) => (
                  <EventCell key={event.id} calendar={calendar} event={event} />
                ))
              }
              {/* for testing */}
              <span>Sort By Department</span>
            </div>
            //end TO DO

            ://else
            events.map(({ calendar, event }) => (
              <EventCell key={event.id} calendar={calendar} event={event} />
            ))
          }

        </List>

      </div>
    </div>
  )
}

export default Agenda
