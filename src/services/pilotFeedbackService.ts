import { supabase } from "@/lib/supabase";

import type {
  PilotFeedbackCategory,
  PilotFeedbackEntry,
  PilotFeedbackSummary,
} from "@/types/pilotFeedback";

interface PilotFeedbackRow {
  id: number;
  member_name: string;
  category: PilotFeedbackCategory;
  message: string;
  page_path: string | null;
  app_version: string | null;
  user_agent: string | null;
  created_at: string;
}

interface PilotFeedbackSummaryRow {
  total_count: number;
  error_count: number;
  suggestion_count: number;
  question_count: number;
  praise_count: number;
}

export async function submitPilotFeedback(input: {
  category: PilotFeedbackCategory;
  message: string;
  pagePath: string;
  appVersion: string;
  userAgent: string;
}): Promise<void> {
  const { error } = await supabase.rpc(
    "submit_pilot_feedback",
    {
      p_category: input.category,
      p_message: input.message,
      p_page_path: input.pagePath,
      p_app_version: input.appVersion,
      p_user_agent: input.userAgent,
    },
  );

  if (error) {
    throw error;
  }
}

export async function getPilotFeedback(
  category: PilotFeedbackCategory | null,
  limit = 100,
): Promise<PilotFeedbackEntry[]> {
  const { data, error } = await supabase.rpc(
    "list_pilot_feedback",
    {
      p_category: category,
      p_limit: limit,
    },
  );

  if (error) {
    throw error;
  }

  return ((data ?? []) as PilotFeedbackRow[]).map(
    (row) => ({
      id: row.id,
      memberName: row.member_name,
      category: row.category,
      message: row.message,
      pagePath: row.page_path,
      appVersion: row.app_version,
      userAgent: row.user_agent,
      createdAt: row.created_at,
    }),
  );
}

export async function getPilotFeedbackSummary():
Promise<PilotFeedbackSummary> {
  const { data, error } = await supabase.rpc(
    "get_pilot_feedback_summary",
  );

  if (error) {
    throw error;
  }

  const row = (data as PilotFeedbackSummaryRow[] | null)?.[0];

  return {
    total: row?.total_count ?? 0,
    error: row?.error_count ?? 0,
    suggestion: row?.suggestion_count ?? 0,
    question: row?.question_count ?? 0,
    praise: row?.praise_count ?? 0,
  };
}
