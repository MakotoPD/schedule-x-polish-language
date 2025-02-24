import EventsFacade from '@schedule-x/shared/src/utils/stateful/events-facade/events-facade.interface'
import CalendarEventExternal from '@schedule-x/shared/src/interfaces/calendar/calendar-event.interface'
import { EventId } from '@schedule-x/shared/src/types/event-id'
import { CalendarAppSingleton } from '@schedule-x/shared/src'
import { externalEventToInternal } from '@schedule-x/shared/src/utils/stateless/calendar/external-event-to-internal'
import { createRecurrencesForEvent } from '../stateless/create-recurrences-for-event'
import { AugmentedEvent } from '../../types/augmented-event'

export class EventsFacadeImpl implements EventsFacade {
  constructor(private $app: CalendarAppSingleton) {}

  add(event: CalendarEventExternal): void {
    const newEvent = externalEventToInternal(event, this.$app.config)
    const newEventsList = [...this.$app.calendarEvents.list.value, newEvent]
    const rrule = newEvent._getForeignProperties().rrule

    if (rrule) {
      newEventsList.push(
        ...createRecurrencesForEvent(this.$app, newEvent, rrule as string)
      )
    }
    this.$app.calendarEvents.list.value = newEventsList
  }

  get(id: EventId): CalendarEventExternal | undefined {
    return (this.$app.calendarEvents.list.value as AugmentedEvent[])
      .find((event) => event.id === id && !event.isCopy)
      ?._getExternalEvent()
  }

  getAll(): CalendarEventExternal[] {
    return this.$app.calendarEvents.list.value
      .filter((event) => !event.isCopy)
      .map((event) => event._getExternalEvent())
  }

  remove(id: EventId): void {
    this.$app.calendarEvents.list.value =
      this.$app.calendarEvents.list.value.filter((event) => event.id !== id)
  }

  update(event: CalendarEventExternal): void {
    this.removeCopiesForEvent(event)
    const eventIndex = (
      this.$app.calendarEvents.list.value as AugmentedEvent[]
    ).findIndex((e) => e.id === event.id && !e.isCopy)
    const copiedEvents = [...this.$app.calendarEvents.list.value]
    const updatedEvent = externalEventToInternal(event, this.$app.config)
    copiedEvents.splice(eventIndex, 1, updatedEvent)
    const rrule = (updatedEvent as AugmentedEvent)._getForeignProperties().rrule
    if (rrule) {
      copiedEvents.push(
        ...createRecurrencesForEvent(
          this.$app,
          event as AugmentedEvent,
          rrule as string
        )
      )
    }
    this.$app.calendarEvents.list.value = copiedEvents
  }

  private removeCopiesForEvent(event: CalendarEventExternal) {
    this.$app.calendarEvents.list.value =
      this.$app.calendarEvents.list.value.filter(
        (e) => e.id !== event.id && !e.isCopy
      )
  }
}
