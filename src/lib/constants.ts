export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) {
    return envUrl.startsWith("http://") || envUrl.startsWith("https://")
      ? envUrl
      : `https://${envUrl}`;
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProductionUrl) {
    return `https://${vercelProductionUrl}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

export const appConfig = {
  name: "Credex AI Spend Audit",
  tagline: "Stop leaking budget on overlapping AI tools.",
  get url() {
    return getSiteUrl();
  },
  consultationEmail: process.env.CREDEX_CONSULTATION_EMAIL?.trim() || "hello@credex.dev",
};
