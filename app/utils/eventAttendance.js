// How people take part in an event (#347), as labelled everywhere: the
// values are the database's (`events.attendance`).
export const ATTENDANCES = [
  ['in_person', 'In person'],
  ['online', 'Online'],
  ['hybrid', 'In person and online'],
];

export const attendanceLabel = (value) =>
  ATTENDANCES.find(([key]) => key === value)?.[1] ?? 'In person';

/** The submitted attendance, or in person for anything else. */
export const parseAttendance = (value) =>
  ATTENDANCES.some(([key]) => key === value) ? value : 'in_person';

/** Whether `zone` is an IANA time zone this runtime knows. */
export function isTimeZone(zone) {
  if (!zone) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
