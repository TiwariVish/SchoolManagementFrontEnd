export const MODULES: { code: string; name: string; description: string }[] = [
  { code: 'M00_CORE', name: 'Core', description: 'Institute, settings, users and roles' },
  { code: 'M01_ACADEMIC', name: 'Academics', description: 'Years, classes, sections, subjects, allocation' },
  { code: 'M02_PEOPLE', name: 'Students & staff', description: 'Admissions, staff records, logins' },
  { code: 'M03_ATTENDANCE', name: 'Attendance', description: 'Daily or period-wise attendance' },
  { code: 'M04_TIMETABLE', name: 'Timetable', description: 'Periods, rooms and substitutions' },
  { code: 'M05_EXAMS', name: 'Exams', description: 'Exams, marks, grades and report cards' },
  { code: 'M06_FEES', name: 'Fees', description: 'Fee plans, invoices and receipts' },
  { code: 'M07_COMMUNICATION', name: 'Communication', description: 'Notices, SMS and app notifications' },
];

export const MODULE_NAMES: Record<string, string> = Object.fromEntries(MODULES.map((m) => [m.code, m.name]));
