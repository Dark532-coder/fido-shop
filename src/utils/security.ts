// Format currency in FCFA (XOF)
export function formatFCFA(amount: number): string {
  if (isNaN(amount)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

// Generate realistic operator reference
export function generateOperatorRef(method: 'yass' | 'flooz'): string {
  const prefix = method === 'yass' ? 'YASS' : 'FLZ';
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randomDigits}-${randomChars}-TG`;
}

// Generate cryptographic visual hash (SHA-256 simulation)
export function generateSecurityHash(payload: string): string {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const timestampHex = Date.now().toString(16);
  const salt = Math.random().toString(36).substring(2, 10);
  return `sha256:e3b0c44298fc1c149afbf4c8996fb924${hex}${timestampHex}${salt}`.substring(0, 64);
}

// Validate Togolese / West African phone number format
export function isValidTogoPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  // Format local: 8 digits (starts with 90, 91, 92, 93, 96, 97, 98, 99, 70, 71, 79, etc.)
  // Format intl: 228XXXXXXXX (11 digits)
  if (cleaned.length === 8 && /^[79][0-9]{7}$/.test(cleaned)) {
    return true;
  }
  if (cleaned.length === 11 && cleaned.startsWith('228') && /^228[79][0-9]{7}$/.test(cleaned)) {
    return true;
  }
  // Allow other valid 8-12 digit phone numbers for flexibility
  return cleaned.length >= 8 && cleaned.length <= 15 && /^[0-9]+$/.test(cleaned);
}

export type MobileMoneyOperator = 'mixx' | 'flooz' | 'unknown';

export function getMobileMoneyOperator(phone: string): MobileMoneyOperator {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  const local = cleaned.startsWith('228') && cleaned.length === 11 ? cleaned.slice(3) : cleaned;
  if (!/^\d{8}$/.test(local)) return 'unknown';
  if (/^(90|91|92|93|70|71|72|73)\d{6}$/.test(local)) return 'mixx';
  if (/^(96|97|98|99|79)\d{6}$/.test(local)) return 'flooz';
  return 'unknown';
}

export function getMobileMoneyLabel(phone: string): string {
  const operator = getMobileMoneyOperator(phone);
  if (operator === 'mixx') return 'Mixx by Yas';
  if (operator === 'flooz') return 'Fozz';
  return 'Réseau non reconnu';
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  if (cleaned.length === 8) {
    return `+228 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('228')) {
    const local = cleaned.slice(3);
    return `+228 ${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)}`;
  }
  return phone;
}

// Format date in French
export function formatDateFr(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatShortDateFr(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}
