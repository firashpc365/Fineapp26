
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "../components/ui/Toast";

export function useRealtime(table: string, onUpdate?: () => void) {
  const { showToast } = useToast();

  useEffect(() => {
    // Return early if no real Supabase URL configured (Demo Mode)
    // We check the env var directly because the client object is initialized with a placeholder
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        (payload: any) => {
          // 1. Refresh Data via callback
          if (onUpdate) onUpdate();

          // 2. Show "Liquid" Notification
          if (payload.eventType === 'INSERT') {
            showToast(`New entry detected in ${table}`, "SUCCESS");
          } else if (payload.eventType === 'DELETE') {
            showToast(`Item removed from ${table}`, "INFO");
          } else if (payload.eventType === 'UPDATE') {
            showToast(`Record updated in ${table}`, "INFO");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, showToast, onUpdate]);
}
