export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  exam_date: string | null;
  exam_weight: number | null;
  target_hours: number | null;
  notes: string | null;
  status: 'active' | 'archived';
  exam_type: string | null;
  difficulty_level: number | null;
  created_at: string;
}

export interface RevisionSession {
  id: string;
  user_id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'planned' | 'done' | 'skipped';
  notes: string | null;
  created_at: string;
  subject?: Subject;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  is_blocking: boolean;
  event_type: 'course' | 'work' | 'personal' | 'other';
  subject_name: string | null;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  school: string | null;
  level: string | null;
  study_domain: string | null;
  weekly_revision_hours: number | null;
  main_exam_period: string | null;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_days_of_week: number[];
  daily_start_time: string;
  daily_end_time: string;
  max_hours_per_day: number;
  session_duration_minutes: number;
  avoid_early_morning: boolean;
  avoid_late_evening: boolean;
}

export interface SessionInvite {
  session_id: string;
  invited_by: string;
  accepted_by: string | null;
  confirmed: boolean;
  meeting_format: 'online' | 'in_person' | null;
  meeting_address: string | null;
  meeting_link: string | null;
}
