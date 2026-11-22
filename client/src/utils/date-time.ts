export type ISODate = { __TYPE__: 'ISODate' } & string;
export type ISODateTime = { __TYPE__: 'ISODateTime' } & string;

const LOCALE = 'sv';
const MS_PER_DAY = 86_400_000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

const dayHeadingFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
});

const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

class DateUtilsImpl {
  private toDate(value: Date | ISODate | ISODateTime): Date {
    if (value instanceof Date) return value;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(value);
  }

  toISODate(value: Date | ISODateTime): ISODate {
    const date = this.toDate(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}` as ISODate;
  }

  toISODateTime(date: Date | string): ISODateTime {
    const dateToConvert = typeof date === 'string' ? new Date(date) : date;
    return dateToConvert.toISOString().replace(/\.\d+Z$/, 'Z') as ISODateTime;
  }

  formatTime(value: Date | ISODateTime): string {
    return timeFormatter.format(this.toDate(value));
  }

  formatShortDate(value: Date | ISODate | ISODateTime): string {
    return shortDateFormatter.format(this.toDate(value));
  }

  formatDayHeading(value: Date | ISODate | ISODateTime): string {
    const formatted = dayHeadingFormatter.format(this.toDate(value));
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  formatWeekRange(monday: Date): string {
    return `${this.formatShortDate(monday)} – ${this.formatShortDate(this.addDays(monday, 6))}`;
  }

  addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  getFirstDayOfWeek(value: Date | ISODateTime = new Date()): Date {
    const date = this.toDate(value);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    return this.addDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), diffToMonday);
  }

  getLastDayOfWeek(value: Date | ISODateTime = new Date()): Date {
    return this.addDays(this.getFirstDayOfWeek(value), 6);
  }

  getWeekOffset(target: Date | ISODateTime, base: Date = new Date()): number {
    const targetMonday = this.getFirstDayOfWeek(target);
    const baseMonday = this.getFirstDayOfWeek(base);
    return Math.round((targetMonday.getTime() - baseMonday.getTime()) / MS_PER_WEEK);
  }

  getISOWeekNumber(date: Date): number {
    const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
    const yearStart = Date.UTC(thursday.getUTCFullYear(), 0, 1);
    return Math.ceil(((thursday.getTime() - yearStart) / MS_PER_DAY + 1) / 7);
  }
}

export const DateUtils = new DateUtilsImpl();
