
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/app/integrations/supabase/types';
import { router } from 'expo-router';
import { Alert } from 'react-native';

type UserRole = Database['public']['Enums']['user_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isManager: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, role: UserRole, fullName?: string) => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log('Initializing auth state...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out - clearing state and redirecting...');
          setUser(null);
          setProfile(null);
          // Use replace to ensure we can't go back
          router.replace('/login');
        } else {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          } else {
            setProfile(null);
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    fullName?: string
  ): Promise<{ error: string | null }> => {
    try {
      console.log('Signing up user:', email, 'with role:', role);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            role,
            full_name: fullName || '',
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        return { error: error.message };
      }

      if (data.user && !data.session) {
        return { 
          error: 'Please check your email to verify your account before logging in.' 
        };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Signup exception:', error);
      return { error: error.message || 'An error occurred during signup' };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      console.log('Logging in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { error: error.message };
      }

      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
      }

      return { error: null };
    } catch (error: any) {
      console.error('Login exception:', error);
      return { error: error.message || 'An error occurred during login' };
    }
  };

  const loginWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      console.log('Logging in with Google...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://natively.dev/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google login error:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Google login exception:', error);
      return { error: error.message || 'An error occurred during Google login' };
    }
  };

  const logout = async () => {
    try {
      console.log('Logout initiated...');
      
      // Sign out from Supabase - this will trigger the SIGNED_OUT event
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        // Even if there's an error, clear local state
        setUser(null);
        setProfile(null);
        router.replace('/login');
      }
      
      // The SIGNED_OUT event handler will clear state and navigate
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout exception:', error);
      // Force clear state and navigate even on error
      setUser(null);
      setProfile(null);
      router.replace('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userRole: profile?.role ?? null,
        isAuthenticated: !!user,
        isManager: profile?.role === 'manager',
        loading,
        login,
        signUp,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
