import { supabase as browserClient } from '@/src/lib/supabase';

export interface DisputeMessage {
  id: string;
  order_id: string;
  sender: 'client' | 'admin';
  content?: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

export async function getDisputeMessages(orderId: string): Promise<DisputeMessage[]> {
  const { data, error } = await browserClient
    .from('dispute_messages')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DisputeMessage[];
}

export async function sendDisputeMessage(
  orderId: string,
  sender: 'client' | 'admin',
  content?: string,
  fileUrl?: string,
  fileName?: string,
): Promise<DisputeMessage> {
  const { data, error } = await browserClient
    .from('dispute_messages')
    .insert({ order_id: orderId, sender, content: content ?? null, file_url: fileUrl ?? null, file_name: fileName ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as DisputeMessage;
}

export async function uploadDisputeFile(file: File, orderId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${orderId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await browserClient.storage
    .from('dispute-files')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = browserClient.storage.from('dispute-files').getPublicUrl(path);
  return data.publicUrl;
}
