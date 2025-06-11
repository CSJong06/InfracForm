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

// Define the intervention type mappings
export const InterventionEnum = {
  'NONE': 'NONE',
  'EMAILED_PARENT': 'EMAILED_PARENT',
  'CALLED_HOME_LEFT_MESSAGE': 'CALLED_HOME_LEFT_MESSAGE',
  'CALLED_HOME_SPOKE': 'CALLED_HOME_SPOKE',
  'PARENT_MEETING': 'PARENT_MEETING',
  'CALLED_HOME_NO_ANSWER': 'CALLED_HOME_NO_ANSWER',
  'GROUP_RESTORATIVE_CIRCLE': 'GROUP_RESTORATIVE_CIRCLE',
  'DOOR_CONVERSATIONS': 'DOOR_CONVERSATIONS',
  'CHECK_IN': 'CHECK_IN',
  'TEACHER_STRATEGY': 'TEACHER_STRATEGY',
  'CALLED_HOME_DISCONNECTED': 'CALLED_HOME_DISCONNECTED',
  'ADVISOR_COUNSELOR_REFERRAL': 'ADVISOR_COUNSELOR_REFERRAL',
  'LETTER_SENT_HOME': 'LETTER_SENT_HOME',
  'SAP_REFERRAL': 'SAP_REFERRAL',
  'INDIVIDUAL_RESTORATIVE_CONFERENCE': 'INDIVIDUAL_RESTORATIVE_CONFERENCE',
  'HOME_VISIT': 'HOME_VISIT',
  'GUIDANCE_COUNSELING': 'GUIDANCE_COUNSELING',
  'OUT_OF_CLASS_REFLECTION': 'OUT_OF_CLASS_REFLECTION',
  'CAREER_COLLEGE_COUNSELING': 'CAREER_COLLEGE_COUNSELING'
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