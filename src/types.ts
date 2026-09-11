export const categories = ['Clarify', 'Challenge', 'Align', 'Escalate', 'Follow Up', 'Meeting Language', 'Project Risk', 'Email Tone', 'Summarize', 'Close / Confirm Next Steps'] as const;
export type Category = typeof categories[number];
export type ExerciseType = 'scenario' | 'tone' | 'micro' | 'rewrite';
export type Rating = 'Easy' | 'Hesitated' | 'Difficult';
export interface Phrase { phrase: string; category: string; example: string }
export interface Exercise {
  id: string; type: ExerciseType; category: Category; scenario: string; prompt: string;
  options?: { text: string; explanation: string }[]; preferredAnswer?: number;
  modelAnswer: string; alternativeAnswer: string; explanation: string;
  phrases: Phrase[]; hintZh: string; difficulty: 1 | 2 | 3; tags: string[];
}
export interface SavedPhrase extends Phrase { id: string; note: string; savedAt: string }
export interface ReviewItem { questionId: string; rating: Rating; due: string; lastReviewed: string }
export interface Attempt { questionId: string; rating: Rating; at: string; mode: 'daily' | 'review'; response: string; choice: number | null }
export interface Session { date: string; ids: string[]; index: number; response: string; choice: number | null; revealed: boolean; hint: boolean }
export interface AppData {
  version: 1; theme: 'system' | 'light' | 'dark'; rescue: boolean;
  attempts: Attempt[]; reviews: Record<string, ReviewItem>; phrases: SavedPhrase[];
  completedDates: string[]; session: Session | null; reviewSession: Session | null;
}
