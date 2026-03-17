import { Injectable } from '@angular/core';
import { Entry, EntryForm } from '../models';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class EntriesService {
  private readonly BUCKET = 'entry-photos';

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getAll(): Promise<Entry[]> {
    const { data, error } = await this.supabase.client
      .from('entries')
      .select('*, emotion:emotions(*), photos:entry_photos(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Entry[];
  }

  async search(
  page: number = 0,
  pageSize: number = 6,
  searchTerm?: string,
  dateFrom?: Date | null,
  dateTo?: Date | null
): Promise<{ data: Entry[], count: number }> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = this.supabase.client
    .from('entries')
    .select('*, emotion:emotions(*), photos:entry_photos(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (dateFrom) {
    const start = new Date(dateFrom);
    start.setHours(0, 0, 0, 0);
    query = query.gte('created_at', start.toISOString());
  }

  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    query = query.lte('created_at', end.toISOString());
  }

  if (searchTerm?.trim()) {
    query = query.ilike('content_text', `%${searchTerm.trim().toLowerCase()}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data as Entry[], count: count ?? 0 };
}

  async getById(id: string): Promise<Entry> {
    const { data, error } = await this.supabase.client
      .from('entries')
      .select('*, emotion:emotions(*), photos:entry_photos(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Entry;
  }

  async create(form: EntryForm): Promise<Entry> {
    const userId = this.auth.getUserId();

    // Cria o relato primeiro
    const { data, error } = await this.supabase.client
      .from('entries')
      .insert({
        user_id: userId,
        content: form.content,
        content_text: this.extractText(form.content),
        emotion_id: form.emotion_id || null,
        photos_paths: form.photos_paths
      })
      .select('*, emotion:emotions(*)')
      .single();

    if (error) throw error;
    const entry = data as Entry;

    // Faz upload das fotos se existirem
    if (form.photo_files && form.photo_files.length > 0) {
      await this.uploadPhotos(form.photo_files, entry.id, userId);
    }

    return this.getById(entry.id);
  }

  async update(id: string, form: EntryForm, notDeletedphotosPaths: string[]): Promise<Entry> {
    const userId = this.auth.getUserId();

    const { error } = await this.supabase.client
      .from('entries')
      .update({
        content: form.content,
        content_text: this.extractText(form.content),
        emotion_id: form.emotion_id || null,
        photos_paths: form.photos_paths
      })
      .eq('id', id);

    if (error) throw error;

    // Upload de novas fotos se existirem
    if (form.photo_files && form.photo_files.length > 0) {
      await this.uploadPhotos(form.photo_files, id, userId);
    }

    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    // Busca paths das fotos para deletar do storage
    const {data, error: fetchError} = await this.supabase.client
      .from('entries')
      .select('photos_paths')
      .eq('id', id)
      .single();

      const photosPaths = data?.photos_paths;
      console.log("o path recuperado é " + photosPaths)

    if (photosPaths && photosPaths.length > 0) {
      console.log("o path será deletado " + photosPaths)
  await this.supabase.client.storage.from(this.BUCKET).remove(photosPaths);
}

    const { error } = await this.supabase.client
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deletePhotos(photosPaths: string[] | null): Promise<void> {
   if(photosPaths){
    const {error} = await this.supabase.client.storage.from(this.BUCKET).remove(photosPaths);
    if (error) throw error;
   }
  }

  private async uploadPhotos(files: File[], entryId: string, userId: string): Promise<void> {
    const uploads = files.map(async (file, index) => {
      const ext = file.name.split('.').pop();
      const path = `${userId}/${entryId}/${Date.now()}_${index}.${ext}`;

      const { error } = await this.supabase.client.storage
        .from(this.BUCKET)
        .upload(path, file, { upsert: false });

      if (error) throw error;

      const { data } = this.supabase.client.storage
        .from(this.BUCKET)
        .getPublicUrl(path);

      await this.supabase.client.from('entry_photos').insert({
        entry_id: entryId,
        url: data.publicUrl,
        path,
        order: index,
      });
    });

    await Promise.all(uploads);
  }

  async uploadTempPhoto(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/temp/${Date.now()}.${ext}`;

  const { error } = await this.supabase.client.storage
    .from(this.BUCKET)
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = await this.supabase.client.storage
    .from(this.BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (!data?.signedUrl) throw new Error('Erro ao gerar URL');
  return data.signedUrl;
}

  subscribeToEntries(callback: (entry: Entry) => void) {
    return this.supabase.client
      .channel('entries-changes')
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'entries' },
        (payload: { new: Entry }) => callback(payload.new)
      )
      .subscribe();
  }

  private extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim().toLowerCase();
}
}