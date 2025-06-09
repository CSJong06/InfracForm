// Define the interaction type mappings
export const InteractionEnum = {
  'IS': 'Information Sharing',
  'PLCI': 'Parent Liaison Check-In',
  '21CCI': '21st Century Check-In',
  'ACI': 'Admin Check-In',
  'SM': 'Student of the Month',
  'ACG': 'Advisory Check-in with Guardian',
  'CG': 'Check-in with Guardian',
  'CC': 'Counselor Check-in',
  'SOOC': 'Studio One-on-One Conference',
  'BSSC': 'BSS Check-in',
  'AOOC': 'Advisory One-on-One Conference',
  'D': 'Deleted log',
  'I': 'Infraction',
  'AT': 'Attendance Tracking',
  'CS': 'Check-in with Student',
  'S': 'Shout-out'
};

// Create a mapping from display names to codes
export const DisplayToCodeMap = {
  'Shout-out': 'S',
  'Check-in with guardian': 'CG',
  'Check-in with student': 'CS',
  'Attendance tracking': 'AT',
  'Parent liaison check-in': 'PLCI',
  'BSS check-in': 'BSSC',
  'Advisory one-on-one conference': 'AOOC',
  'Advisory check-in with guardian': 'ACG',
  'Infraction': 'I',
  'Information sharing': 'IS',
  'Deleted log': 'D',
  'Admin check-in': 'ACI',
  'Student of the month': 'SM',
  'Counselor check-in': 'CC',
  'Studio one-on-one conference': 'SOOC',
  '21st century check-in': '21CCI'
};

// Create a mapping from codes to display names
export const CodeToDisplayMap = Object.entries(DisplayToCodeMap).reduce((acc, [display, code]) => {
  acc[code] = display;
  return acc;
}, {}); 