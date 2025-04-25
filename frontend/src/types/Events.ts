export interface Event {
  id: string;
  number: number | null;
  date: string;
  location: string;
  startTime: string; // ISO timestamp for when picks lock
  endTime: string; // ISO timestamp for event end
  mainEvent: {
    fighter1: string;
    fighter2: string;
  };
}
