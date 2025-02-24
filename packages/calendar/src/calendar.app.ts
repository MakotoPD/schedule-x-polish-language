import { createElement, render } from 'preact'
import CalendarWrapper from './components/calendar-wrapper'
import CalendarAppSingleton from '@schedule-x/shared/src/interfaces/calendar/calendar-app-singleton'
import EventsFacade from '@schedule-x/shared/src/utils/stateful/events-facade/events-facade.interface'
import EventsFacadeImpl from '@schedule-x/shared/src/utils/stateful/events-facade/events-facade.impl'
import { CustomComponentFn } from '@schedule-x/shared/src/interfaces/calendar/calendar-config'

export default class CalendarApp {
  public events: EventsFacade

  constructor(private $app: CalendarAppSingleton) {
    this.events = new EventsFacadeImpl(this.$app)
  }

  render(el: HTMLElement): void {
    render(createElement(CalendarWrapper, { $app: this.$app }), el)
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.$app.calendarState.isDark.value = theme === 'dark'
  }

  /**
   * @internal
   * Purpose: To be consumed by framework adapters for custom component rendering.
   * */
  _setCustomComponentFn(
    fnId:
      | 'timeGridEvent'
      | 'dateGridEvent'
      | 'monthGridEvent'
      | 'monthAgendaEvent',
    fn: CustomComponentFn
  ) {
    this.$app.config._customComponentFns[fnId] = fn
  }
}
