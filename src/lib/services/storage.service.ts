import { supabase } from '@/src/lib/supabase';

const BUCKET = 'product-images';

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `${productId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(url: string): Promise<void> {
  // Extract path from full public URL
  const marker = `/object/public/${BUCKET}/`;
  const idx    = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
