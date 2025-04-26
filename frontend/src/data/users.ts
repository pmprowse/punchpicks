// src/data/users.ts
export interface User {
  username: string;
  password: string;
  displayName?: string;
  role?: "user" | "admin";
}

export const users: User[] = [
  {
    username: "admin",
    password: "admin",
    role: "admin",
  },
  {
    username: "demo",
    password: "password",
    displayName: "John Doe",
  },
  {
    username: "jackass",
    password: "test",
    displayName: "John Doe",
  },
];
