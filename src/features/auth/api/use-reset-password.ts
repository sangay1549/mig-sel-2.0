import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ResetPasswordValues } from '../schemas/reset-password-schema';

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw error;
    },
  });
};
