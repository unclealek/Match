class GiftMatchSystem {
  static async generateMatches(members: string[]): Promise<{ [key: string]: string }> {
    if (members.length < 2) {
      throw new Error('Need at least 2 members to generate matches');
    }

    // Fisher-Yates shuffle algorithm
    const shuffle = (array: string[]): string[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Try to generate valid matches (no self-matches)
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const shuffledMembers = shuffle(members);
      let isValid = true;
      const matches: { [key: string]: string } = {};

      // Check if any member is matched with themselves
      for (let i = 0; i < members.length; i++) {
        const giver = members[i];
        const receiver = shuffledMembers[i];
        
        if (giver === receiver) {
          isValid = false;
          break;
        }
        
        matches[giver] = receiver;
      }

      if (isValid) {
        return matches;
      }

      attempts++;
    }

    throw new Error('Failed to generate valid matches after maximum attempts');
  }
}

export default GiftMatchSystem;
