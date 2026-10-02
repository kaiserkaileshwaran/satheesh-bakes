import { db, ref, get, set, remove } from '../firebase/firebase';

export class FirebaseService {
  static async getDbData<T>(path: string): Promise<T | null> {
    try {
      const snapshot = await get(ref(db, path));
      if (!snapshot.exists()) return null;
      return snapshot.val() as T;
    } catch (error) {
      console.warn(`[FirebaseService] read failed for ${path}:`, error);
      return null;
    }
  }

  static async setDbData(path: string, value: unknown): Promise<void> {
    try {
      await set(ref(db, path), value);
    } catch (error) {
      console.warn(`[FirebaseService] write failed for ${path}:`, error);
    }
  }

  static async removeDbData(path: string): Promise<void> {
    try {
      await remove(ref(db, path));
    } catch (error) {
      console.warn(`[FirebaseService] remove failed for ${path}:`, error);
    }
  }

}
