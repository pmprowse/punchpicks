import { Event } from "../types/Events";

export const upcomingEvents: Event[] = [
  {
    id: "ufcfn1",
    number: null,
    date: "April 26, 2025",
    location: "Las Vegas, NV",
    startTime: "2025-04-26T19:00:00Z", // Picks lock at this time
    endTime: "2025-04-27T04:00:00Z", // Event expected to end
    mainEvent: {
      fighter1: "Ian Machado Garry",
      fighter2: "Carlos Prates",
    },
  },
  {
    id: "ufcfn2",
    number: null,
    date: "May 3, 2025",
    location: "Des Moines, IA",
    startTime: "2025-05-03T19:00:00Z",
    endTime: "2025-05-04T04:00:00Z",
    mainEvent: {
      fighter1: "Cory Sandhagen",
      fighter2: "Deiveson Figueiredo",
    },
  },
  {
    id: "ufc315",
    number: 315,
    date: "May 10, 2025",
    location: "Montreal, CAN",
    startTime: "2025-05-10T19:00:00Z",
    endTime: "2025-05-11T04:00:00Z",
    mainEvent: {
      fighter1: "Belal Muhamed",
      fighter2: "Jack Della Maddalena",
    },
  },
];
