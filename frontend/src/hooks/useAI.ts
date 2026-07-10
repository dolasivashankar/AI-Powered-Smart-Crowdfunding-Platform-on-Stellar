import { useState } from 'react';
import { aiService } from '@/services/aiService';
import { useNotification } from '@/contexts/NotificationContext';
import type { AIGenerateParams } from '@/types';

export function useAI() {
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotification();

  const generate = async (params: AIGenerateParams) => {
    setIsLoading(true);
    setError(null);
    const toastId = notify.loading('Generating campaign copy with StellarFlow AI...');

    try {
      const generated = await aiService.generateDescription(params);
      setDescription(generated);
      notify.success('AI description generated successfully!');
      return generated;
    } catch (err: any) {
      const errMsg = err.message || String(err);
      setError(errMsg);
      notify.error(`AI Generation failed: ${errMsg}`);
      throw err;
    } finally {
      setIsLoading(false);
      notify.dismiss(toastId);
    }
  };

  return {
    description,
    isLoading,
    error,
    generate,
    setDescription,
  };
}

export default useAI;
