// Import the types we'll use
import { FightCard } from "../types/Fight";

export const fightCards: Record<string, FightCard> = {
  ufcfn1: {
    title: "Main Card",
    fights: [
      {
        id: "fight1",
        weightClass: "Welterweight",
        fighter1: { name: "Ian Machado Garry", id: "garry" },
        fighter2: { name: "Carlos Prates", id: "prates" },
      },
      {
        id: "fight2",
        weightClass: "Light Heavyweight",
        fighter1: { name: "Anthony Smith", id: "smith" },
        fighter2: { name: "Zhang Mingyang", id: "mingyang" },
      },
      {
        id: "fight3",
        weightClass: "Featherweight",
        fighter1: { name: "Giga Chikadze", id: "chikadze" },
        fighter2: { name: "David Onama", id: "onama" },
      },
      {
        id: "fight4",
        weightClass: "Middleweight",
        fighter1: { name: "Michel Pereira", id: "pereira" },
        fighter2: { name: "Abusupiyan Magomedov", id: "magomedov" },
      },
      {
        id: "fight5",
        weightClass: "Welterweight",
        fighter1: { name: "Randy Brown", id: "brown" },
        fighter2: { name: "Nicolas Dalby", id: "dalby" },
      },
      {
        id: "fight6",
        weightClass: "Middleweight",
        fighter1: { name: "Ikram Aliskerov", id: "aliskerov" },
        fighter2: { name: "André Muniz", id: "muniz" },
      },
    ],
  },
  ufcfn1_prelims: {
    title: "Preliminary Card",
    fights: [
      {
        id: "fight7",
        weightClass: "Flyweight",
        fighter1: { name: "Matt Schnell", id: "schnell" },
        fighter2: { name: "Jimmy Flick", id: "flick" },
      },
      {
        id: "fight8",
        weightClass: "Featherweight",
        fighter1: { name: "Chris Gutiérrez", id: "gutierrez" },
        fighter2: { name: "John Castañeda", id: "castaneda" },
      },
      {
        id: "fight9",
        weightClass: "Bantamweight",
        fighter1: { name: "Da'Mon Blackshear", id: "blackshear" },
        fighter2: { name: "Alateng Heili", id: "heili" },
      },
      {
        id: "fight10",
        weightClass: "Bantamweight",
        fighter1: { name: "Malcolm Wellmaker", id: "wellmaker" },
        fighter2: { name: "Cameron Saaiman", id: "saaiman" },
      },
      {
        id: "fight11",
        weightClass: "Women's Strawweight",
        fighter1: { name: "Jaqueline Amorim", id: "amorim" },
        fighter2: { name: "Polyana Viana", id: "viana" },
      },
      {
        id: "fight12",
        weightClass: "Featherweight",
        fighter1: { name: "Timothy Cuamba", id: "cuamba" },
        fighter2: { name: "Roberto Romero", id: "romero" },
      },
      {
        id: "fight13",
        weightClass: "Women's Bantamweight",
        fighter1: { name: "Chelsea Chandler", id: "chandler" },
        fighter2: { name: "Joselyne Edwards", id: "edwards" },
      },
    ],
  },
  ufc315: {
    title: "Main Card",
    fights: [
      {
        id: "fight1",
        weightClass: "Heavyweight",
        fighter1: { name: "Jon Jones", id: "jones" },
        fighter2: { name: "Ciryl Gane", id: "gane" },
      },
      // Add more fights for UFC 315
    ],
  },
  ufc316: {
    title: "Main Card",
    fights: [
      {
        id: "fight1",
        weightClass: "Middleweight",
        fighter1: { name: "Israel Adesanya", id: "adesanya" },
        fighter2: { name: "Sean Strickland", id: "strickland" },
      },
      // Add more fights for UFC 316
    ],
  },
};
