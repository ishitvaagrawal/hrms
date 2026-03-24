import { useEffect, useRef } from 'react';

type SubscriptionEvent = {
  event: string;
  action: string;
  [key: string]: any;
};

// --- Window-based Singleton for HMR Persistence ---
const GLOBAL_KEY = '__HRMS_WS_SINGLETON__';

interface GlobalWSSingleton {
  socket: WebSocket | null;
  subscribers: Set<(data: SubscriptionEvent) => void>;
  reconnectTimeout: NodeJS.Timeout | null;
}

const getSingleton = (): GlobalWSSingleton | null => {
  if (typeof window === 'undefined') return null;
  if (!(window as any)[GLOBAL_KEY]) {
    (window as any)[GLOBAL_KEY] = {
      socket: null,
      subscribers: new Set(),
      reconnectTimeout: null
    };
  }
  return (window as any)[GLOBAL_KEY];
};

const connectGlobal = () => {
  const g = getSingleton();
  if (!g || g.socket || g.reconnectTimeout) return;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  let host = process.env.NEXT_PUBLIC_API_URL || '';
  
  if (host.startsWith('http')) {
    host = host.replace(/^https?:\/\//, '');
  } else if (!host) {
    host = 'localhost:8000';
  }
  
  const wsUrl = `${protocol}//${host}/ws`;
  console.log(`[Subscription Singleton] Connecting to ${wsUrl}...`);
  
  try {
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('[Subscription Singleton] Connected to real-time updates');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        g.subscribers.forEach(sub => sub(data));
      } catch (err) {
        console.error('[Subscription Singleton] Failed to parse message', err);
      }
    };

    socket.onclose = (event) => {
      console.warn(`[Subscription Singleton] Disconnected: code=${event.code}. Reconnecting in 5s...`);
      g.socket = null;
      g.reconnectTimeout = setTimeout(() => {
        g.reconnectTimeout = null;
        connectGlobal();
      }, 5000);
    };

    socket.onerror = (err) => {
      console.error('[Subscription Singleton] WebSocket Error detected.', err);
    };

    g.socket = socket;
  } catch (err) {
    console.error('[Subscription Singleton] Failed to create WebSocket', err);
    g.reconnectTimeout = setTimeout(() => {
      g.reconnectTimeout = null;
      connectGlobal();
    }, 5000);
  }
};

export const useSubscription = (onEvent: (data: SubscriptionEvent) => void) => {
  const onEventRef = useRef(onEvent);
  
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const g = getSingleton();
    if (!g) return;

    const subscriber = (data: SubscriptionEvent) => {
      onEventRef.current(data);
    };

    g.subscribers.add(subscriber);
    connectGlobal();

    return () => {
      g.subscribers.delete(subscriber);
    };
  }, []);
};
