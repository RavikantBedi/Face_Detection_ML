import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RecognitionLog {
  id: string;
  user_id: string;
  image_path: string;
  status: 'pending' | 'processing' | 'success' | 'warning' | 'failed';
  subject_id: string | null;
  subject_name: string | null;
  confidence: number | null;
  ssim_score: number | null;
  processing_time_ms: number | null;
  database_used: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = 'recognition-logs';

async function fetchRecognitionLogs(userId: string): Promise<RecognitionLog[]> {
  const { data, error } = await supabase
    .from('recognition_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }

  return data as RecognitionLog[];
}

export function useRecognitionLogs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading: loading } = useQuery({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: () => fetchRecognitionLogs(user!.id),
    enabled: !!user,
    staleTime: 30000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Subscribe to realtime updates - single subscription managed by React Query
  useEffect(() => {
    if (!user) return;

    const channel: RealtimeChannel = supabase
      .channel(`recognition-logs-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recognition_logs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          queryClient.setQueryData<RecognitionLog[]>([QUERY_KEY, user.id], (old = []) => {
            if (payload.eventType === 'INSERT') {
              return [payload.new as RecognitionLog, ...old].slice(0, 50);
            } else if (payload.eventType === 'UPDATE') {
              return old.map(log => 
                log.id === payload.new.id ? (payload.new as RecognitionLog) : log
              );
            } else if (payload.eventType === 'DELETE') {
              return old.filter(log => log.id !== payload.old.id);
            }
            return old;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const createLog = useCallback(async (imagePath: string): Promise<RecognitionLog | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('recognition_logs')
      .insert({
        user_id: user.id,
        image_path: imagePath,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating log:', error);
      toast.error('Failed to create recognition record');
      return null;
    }

    return data as RecognitionLog;
  }, [user]);

  const processRecognition = useCallback(async (imageUrl: string, logId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('Please log in to process recognition');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('process-recognition', {
        body: { imageUrl, logId }
      });

      if (error) {
        console.error('Recognition error:', error);
        toast.error('Recognition processing failed');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Recognition error:', error);
      toast.error('Recognition processing failed');
      return null;
    }
  }, []);

  // Memoize stats calculation to avoid recalculating on every render
  const stats = useMemo(() => {
    const successfulLogs = logs.filter(l => l.status === 'success');
    const logsWithConfidence = logs.filter(l => l.confidence !== null);
    const logsWithProcessingTime = logs.filter(l => l.processing_time_ms !== null);
    const logsWithSsim = logs.filter(l => l.ssim_score !== null);

    return {
      total: logs.length,
      successful: successfulLogs.length,
      warnings: logs.filter(l => l.status === 'warning').length,
      failed: logs.filter(l => l.status === 'failed').length,
      avgConfidence: logsWithConfidence.length > 0
        ? logsWithConfidence.reduce((acc, l) => acc + (l.confidence || 0), 0) / logsWithConfidence.length
        : 0,
      avgProcessingTime: logsWithProcessingTime.length > 0
        ? logsWithProcessingTime.reduce((acc, l) => acc + (l.processing_time_ms || 0), 0) / logsWithProcessingTime.length
        : 0,
      avgSsim: logsWithSsim.length > 0
        ? logsWithSsim.reduce((acc, l) => acc + (l.ssim_score || 0), 0) / logsWithSsim.length
        : 0,
    };
  }, [logs]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, user?.id] });
  }, [queryClient, user?.id]);

  return {
    logs,
    loading,
    stats,
    createLog,
    processRecognition,
    refetch
  };
}
