export type AttendanceStatus =
  | "present"
  | "late"
  | "absent"
  | "justified";

export type CheckInMethod = "qr" | "manual";

export interface AttendanceSession {
  id: string;
  rehearsal_date: string;
  title: string;
  starts_at: string;
  ends_at: string;
  present_until: string;
  late_until: string;
  qr_token: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  member_id: number;
  status: AttendanceStatus;
  check_in_method: CheckInMethod;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
}