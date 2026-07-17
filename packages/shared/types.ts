export type User = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  persona: "empathetic" | "analytical" | "energetic";
  language: string;
  timezone: string;
  streak_days: number;
  last_check_in: string | null;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type Organization = {
  id: string;
  name: string;
  logo_url: string | null;
  industry: string | null;
  country: string | null;
  timezone: string;
  language: string;
  is_active: boolean;
  created_at: string;
};

export type Member = {
  id: string;
  email: string;
  role: "admin" | "hr" | "team_lead" | "viewer";
  status: "invited" | "active" | "suspended";
  user_id: string | null;
  display_name: string | null;
  invited_at: string;
  joined_at: string | null;
};

export type Team = {
  id: string;
  name: string;
  description: string | null;
  lead_member_id: string | null;
  member_count: number;
  created_at: string;
};

export type MoodEntry = {
  id: string;
  level: number;
  tags: string[] | null;
  note: string | null;
  sentiment_score: number | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  title: string | null;
  is_onboarding: boolean;
  created_at: string;
  updated_at: string;
  messages: Message[];
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export type OrgOverview = {
  total_members: number;
  active_members: number;
  participation_rate: number;
  average_mood: number | null;
  total_teams: number;
  period_days: number;
};

export type TeamHealth = {
  name: string;
  member_count?: number;
  participation: number | null;
  reason?: string;
};
