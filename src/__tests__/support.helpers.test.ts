import type { Complaint } from '@/app/services/support.service';
import {
  formatTicketDate,
  getInitials,
  getSchoolEmail,
  getSchoolName,
  getUserName,
  matchesSearch,
} from '@/components/support/ticket-helpers';

/** A complaint with the populated shape the API usually returns. */
function complaint(overrides: Partial<Complaint> = {}): Complaint {
  return {
    _id: 'c1',
    ticket: 'TKT-1001',
    subject: 'Portal is slow at registration',
    description: 'Pages take 30 seconds.',
    status: 'Pending',
    createdAt: '2026-01-04T10:00:00.000Z',
    updatedAt: '2026-01-05T10:00:00.000Z',
    userId: { userId: 'u1', firstName: 'Ada', lastName: 'Obi', email: 'ada@school.test' },
    schoolId: { _id: 's1', name: 'Bright Star Academy', email: 'hi@bright.test' },
    ...overrides,
  };
}

describe('getSchoolName / getSchoolEmail', () => {
  it('reads a populated school reference', () => {
    expect(getSchoolName(complaint())).toBe('Bright Star Academy');
    expect(getSchoolEmail(complaint())).toBe('hi@bright.test');
  });

  it('survives an unpopulated reference without rendering [object Object]', () => {
    const c = complaint({ schoolId: '65f0000000000000000000aa' });
    expect(getSchoolName(c)).toBe('65f0000000000000000000aa');
    expect(getSchoolEmail(c)).toBe('—');
  });

  it('handles a ticket filed by someone with no school', () => {
    const c = complaint({ schoolId: undefined });
    expect(getSchoolName(c)).toBe('No school');
    expect(getSchoolEmail(c)).toBe('—');
  });
});

describe('getUserName', () => {
  it('prefers the full name', () => {
    expect(getUserName(complaint())).toBe('Ada Obi');
  });

  it('falls back to the first name, then the email', () => {
    expect(getUserName(complaint({ userId: { userId: 'u', firstName: 'Ada', email: 'a@b.c' } }))).toBe('Ada');
    expect(getUserName(complaint({ userId: { userId: 'u', email: 'a@b.c' } }))).toBe('a@b.c');
  });

  it('never throws when the author was not populated', () => {
    expect(getUserName(complaint({ userId: undefined as unknown as Complaint['userId'] }))).toBe(
      'Unknown',
    );
  });
});

describe('getInitials', () => {
  it('takes the first letter of the first two words', () => {
    expect(getInitials('Bright Star Academy')).toBe('BS');
  });

  it('copes with one word and with stray spacing', () => {
    expect(getInitials('Talim')).toBe('T');
    expect(getInitials('  Bright   Star ')).toBe('BS');
  });

  it('returns an empty string rather than throwing on an empty name', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('matchesSearch', () => {
  it('matches on school name, school email, subject and ticket number', () => {
    expect(matchesSearch(complaint(), 'bright')).toBe(true);
    expect(matchesSearch(complaint(), 'hi@bright')).toBe(true);
    expect(matchesSearch(complaint(), 'registration')).toBe(true);
    expect(matchesSearch(complaint(), 'tkt-1001')).toBe(true);
  });

  it('does not match the description, which is not a searched field', () => {
    expect(matchesSearch(complaint(), '30 seconds')).toBe(false);
  });

  it('treats an empty query as matching everything', () => {
    expect(matchesSearch(complaint(), '')).toBe(true);
  });
});

describe('formatTicketDate', () => {
  it('formats short and long styles', () => {
    expect(formatTicketDate('2026-01-04T10:00:00.000Z')).toBe('4 Jan 2026');
    expect(formatTicketDate('2026-01-04T10:00:00.000Z', 'long')).toBe('4 January 2026');
  });

  it('returns an em dash rather than "Invalid Date" for junk', () => {
    expect(formatTicketDate('not-a-date')).toBe('—');
    expect(formatTicketDate('')).toBe('—');
  });
});
