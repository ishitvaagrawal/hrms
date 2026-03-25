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
  
  try {
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        g.subscribers.forEach(sub => sub(data));
      } catch (err) {
        // Silent fail on message parse in production
      }
    };

    socket.onclose = () => {
      g.socket = null;
      g.reconnectTimeout = setTimeout(() => {
        g.reconnectTimeout = null;
        connectGlobal();
      }, 5000);
    };

    socket.onerror = () => {
      // WebSocket level error handling
    };

    g.socket = socket;
  } catch (err) {
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
