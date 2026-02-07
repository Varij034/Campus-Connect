'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getToken } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type NotificationEvent = {
  type: string;
  application_id?: number;
  [key: string]: unknown;
};

export function useNotifications(onEvent?: (event: NotificationEvent) => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const url = `${API_URL}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as NotificationEvent;
        if (data.type === 'evaluation_ready' && onEventRef.current) {
          onEventRef.current(data);
        }
      } catch {
        // ignore parse errors
      }
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, []);
}
