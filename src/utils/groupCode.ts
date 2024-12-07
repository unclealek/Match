// Generate a random 6-character alphanumeric code
export function generateGroupCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Format a group code with dashes for readability (e.g., ABC-123)
export function formatGroupCode(code: string): string {
  if (code.length !== 6) return code;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

// Remove formatting from group code
export function normalizeGroupCode(code: string): string {
  return code.replace(/-/g, '').toUpperCase();
}

// Format a date to a readable string
export function formatDate(date: Date | undefined): string {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
