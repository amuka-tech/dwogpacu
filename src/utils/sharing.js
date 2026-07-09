/**
 * shareContent - native Web Share API with WhatsApp/Twitter fallback
 * @param {string} title - Share title
 * @param {string} text  - Share body text
 * @param {string} url   - URL to share
 */
export async function shareContent(title, text, url = window.location.href) {
  const fullUrl = url.startsWith('http') ? url : `https://amuka-tech.github.io${url}`;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: fullUrl });
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Share failed, falling back', err);
      } else {
        return { success: false, method: 'cancelled' };
      }
    }
  }
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${text}\n${fullUrl}`);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'none' };
  }
}

/**
 * generateICS - generates a valid .ics calendar event string
 */
function pad(n) { return String(n).padStart(2, '0'); }

function toICSDate(isoDate, timeStr) {
  // isoDate: "2026-07-06", timeStr: "9:00am"
  const [year, month, day] = isoDate.split('-');
  let hours = 0, minutes = 0;
  if (timeStr) {
    const match = timeStr.match(/(\d+):(\d+)(am|pm)/i);
    if (match) {
      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
      const period = match[3].toLowerCase();
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
    }
  }
  return `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
}

function toICSEndDate(isoDate, timeStr) {
  // Match duration: 90 minutes + 15 min buffer = 105 min
  const startStr = toICSDate(isoDate, timeStr);
  const year = parseInt(startStr.substring(0, 4));
  const month = parseInt(startStr.substring(4, 6)) - 1;
  const day = parseInt(startStr.substring(6, 8));
  const hours = parseInt(startStr.substring(9, 11));
  const minutes = parseInt(startStr.substring(11, 13));

  const startDate = new Date(year, month, day, hours, minutes);
  startDate.setMinutes(startDate.getMinutes() + 105);

  return `${startDate.getFullYear()}${pad(startDate.getMonth() + 1)}${pad(startDate.getDate())}T${pad(startDate.getHours())}${pad(startDate.getMinutes())}00`;
}

function escapeICS(str) {
  return str.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
}

/**
 * downloadFixturesICS - generates and downloads an .ics file for all upcoming fixtures
 * @param {Array} fixtures - array of fixture objects
 */
export function downloadFixturesICS(fixtures) {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const upcoming = fixtures.filter(f => f.isoDate && f.time);

  const events = upcoming.map(f => {
    const dtStart = toICSDate(f.isoDate, f.time);
    const dtEnd = toICSEndDate(f.isoDate, f.time);
    const summary = `${f.homeTeamId} vs ${f.awayTeamId}`;
    const description = `DWOG PACU CUP 2026 | ${f.day}${f.group ? ` | Group ${f.group}` : ''}`;
    const location = f.venue === 'UTC Lira' ? 'UTC Grounds, Lira' : 'LTC Grounds, Lira';

    return [
      'BEGIN:VEVENT',
      `UID:dwogpacu-${f.id}@dwogpacu.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(summary)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      `LOCATION:${escapeICS(location)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DWOG PACU CUP//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:DWOG PACU CUP 2026',
    'X-WR-TIMEZONE:Africa/Kampala',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'DWOG_PACU_CUP_2026.ics';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * downloadElementAsImage - uses html2canvas to snapshot a DOM element and download it
 * @param {HTMLElement} element - the element to capture
 * @param {string} filename - filename without extension
 */
export async function downloadElementAsImage(element, filename = 'dwogpacu') {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(element, {
    backgroundColor: '#0a0a0a',
    scale: 2,
    useCORS: true,
    logging: false,
  });
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.png`;
  a.click();
}
