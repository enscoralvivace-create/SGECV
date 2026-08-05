export const PILOT_FEEDBACK_CATEGORIES = [
  "error",
  "suggestion",
  "question",
  "praise",
] as const;

export type PilotFeedbackCategory =
  (typeof PILOT_FEEDBACK_CATEGORIES)[number];

export const PILOT_FEEDBACK_CATEGORY_LABELS:
Record<PilotFeedbackCategory, string> = {
  error: "Error",
  suggestion: "Sugerencia",
  question: "Duda",
  praise: "Me gustó algo",
};

export interface PilotFeedbackEntry {
  id: number;
  memberName: string;
  category: PilotFeedbackCategory;
  message: string;
  pagePath: string | null;
  appVersion: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PilotFeedbackSummary {
  total: number;
  error: number;
  suggestion: number;
  question: number;
  praise: number;
}
