import { v4 as uuidv4 } from 'uuid';

export function generateUniqueGroupCode(): string {
  return uuidv4(); // Generates a unique UUID
}
