import type {
  Affirmation,
  AffirmationsFile,
  WelcomeMessage,
  WelcomesFile,
  SiteConfig,
} from "./types";

const CONTENT_BASE = "/content";

const DEFAULT_CONFIG: SiteConfig = {
  version: 1,
  appName: "WYC",
  timerDurationMs: 7000,
  donationUrl: "",
  supportNote: "",
};

const DEFAULT_WELCOME: WelcomeMessage = {
  id: "fallback",
  text: "Welcome. Take a moment for yourself.",
  effectiveDateStart: "2000-01-01",
  effectiveDateEnd: "2099-12-31",
};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${CONTENT_BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchAffirmations(): Promise<Affirmation[]> {
  try {
    const data = await fetchJson<AffirmationsFile>("affirmations.json");
    return data.affirmations.filter((a) => a.active);
  } catch {
    return [];
  }
}

export async function fetchWelcome(date: Date): Promise<WelcomeMessage> {
  try {
    const data = await fetchJson<WelcomesFile>("welcomes.json");
    const today = date.toISOString().slice(0, 10);

    const active = data.welcomes.find(
      (w) => w.effectiveDateStart <= today && today <= w.effectiveDateEnd
    );

    if (active) return active;

    return {
      ...DEFAULT_WELCOME,
      text: data.fallback?.text ?? DEFAULT_WELCOME.text,
    };
  } catch {
    return DEFAULT_WELCOME;
  }
}

export async function fetchConfig(): Promise<SiteConfig> {
  try {
    return await fetchJson<SiteConfig>("config.json");
  } catch {
    return DEFAULT_CONFIG;
  }
}
