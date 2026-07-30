import { describe, it, expect } from 'vitest';
import { buildICS } from './icsExport';
import type { CalendarEvent } from '../types';

describe('buildICS', () => {
  it('wraps the calendar in a valid VCALENDAR envelope', () => {
    const ics = buildICS([]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('\r\n');
  });

  it('emits one VEVENT per calendar event with the expected fields', () => {
    const events: CalendarEvent[] = [
      { id: 'evt-1', dateISO: '2026-03-15', type: 'doctorVisit', title: 'Dermatolog Kontrolü', description: 'Rutin kontrol' },
      { id: 'evt-2', dateISO: '2026-03-20', type: 'medication', title: 'Krem Uygulaması' }
    ];
    const ics = buildICS(events);

    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('UID:evt-1@dermiq.app');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260315');
    expect(ics).toContain('DTEND;VALUE=DATE:20260316');
    expect(ics).toContain('SUMMARY:Dermatolog Kontrolü');
    expect(ics).toContain('DESCRIPTION:Rutin kontrol');
    expect(ics).toContain('UID:evt-2@dermiq.app');
    expect(ics).not.toContain('DESCRIPTION:Krem');
  });

  it('escapes commas, semicolons, and backslashes in text fields', () => {
    const events: CalendarEvent[] = [
      { id: 'evt-3', dateISO: '2026-04-01', type: 'note', title: 'Nemlendirici; Krem, Test\\Yol' }
    ];
    const ics = buildICS(events);
    expect(ics).toContain('SUMMARY:Nemlendirici\\; Krem\\, Test\\\\Yol');
  });

  it('rolls the DTEND date over to the next day, including month boundaries', () => {
    const events: CalendarEvent[] = [
      { id: 'evt-4', dateISO: '2026-01-31', type: 'note', title: 'Ay Sonu Etkinliği' }
    ];
    const ics = buildICS(events);
    expect(ics).toContain('DTSTART;VALUE=DATE:20260131');
    expect(ics).toContain('DTEND;VALUE=DATE:20260201');
  });
});
