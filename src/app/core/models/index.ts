export interface Emotion {
  id: string;
  user_id: string;
  label: string;
  emoji: string;
  color: string;
  created_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  content: string;
  content_text: string | null;
  emotion_id: string | null;
  emotion?: Emotion;
  photos_paths?: string[];
  created_at: string;
  updated_at: string;
}

export interface EntryForm {
  content: string;
  emotion_id: string | null;
  photos_paths: string[];
}

export interface EmotionForm {
  label: string;
  emoji: string;
  color: string;
}