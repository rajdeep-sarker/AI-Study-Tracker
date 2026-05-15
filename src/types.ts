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
