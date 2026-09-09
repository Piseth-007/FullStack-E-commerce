// Comprehensive email validation utilities for real email verification

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmailo.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "dispostable.com",
  "sharklasers.com",
  "getairmail.com",
  "throwawaymail.com",
  "nada.ltd",
  "getnada.com",
  "fakeinbox.com",
  "tempinbox.com",
  "burnermail.io",
  "mohmal.com",
  "emailondeck.com",
  "crazymailing.com",
  "dropmail.me",
  "inboxkitten.com",
  "mytemp.email",
  "fakemailgenerator.com",
  "generator.email",
  "maildrop.cc",
  "disposablemail.com",
  "emailfake.com",
  "zillamail.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "tinypulse.com",
]);

const DOMAIN_TYPOS = {
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmai.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
};

/**
 * Validates whether an email address format is valid, deliverable-looking,
 * free of common domain typos, and not from a disposable/temporary provider.
 *
 * @param {string} email
 * @returns {{ isValid: boolean, error: string | null, suggestion?: string }}
 */
export function validateRealEmail(email) {
  if (!email || typeof email !== "string" || !email.trim()) {
    return { isValid: false, error: "Please enter your email address." };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Strict email regex requiring user@domain.tld with valid TLD length
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      error: "Please enter a valid email address format (e.g. name@example.com).",
    };
  }

  const parts = cleanEmail.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  const [localPart, domain] = parts;

  // Check for common typos
  if (DOMAIN_TYPOS[domain]) {
    const suggestion = `${localPart}@${DOMAIN_TYPOS[domain]}`;
    return {
      isValid: false,
      error: `Did you mean ${suggestion}? Please check your spelling.`,
      suggestion,
    };
  }

  // Check against disposable / temporary domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: "Temporary and disposable email addresses are not permitted. Please use a real email address.",
    };
  }

  return { isValid: true, error: null };
}
