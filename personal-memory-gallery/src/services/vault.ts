// Vault Security Service for Personal Memory Gallery

const STORAGE_KEYS = {
  PASSWORD: 'memory_gallery_vault_password',
  SESSION_UNLOCKED: 'memory_gallery_vault_unlocked',
};

const DEFAULT_PASSWORD = 'memory123';

export const vaultService = {
  // Get current configured password (defaults to memory123)
  getPassword(): string {
    return localStorage.getItem(STORAGE_KEYS.PASSWORD) || DEFAULT_PASSWORD;
  },

  // Set a new custom password
  setPassword(newPassword: string): void {
    localStorage.setItem(STORAGE_KEYS.PASSWORD, newPassword);
  },

  // Check if currently unlocked in session
  isUnlocked(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.SESSION_UNLOCKED) === 'true';
  },

  // Attempt to unlock with candidate password
  unlock(candidate: string): boolean {
    const current = this.getPassword();
    if (candidate === current) {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_UNLOCKED, 'true');
      return true;
    }
    return false;
  },

  // Lock the vault
  lock(): void {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_UNLOCKED);
  },
};
