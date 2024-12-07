import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  hobbies?: string[];
  activities?: string[];
  createdAt: Timestamp;
  fcmToken?: string;
  tokenLastUpdated?: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  code: string;
  members: string[];
  createdAt: Timestamp;
  createdBy: string;
  maxMembers: number;
}

export interface MatchData {
  matches: { [key: string]: string };
  matchedUsers: string[];
  createdAt: Timestamp;
  createdBy: string;
}
