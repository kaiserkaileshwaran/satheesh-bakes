import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserProfile } from '../types';
import { createDefaultAvatar } from '../utils/avatarGenerator';
import { StorageService } from '../services/storageService';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, updateEmail, updatePassword } from '../firebase/firebase';
import { GlobalLoader } from '../components/ui/GlobalLoader';

interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateAccount: (currentPassword: string, newEmail?: string, newPassword?: string) => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  preferredBranch: string;
  setPreferredBranch: (branchId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [preferredBranch, setPreferredBranchState] = useState<string>('branch-anna-nagar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await StorageService.initializeStorage();
      } catch (err) {
        console.warn('Storage initialization failed', err);
      }

      const activeUser = StorageService.getCurrentUser();
      if (activeUser) {
        setUser(activeUser);
        setUserProfile(activeUser);
        setPreferredBranchState(activeUser.preferredBranch || 'branch-anna-nagar');
      }

      setLoading(false);
    };

    initializeData();
  }, []);

  // Removed the problematic useEffect that clears current user on mount

  const setPreferredBranch = (branchId: string) => {
    setPreferredBranchState(branchId);
    if (user) {
      const updated = { ...user, preferredBranch: branchId };
      setUser(updated);
      setUserProfile(updated);
      StorageService.saveUser(updated);
    }
  };

  const signIn = async (email: string, password: string) => {
    const account = StorageService.getUserByEmail(email);
    if (!account || account.password !== password) {
      throw new Error('Invalid email or password.');
    }
    const profile = { ...account, lastLogin: Date.now() };
    StorageService.saveUser(profile);
    StorageService.setCurrentUser(profile);
    setUser(profile);
    setUserProfile(profile);

    if (profile.role === 'admin') {
      StorageService.addActivityLog(profile.fullName || 'Admin', profile.role, 'Login', 'Auth', `Admin logged in: ${profile.email}`);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      if (!googleUser.email) {
        throw new Error('Google account did not return an email address.');
      }
      const email = googleUser.email;
      const existing = StorageService.getUserByEmail(email);
      const displayName = googleUser.displayName || email.split('@')[0];
      const newProfile: UserProfile = existing
        ? { ...existing, lastLogin: Date.now() }
        : {
            uid: `google-${Date.now()}`,
            role: 'customer',
            fullName: displayName,
            displayName,
            username: email.split('@')[0],
            email,
            password: undefined,
            phone: undefined,
            avatar: createDefaultAvatar(displayName),
            preferredBranch: 'branch-anna-nagar',
            provider: 'google',
            status: 'active',
            createdAt: Date.now(),
            lastLogin: Date.now(),
          };
      StorageService.saveUser(newProfile);
      StorageService.setCurrentUser(newProfile);
      setUser(newProfile);
      setUserProfile(newProfile);
    } catch (err: unknown) {
      throw new Error(
        err instanceof Error ? err.message : 'Google sign in failed.',
        { cause: err }
      );
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (StorageService.getUserByEmail(email)) {
      throw new Error('Email address already exists.');
    }
    const newUser: UserProfile = {
      uid: `user-${Date.now()}`,
      role: 'customer',
      fullName: displayName,
      username: email.split('@')[0],
      email,
      password,
      phone: undefined,
      avatar: createDefaultAvatar(displayName),
      preferredBranch: 'branch-anna-nagar',
      provider: 'local',
      status: 'active',
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };
    StorageService.saveUser(newUser);
    StorageService.setCurrentUser(newUser);
    setUser(newUser);
    setUserProfile(newUser);
  };

  const resetPassword = async (email: string) => {
    const account = StorageService.getUserByEmail(email);
    if (!account) {
      throw new Error('No account found for that email.');
    }
    account.password = 'admin@test123';
    StorageService.saveUser(account);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('No authenticated user.');
    }
    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }
    const updated = { ...user, password: newPassword };
    StorageService.saveUser(updated);
    StorageService.setCurrentUser(updated);
    setUser(updated);
    setUserProfile(updated);
  };

  const updateAccount = async (currentPassword: string, newEmail?: string, newPassword?: string) => {
    if (!user) {
      throw new Error('No authenticated user.');
    }
    
    // Verify local credentials first
    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }

    const firebaseUser = auth.currentUser;
    const isFirebaseUser = firebaseUser && firebaseUser.email && firebaseUser.email.toLowerCase() === user.email.toLowerCase();

    if (isFirebaseUser) {
      // Reauthenticate Firebase Auth user by signing in again
      await signInWithEmailAndPassword(auth, user.email, currentPassword);
      
      // Update email in Firebase Auth
      if (newEmail && newEmail.toLowerCase() !== user.email.toLowerCase()) {
        await updateEmail(auth.currentUser!, newEmail);
      }
      
      // Update password in Firebase Auth
      if (newPassword) {
        await updatePassword(auth.currentUser!, newPassword);
      }
    }

    // Now update local profile
    const updated = { 
      ...user, 
      email: newEmail ? newEmail : user.email,
      password: newPassword ? newPassword : user.password,
      updatedAt: Date.now()
    };

    StorageService.saveUser(updated);
    StorageService.setCurrentUser(updated);
    setUser(updated);
    setUserProfile(updated);

    // Logging
    if (newEmail && newEmail.toLowerCase() !== user.email.toLowerCase()) {
      StorageService.addActivityLog(user.fullName || 'Admin', user.role, 'Email Changed', 'Auth', `Admin changed email from ${user.email} to ${newEmail}`);
    }
    if (newPassword) {
      StorageService.addActivityLog(user.fullName || 'Admin', user.role, 'Password Changed', 'Auth', `Admin changed account password`);
    }
  };

  const signOut = async () => {
    if (user?.role === 'admin') {
      StorageService.addActivityLog(user.fullName || 'Admin', user.role, 'Logout', 'Auth', `Admin logged out: ${user.email}`);
    }
    StorageService.clearCurrentUser();
    setUser(null);
    setUserProfile(null);
  };

  const logout = async () => {
    await signOut();
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (user) {
      const newProf = { ...user, ...updated };
      const hasChanged = JSON.stringify(newProf) !== JSON.stringify(user);
      if (!hasChanged) return;
      StorageService.saveUser(newProf);
      StorageService.setCurrentUser(newProf);
      setUser(newProf);
      setUserProfile(newProf);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthenticated,
        isAdmin,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        logout,
        resetPassword,
        changePassword,
        updateAccount,
        updateProfile,
        preferredBranch,
        setPreferredBranch,
      }}
    >
      {loading ? <GlobalLoader /> : children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
