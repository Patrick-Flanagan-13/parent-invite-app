import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Los_Angeles';

/**
 * Converts a local date string (e.g. "2023-10-27T10:00") from the app's timezone
 * to a UTC Date object for storage.
 */
export function parseInputDate(dateString: string): Date {
    if (!dateString) return new Date(NaN);
    // Treat the input string as being in the target timezone
    return fromZonedTime(dateString, TIMEZONE);
}

/**
 * Formats a UTC Date object to the app's timezone for display or input value.
 * Returns string in "YYYY-MM-DDTHH:mm" format.
 */
export function formatForInput(date: Date): string {
    const zonedDate = toZonedTime(date, TIMEZONE);
    // Format manually to YYYY-MM-DDTHH:mm to avoid locale issues
    const pad = (n: number) => n.toString().padStart(2, '0');
    const YYYY = zonedDate.getFullYear();
    const MM = pad(zonedDate.getMonth() + 1);
    const DD = pad(zonedDate.getDate());
    const HH = pad(zonedDate.getHours());
    const mm = pad(zonedDate.getMinutes());
    return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
}

/**
 * Returns the timezone used by the application.
 */
export function getAppTimezone(): string {
    return TIMEZONE;
}

// Format date and time for conference slots
export function formatSlotDateTime(startTime: Date, endTime: Date, hideEndTime: boolean = false): {
    dateStr: string
    timeStr: string
} {
    // Check if same day using the target timezone
    const startStr = startTime.toLocaleDateString('en-US', { timeZone: TIMEZONE });
    const endStr = endTime.toLocaleDateString('en-US', { timeZone: TIMEZONE });
    const sameDay = startStr === endStr;

    // Format date
    const dateStr = startTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: TIMEZONE
    })

    // Format time
    const startTimeStr = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: TIMEZONE
    })

    const endTimeStr = endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: TIMEZONE
    })

    const timeStr = hideEndTime ? startTimeStr : `${startTimeStr} - ${endTimeStr}`

    return { dateStr, timeStr }
}

// Format for email (returns full formatted string)
export function formatSlotDateTimeForEmail(startTime: Date, endTime: Date, hideEndTime: boolean = false): string {
    const { dateStr, timeStr } = formatSlotDateTime(startTime, endTime, hideEndTime)
    return `${dateStr}<br>${timeStr}`
}
