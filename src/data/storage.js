import { getISOWeek } from 'date-fns'

export function getCurrentWeek() {
  return getISOWeek(new Date())
}
