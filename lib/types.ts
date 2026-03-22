export interface Affirmation {
  id: string;
  text: string;
  attribution?: string | null;
  imageUrl?: string | null;
  category?: string;
  active: boolean;
}

export interface WelcomeMessage {
  id: string;
  text: string;
  audioUrl?: string | null;
  effectiveDateStart: string;
  effectiveDateEnd: string;
}

export interface WelcomesFile {
  version: number;
  welcomes: WelcomeMessage[];
  fallback: { text: string };
}

export interface SiteConfig {
  version: number;
  appName: string;
  timerDurationMs: number;
  donationUrl: string;
  supportNote: string;
}

export interface AffirmationsFile {
  version: number;
  affirmations: Affirmation[];
}
