import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadAvatar = async (userId: string, file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File is too large. Maximum size is 5MB.');
  }

  const fileExt = file.name.split('.').pop() ?? '';
  const fileName = `avatar.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
    upsert: true,
  });

  if (uploadError) {
    if (uploadError.message?.includes('bucket')) {
      throw new Error(
        'Storage bucket "avatars" not found. Please create it in the Supabase dashboard.',
      );
    }
    if (uploadError.message?.includes('policy') || uploadError.message?.includes('permission')) {
      throw new Error(
        'Upload permission denied. Check the storage RLS policies in the Supabase dashboard.',
      );
    }
    throw uploadError;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
};
