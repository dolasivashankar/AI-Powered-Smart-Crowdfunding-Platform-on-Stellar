import { create } from 'zustand';
import type { StellarEvent } from '@/types';

interface EventStore {
  events: StellarEvent[];
  addEvent: (event: StellarEvent) => void;
  addEvents: (events: StellarEvent[]) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  addEvent: (event) => set((state) => {
    // Avoid duplicates
    if (state.events.some((e) => e.id === event.id)) return state;
    const newEvents = [event, ...state.events];
    // Keep max 50 events
    return { events: newEvents.slice(0, 50) };
  }),
  addEvents: (newEvents) => set((state) => {
    const filtered = newEvents.filter((ne) => !state.events.some((e) => e.id === ne.id));
    if (filtered.length === 0) return state;
    const combined = [...filtered, ...state.events];
    return { events: combined.slice(0, 50) };
  }),
  clearEvents: () => set({ events: [] }),
}));
