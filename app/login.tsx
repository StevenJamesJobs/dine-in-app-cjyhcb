
import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantColors } from '@/constants/Colors';
import type { Database } from '@/app/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signUp, loginWithGoogle } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = restaurantColors[selectedRole === 'manager' ? 'employee' : selectedRole][isDark ? 'dark' : 'light'];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const { error } = await login(email, password);
      
      if (error) {
        Alert.alert('Login Failed', error);
        return;
      }

      router.replace('/(tabs)/(home)/');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const { error } = await signUp(email, password, selectedRole, fullName);
      
      if (error) {
        if (error.includes('verify your account')) {
          Alert.alert(
            'Verification Required',
            'Please check your email to verify your account before logging in.',
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          );
        } else {
          Alert.alert('Signup Failed', error);
        }
        return;
      }

      Alert.alert(
        'Success',
        'Account created successfully! You can now log in.',
        [{ text: 'OK', onPress: () => setIsSignUp(false) }]
      );
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await loginWithGoogle();
      
      if (error) {
        Alert.alert('Google Login Failed', error);
        return;
      }

      // OAuth will redirect automatically
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.logoText, { color: colors.accent }]}>
            McLoone&apos;s
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>
            I am a:
          </Text>
          <View style={styles.roleButtons}>
            <Pressable
              style={[
                styles.roleButton,
                { backgroundColor: colors.cardBackground },
                selectedRole === 'customer' && { 
                  backgroundColor: colors.accent,
                },
              ]}
              onPress={() => setSelectedRole('customer')}
            >
              <IconSymbol 
                name="person.fill" 
                size={24} 
                color={selectedRole === 'customer' ? '#FFFFFF' : colors.text} 
              />
              <Text
                style={[
                  styles.roleButtonText,
                  { color: colors.text },
                  selectedRole === 'customer' && { color: '#FFFFFF' },
                ]}
              >
                Customer
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.roleButton,
                { backgroundColor: colors.cardBackground },
                selectedRole === 'employee' && { 
                  backgroundColor: colors.accent,
                },
              ]}
              onPress={() => setSelectedRole('employee')}
            >
              <IconSymbol 
                name="briefcase.fill" 
                size={24} 
                color={selectedRole === 'employee' ? '#FFFFFF' : colors.text} 
              />
              <Text
                style={[
                  styles.roleButtonText,
                  { color: colors.text },
                  selectedRole === 'employee' && { color: '#FFFFFF' },
                ]}
              >
                Employee
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.roleButton,
                { backgroundColor: colors.cardBackground },
                selectedRole === 'manager' && { 
                  backgroundColor: colors.accent,
                },
              ]}
              onPress={() => setSelectedRole('manager')}
            >
              <IconSymbol 
                name="star.fill" 
                size={24} 
                color={selectedRole === 'manager' ? '#FFFFFF' : colors.text} 
              />
              <Text
                style={[
                  styles.roleButtonText,
                  { color: colors.text },
                  selectedRole === 'manager' && { color: '#FFFFFF' },
                ]}
              >
                Manager
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Login/Signup Form */}
        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                Full Name (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                    borderColor: colors.accentGray,
                  },
                ]}
                placeholder="John Doe"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.accentGray,
                },
              ]}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Password
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.accentGray,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            style={[styles.loginButton, { backgroundColor: colors.accent }]}
            onPress={isSignUp ? handleSignUp : handleLogin}
          >
            <Text style={styles.loginButtonText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.accentGray }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              or
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.accentGray }]} />
          </View>

          <Pressable
            style={[
              styles.googleButton,
              { 
                backgroundColor: colors.cardBackground,
                borderColor: colors.accentGray,
              },
            ]}
            onPress={handleGoogleLogin}
          >
            <IconSymbol name="globe" size={20} color={colors.text} />
            <Text style={[styles.googleButtonText, { color: colors.text }]}>
              Continue with Google
            </Text>
          </Pressable>

          {!isSignUp && (
            <Pressable style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.accent }]}>
                Forgot password?
              </Text>
            </Pressable>
          )}

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <Pressable onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={[styles.signupLink, { color: colors.accent }]}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  loginButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
