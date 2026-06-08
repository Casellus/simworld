export const GAMES = [
  { slug: "acc", name: "Assetto Corsa Competizione", short: "ACC" },
  { slug: "iracing", name: "iRacing", short: "iRacing" },
  { slug: "lmu", name: "Le Mans Ultimate", short: "LMU" },
  { slug: "ac", name: "Assetto Corsa", short: "AC" },
  { slug: "ac-evo", name: "Assetto Corsa EVO", short: "AC EVO" },
  { slug: "f1-25", name: "F1 25", short: "F1 25" },
  { slug: "ac-rally", name: "Assetto Corsa Rally", short: "AC Rally" },
  { slug: "ea-wrc", name: "EA Sports WRC", short: "EA WRC" },
] as const;

export const EVENT_TYPES = [
  { value: "torneo", label: "Torneo" },
  { value: "amichevole", label: "Amichevole" },
  { value: "campionato", label: "Campionato" },
  { value: "endurance", label: "Endurance" },
  { value: "sprint", label: "Sprint" },
] as const;

export const SIM_CATEGORIES = [
  { value: "ffb",       label: "Force Feedback" },
  { value: "grafica",   label: "Grafica" },
  { value: "controlli", label: "Controlli" },
  { value: "audio",     label: "Audio" },
  { value: "generale",  label: "Generale" },
] as const;

export const SKILL_LEVELS = [
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzato", label: "Avanzato" },
  { value: "pro", label: "Pro" },
] as const;

export const TEAM_ROLES = [
  { value: "proprietario", label: "Proprietario" },
  { value: "manager", label: "Manager" },
  { value: "pilota", label: "Pilota" },
  { value: "riserva", label: "Riserva" },
] as const;

export const XP_VALUES = {
  setup_create: 50,
  like_given: 5,
  like_received: 5,
  event_create: 40,
  event_join: 15,
  team_create: 30,
  team_join: 20,
  post_create: 20,
} as const;

export type XpAction = keyof typeof XP_VALUES;
