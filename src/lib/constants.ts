export const GAMES = [
  { slug: "acc", name: "Assetto Corsa Competizione", short: "ACC" },
  { slug: "iracing", name: "iRacing", short: "iRacing" },
  { slug: "lmu", name: "Le Mans Ultimate", short: "LMU" },
  { slug: "ac", name: "Assetto Corsa", short: "AC" },
  { slug: "ac-evo", name: "Assetto Corsa EVO", short: "AC EVO" },
  { slug: "f1-25", name: "F1 25", short: "F1 25" },
] as const;

export const EVENT_TYPES = [
  { value: "torneo", label: "Torneo" },
  { value: "amichevole", label: "Amichevole" },
  { value: "campionato", label: "Campionato" },
  { value: "endurance", label: "Endurance" },
  { value: "sprint", label: "Sprint" },
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
