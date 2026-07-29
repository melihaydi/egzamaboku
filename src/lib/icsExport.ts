// Takvim etkinliklerini standart .ics (iCalendar/RFC 5545) formatında dışa aktarır,
// böylece kullanıcı Apple Takvim, Google Takvim vb. gerçek uygulamalara ekleyebilir.

import type { CalendarEvent } from '../types';

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function dateISOToICSDate(dateISO: string): string {
  return dateISO.replace(/-/g, '');
}

function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(`${dateISO}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildVEvent(ev: CalendarEvent): string {
  const dtstamp = `${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
  const lines = [
    'BEGIN:VEVENT',
    `UID:${ev.id}@dermiq.app`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dateISOToICSDate(ev.dateISO)}`,
    `DTEND;VALUE=DATE:${dateISOToICSDate(addDaysISO(ev.dateISO, 1))}`,
    `SUMMARY:${escapeICSText(ev.title)}`
  ];
  if (ev.description) lines.push(`DESCRIPTION:${escapeICSText(ev.description)}`);
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

export function buildICS(events: CalendarEvent[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DermIQ//Takvim//TR',
    'CALSCALE:GREGORIAN',
    ...events.map(buildVEvent),
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadICS(events: CalendarEvent[], filename: string): void {
  const ics = buildICS(events);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
