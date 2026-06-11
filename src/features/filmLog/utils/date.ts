export function toDateOnlyString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatWatchedDateLabel(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function parseDateOnly(value: string | null) {
  if (!value) {
    return startOfDay(new Date());
  }

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return startOfDay(new Date());
  }

  return startOfDay(new Date(year, month - 1, day));
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  return startOfDay(next);
}

export function isSameDay(a: Date, b: Date) {
  return toDateOnlyString(a) === toDateOnlyString(b);
}

export function isSameMonth(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  );
}

export function isAfterDay(a: Date, b: Date) {
  return toDateOnlyString(a) > toDateOnlyString(b);
}

export type CalendarCell = {
  key: string;
  date: Date | null;
};

export function buildCalendarCells(
  monthDate: Date,
  maxDate: Date,
): CalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ key: `empty-start-${i}`, date: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = startOfDay(new Date(year, month, day));
    if (!isAfterDay(date, maxDate)) {
      cells.push({ key: toDateOnlyString(date), date });
    } else {
      cells.push({ key: `disabled-${day}`, date: null });
    }
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `empty-end-${cells.length}`, date: null });
  }

  return cells;
}
