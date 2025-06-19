import { promises as dns } from "node:dns";

interface MXRecord {
  exchange: string;
  priority: number;
}

enum EMAIL_PROVIDER {
  GMAIL = "gmail",
  OUTLOOK = "outlook",
  YAHOO = "yahoo",
  ZOHO = "zoho",
  PROTONMAIL = "protonmail",
  ICLOUD = "icloud",
  FASTMAIL = "fastmail",
  UNKNOWN = "unknown",
}

// Fast domain-based lookup for common providers
const KNOWN_DOMAINS: Record<string, EMAIL_PROVIDER> = {
  "gmail.com": EMAIL_PROVIDER.GMAIL,
  "googlemail.com": EMAIL_PROVIDER.GMAIL,
  "outlook.com": EMAIL_PROVIDER.OUTLOOK,
  "hotmail.com": EMAIL_PROVIDER.OUTLOOK,
  "live.com": EMAIL_PROVIDER.OUTLOOK,
  "msn.com": EMAIL_PROVIDER.OUTLOOK,
  "yahoo.com": EMAIL_PROVIDER.YAHOO,
  "yahoo.co.uk": EMAIL_PROVIDER.YAHOO,
  "yahoo.fr": EMAIL_PROVIDER.YAHOO,
  "zoho.com": EMAIL_PROVIDER.ZOHO,
  "protonmail.com": EMAIL_PROVIDER.PROTONMAIL,
  "proton.me": EMAIL_PROVIDER.PROTONMAIL,
  "icloud.com": EMAIL_PROVIDER.ICLOUD,
  "me.com": EMAIL_PROVIDER.ICLOUD,
  "mac.com": EMAIL_PROVIDER.ICLOUD,
  "fastmail.com": EMAIL_PROVIDER.FASTMAIL,
  "fastmail.fm": EMAIL_PROVIDER.FASTMAIL,
};

// Provider keywords for flexible MX record detection
const PROVIDER_KEYWORDS: Array<{
  keywords: string[];
  provider: EMAIL_PROVIDER;
}> = [
  {
    keywords: ["google", "gmail", "googlemail"],
    provider: EMAIL_PROVIDER.GMAIL,
  },
  {
    keywords: ["outlook", "hotmail", "live", "microsoft", "office365"],
    provider: EMAIL_PROVIDER.OUTLOOK,
  },
  { keywords: ["yahoo", "yahoodns"], provider: EMAIL_PROVIDER.YAHOO },
  { keywords: ["zoho"], provider: EMAIL_PROVIDER.ZOHO },
  { keywords: ["protonmail"], provider: EMAIL_PROVIDER.PROTONMAIL },
  { keywords: ["icloud"], provider: EMAIL_PROVIDER.ICLOUD },
  {
    keywords: ["messagingengine", "fastmail"],
    provider: EMAIL_PROVIDER.FASTMAIL,
  },
];

/**
 * Extract domain from email address
 */

const getDomainFromEmail = (email: string): string => {
  const parts = email.toLowerCase().trim().split("@");
  return parts.length === 2 ? parts[1] : "";
};

/**
 * Get MX records for a domain using node:dns
 */

const getMXRecords = async (domain: string): Promise<MXRecord[]> => {
  try {
    return await dns.resolveMx(domain);
  } catch (error) {
    return [];
  }
};

/**
 * Sort MX records by priority (lowest number = highest priority)
 */

const sortMXByPriority = (mxRecords: MXRecord[]): MXRecord[] => {
  return mxRecords.sort((a, b) => a.priority - b.priority);
};

/**
 * Match MX records against known keywords to identify provider
 */

const matchMXToProvider = (mxRecords: MXRecord[]): EMAIL_PROVIDER => {
  const sortedMX = sortMXByPriority(mxRecords);

  for (const mx of sortedMX) {
    const exchangeLower = mx.exchange.toLowerCase();
    for (const { keywords, provider } of PROVIDER_KEYWORDS) {
      if (keywords.some((keyword) => exchangeLower.includes(keyword))) {
        return provider;
      }
    }
  }

  return EMAIL_PROVIDER.UNKNOWN;
};

/**
 * Return supported email provider for given `email` address.
 */

export default async (email: string): Promise<EMAIL_PROVIDER> => {
  if (!email || typeof email !== "string") {
    return EMAIL_PROVIDER.UNKNOWN;
  }

  const domain = getDomainFromEmail(email);
  if (!domain) {
    return EMAIL_PROVIDER.UNKNOWN;
  }

  // Fast path: check known domains first
  if (KNOWN_DOMAINS[domain]) {
    return KNOWN_DOMAINS[domain];
  }

  // Fallback: MX record lookup for custom domains
  try {
    const mxRecords = await getMXRecords(domain);
    if (mxRecords.length === 0) {
      return EMAIL_PROVIDER.UNKNOWN;
    }

    return matchMXToProvider(mxRecords);
  } catch (error) {
    return EMAIL_PROVIDER.UNKNOWN;
  }
};
