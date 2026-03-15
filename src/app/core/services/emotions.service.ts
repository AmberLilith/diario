import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Emotion, EmotionForm } from '../models';

@Injectable({ providedIn: 'root' })
export class EmotionsService {
  readonly emotions = signal<Emotion[]>([]);

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('emotions')
      .select('*')
      .order('label');

    if (error) throw error;
    this.emotions.set(data as Emotion[]);
  }

  async create(form: EmotionForm): Promise<Emotion> {
    const { data, error } = await this.supabase.client
      .from('emotions')
      .insert({ ...form, user_id: this.auth.getUserId() })
      .select()
      .single();

    if (error) throw error;
    const emotion = data as Emotion;
    this.emotions.update(list => [...list, emotion]);
    return emotion;
  }

  async update(id: string, form: EmotionForm): Promise<Emotion> {
    const { data, error } = await this.supabase.client
      .from('emotions')
      .update(form)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const updated = data as Emotion;
    this.emotions.update(list => list.map(e => e.id === id ? updated : e));
    return updated;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('emotions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    this.emotions.update(list => list.filter(e => e.id !== id));
  }
}