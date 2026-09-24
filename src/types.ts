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
export type LearningState = 'Familiar' | 'Almost Mine' | 'Mine';
export interface SavedPhrase extends Phrase { id: string; note: string; savedAt: string; context?: string; tone?: string; pattern?: string; examples?: string[]; tags?: string[]; learningState?: LearningState; lastPracticed?: string; due?: string; reviewCount?: number; topic?: string; sourceTitle?: string; sourceId?: string }
export interface ExposurePhrase extends Phrase { context: string; tone: string; pattern: string; examples: string[]; explanation: string; zh: string; tags: string[] }
export interface ExposurePack {
  id: string; title: string; intent: string; topic?: string; skill?: string;
  reading?: { title: string; genre: string; situation: string; paragraphs: string[]; glossary: { term: string; meaning: string }[]; structure: string[]; table?: { caption: string; headings: string[]; rows: string[][] } };
  phrases: ExposurePhrase[]; notices: { question: string; answer: string }[];
  choice: { context: string; options: { text: string; explanation: string }[]; preferred: number };
  imitations: { label: string; context: string; scaffold: string; example: string }[];
  recallContext: string; recallModel: string; recallHints?: [string, string, string];
  produceContext: string; produceModel: string; produceHint?: string; selfCheck?: string;
}
export interface PersonalReading { id: string; title: string; topic: string; source: string; text: string; note: string; savedAt: string; lastRead?: string }
export const stages = ['Absorb', 'Notice', 'Choose', 'Imitate', 'Recall', 'Produce'] as const;
export type Stage = typeof stages[number];
export interface ExposureSession { id: string; packId: string; date: string; stage: Stage; visited: Stage[]; choice: number | null; checked: boolean; imitation: string[]; recall: string; produce: string; hintLevel: number; recallFeeling?: 'Hesitated' | 'Comfortable' }
export interface ExposureRecord { id: string; packId: string; date: string; stages: Stage[]; at: string }
export interface ReviewItem { questionId: string; rating: Rating; due: string; lastReviewed: string }
export interface Attempt { questionId: string; rating: Rating; at: string; mode: 'daily' | 'review'; response: string; choice: number | null }
export interface Session { date: string; ids: string[]; index: number; response: string; choice: number | null; revealed: boolean; hint: boolean }
export interface AppData {
  version: 1; theme: 'system' | 'light' | 'dark'; rescue: boolean;
  attempts: Attempt[]; reviews: Record<string, ReviewItem>; phrases: SavedPhrase[];
  completedDates: string[]; session: Session | null; reviewSession: Session | null;
  exposureSession?: ExposureSession | null; exposureHistory?: ExposureRecord[];
  exposureDrafts?: Record<string, ExposureSession>; readings?: PersonalReading[];
}
