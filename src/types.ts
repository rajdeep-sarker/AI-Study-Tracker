export type TaskStatus = 0 | 1 | 2; // 0: Empty, 1: Doing, 2: Done

export interface SyllabusSubject {
  subject: string;
  chapters: string[];
}

export interface TrackerData {
  [subject: string]: {
    [chapter: string]: TaskStatus[];
  };
}

export interface UserProfileData {
  // Login Info
  email?: string;
  mobile?: string;
  emergencyContact?: string;
  // Personal Info
  name?: string;
  dob?: string;
  religion?: string;
  gender?: string;
  bloodGroup?: string;
  group?: string;
  // College Info
  collegeName?: string;
  collegeAddress?: string;
  collegeSession?: string;
  universityChance?: string;
  // Father's Info
  fatherName?: string;
  fatherNid?: string;
  fatherProfession?: string;
  fatherProfessionType?: string;
  fatherYearlyIncome?: string;
  // Mother's Info
  motherName?: string;
  motherNid?: string;
  motherProfession?: string;
  motherProfessionType?: string;
  motherYearlyIncome?: string;
  // Additional Info
  previousSchool?: string;
  disability?: string;
  guardianMobile?: string;
  // Present Address
  presentDivision?: string;
  presentDistrict?: string;
  presentUpazila?: string;
  presentUnion?: string;
  presentPostOffice?: string;
  presentVillage?: string;
  presentHouse?: string;
  // Permanent Address
  permanentDivision?: string;
  permanentDistrict?: string;
  permanentUpazila?: string;
  permanentUnion?: string;
  permanentPostOffice?: string;
  permanentVillage?: string;
  permanentHouse?: string;
  // JSC Info
  jscRoll?: string;
  jscReg?: string;
  jscBoard?: string;
  jscGpa?: string;
  jscYear?: string;
  // SSC Info
  sscRoll?: string;
  sscReg?: string;
  sscBoard?: string;
  sscGpa?: string;
  sscYear?: string;
  // HSC Info
  hscRoll?: string;
  hscReg?: string;
  hscBoard?: string;
  hscGpa?: string;
  hscYear?: string;
}
