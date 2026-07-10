'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isOfflineMode: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: Error | null; message?: string }>;
  signUp: (email: string, password?: string) => Promise<{ error: Error | null; message?: string }>;
  signOut: () => Promise<{ error: Error | null }>;
  sendMagicLink: (email: string) => Promise<{ error: Error | null; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Offline mode: Load mock user if present in localStorage
      const mockUserStr = localStorage.getItem('drip_mock_user');
      if (mockUserStr) {
        try {
          setUser(JSON.parse(mockUserStr));
        } catch (e) {
          localStorage.removeItem('drip_mock_user');
        }
      }
      setLoading(false);
      return;
    }

    // Direct Supabase session listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password?: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Mock log in
      const mockUser = {
        id: 'mock-user-12345',
        email,
        user_metadata: { full_name: email.split('@')[0] },
        created_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
      } as unknown as User;
      localStorage.setItem('drip_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { error: null, message: 'Logged in successfully in Offline Demo Mode.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'default-password-if-blank',
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password?: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Mock signup and login
      const mockUser = {
        id: 'mock-user-12345',
        email,
        user_metadata: { full_name: email.split('@')[0] },
        created_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
      } as unknown as User;
      localStorage.setItem('drip_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { error: null, message: 'Account simulated and logged in locally.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || 'default-password-if-blank',
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem('drip_mock_user');
      setUser(null);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const sendMagicLink = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Simulate Magic Link log in
      const mockUser = {
        id: 'mock-user-12345',
        email,
        user_metadata: { full_name: email.split('@')[0] },
        created_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
      } as unknown as User;
      localStorage.setItem('drip_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { error: null, message: 'Magic Link verification simulated. Logged in offline.' };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { error: null, message: 'Magic link sent to your email.' };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOfflineMode,
        signIn,
        signUp,
        signOut,
        sendMagicLink,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
