export interface Event {
  id: string;
  number: number;
  date: string;
  location: string;
  mainEvent: {
    fighter1: string;
    fighter2: string;
  };
}
