import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ForgotPasswordValues } from '../schemas/forgot-password-schema';

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
  });
};
