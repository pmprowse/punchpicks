export interface Pick {
  fighterId: string;
  method: string;
}

export interface UserEventPicks {
  eventId: string;
  timestamp: string;
  picks: Record<string, Pick>;
  isSubmitted: boolean;
}
