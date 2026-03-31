import { Injectable } from '@angular/core';
import { Entry, EntryForm } from '../../models';
import { AuthService } from '../auth.service';
import { CryptoService } from '../crypto-service';
import { SupabaseService } from '../supabase-service/supabase.service';

@Injectable({ providedIn: 'root' })
export class EntriesService {
  private readonly BUCKET = 'entry-photos';

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService,
    private cryptoService: CryptoService
  ) { }

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
      .select('*, emotion:emotions(*)', { count: 'exact' })
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
    await Promise.all(
  (data as Entry[]).map(async entry => {
    entry.content = await this.cryptoService.decrypt(entry.content);
    entry.content_text = await this.cryptoService.decrypt(entry.content_text!);
    return entry;
  })
);
    return { data: data as Entry[], count: count ?? 0 };
  }

  async getById(id: string): Promise<Entry> {
    const { data, error } = await this.supabase.client
      .from('entries')
      .select('*, emotion:emotions(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    const entry = data as Entry;
    entry.content = await this.cryptoService.decrypt(entry.content);
    entry.content_text = await this.cryptoService.decrypt(entry.content_text!);
    return data as Entry;
  }

  async create(form: EntryForm): Promise<Entry> {
    const userId = this.auth.getUserId();
    const encryptedContent = await this.cryptoService.encrypt(form.content);
    const extractedText = this.extractText(form.content);
    const encryptedContentText = await this.cryptoService.encrypt(extractedText);

    const { data, error } = await this.supabase.client
      .from('entries')
      .insert({
        user_id: userId,
        content: encryptedContent,
        content_text: encryptedContentText,
        emotion_id: form.emotion_id || null,
        photos_paths: form.photos_paths
      })
      .select('*, emotion:emotions(*)')
      .single();

    if (error) throw error;
    return data as Entry;
  }

  async update(id: string, form: EntryForm): Promise<Entry> {
    const encryptedContent = await this.cryptoService.encrypt(form.content);
    const extractedText = this.extractText(form.content);
    const encryptedContentText = await this.cryptoService.encrypt(extractedText);
    const { error } = await this.supabase.client
      .from('entries')
      .update({
        content: encryptedContent,
        content_text: encryptedContentText,
        emotion_id: form.emotion_id || null,
        photos_paths: form.photos_paths
      })
      .eq('id', id);

    if (error) throw error;
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const { data } = await this.supabase.client
      .from('entries')
      .select('photos_paths')
      .eq('id', id)
      .single();

    if (data?.photos_paths && data.photos_paths.length > 0) {
      await this.supabase.client.storage
        .from(this.BUCKET)
        .remove(data.photos_paths);
    }

    const { error } = await this.supabase.client
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deletePhotos(photosPaths: string[]): Promise<void> {
    const { error } = await this.supabase.client.storage
      .from(this.BUCKET)
      .remove(photosPaths);
    if (error) throw error;
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
    return (div.textContent || div.innerText || '')
      .replace(/\s+/g, ' ').trim().toLowerCase();
  }

/* async encryptAllDB() {
  const confirmacao = confirm("Isso irá reprocessar TODOS os registros. Deseja continuar?");
  if (!confirmacao) return;

  try {
    const { data: entries, error } = await this.supabase.client
      .from('entries')
      .select('*');

    if (error) throw error;

    if (!entries || entries.length === 0) {
      alert('Nenhum registro encontrado.');
      return;
    }

    console.log(`Migrando ${entries.length} registros...`);

    let atualizados = 0;

    for (const entry of entries) {
      let content: string;
      let content_text: string;
      try {
        content = await this.cryptoService.decrypt(entry.content);
      } catch {
        content = entry.content;
      }

      try {
        content_text = await this.cryptoService.decrypt(entry.content_text);
      } catch {
        content_text = entry.content_text;
      }

      const encryptedContent = await this.cryptoService.encrypt(content);
      const encryptedContentText = await this.cryptoService.encrypt(content_text);

      await this.supabase.client
        .from('entries')
        .update({
          content: encryptedContent,
          content_text: encryptedContentText
        })
        .eq('id', entry.id);

      atualizados++;
    }

    alert(`Migração concluída! ${atualizados} registros atualizados.`);
  } catch (err) {
    console.error(err);
    alert('Erro na migração.');
  }
} */
}