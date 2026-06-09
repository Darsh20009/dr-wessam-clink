export function generateICS(apt) {
  const date = new Date(apt.date);
  const [h, m] = (apt.time || '10:00').split(':').map(Number);
  date.setHours(h, m, 0, 0);
  const end = new Date(date);
  end.setHours(end.getHours() + 1);

  const p = n => String(n).padStart(2, '0');
  const fmt = d => `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dr Wessam Clinic//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(date)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:موعد عيادة د. وسام يوسف - ${apt.type || 'زيارة'}`,
    `DESCRIPTION:${(apt.notes || 'موعد في عيادة د. وسام يوسف لتقويم الأسنان').replace(/\n/g,'\\n')}`,
    'LOCATION:بني مزار - المنيا - شرق المحطة فوق مكتبة الأهرام',
    `UID:${apt._id || Date.now()}@dr-wessam`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:تذكير: موعد عيادة د. وسام يوسف خلال ساعتين',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob(['\ufeff' + ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `موعد-د-وسام-${fmt(date)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(apt) {
  const date = new Date(apt.date);
  const [h, m] = (apt.time || '10:00').split(':').map(Number);
  date.setHours(h, m, 0, 0);
  const end = new Date(date);
  end.setHours(end.getHours() + 1);

  const p = n => String(n).padStart(2, '0');
  const fmtUtc = d => `${d.getUTCFullYear()}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `موعد عيادة د. وسام يوسف - ${apt.type || 'زيارة'}`,
    dates: `${fmtUtc(date)}/${fmtUtc(end)}`,
    details: apt.notes || 'موعد في عيادة د. وسام يوسف لتقويم الأسنان',
    location: 'بني مزار - المنيا - شرق المحطة فوق مكتبة الأهرام',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
