
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/button';
import { restaurantColors } from '@/constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'employee'>('customer');
  const { login, loginWithGoogle } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = restaurantColors[selectedRole][isDark ? 'dark' : 'light'];

  const handleLogin = async () => {
    if (!email || !password) {
      console.log('Please fill in all fields');
      return;
    }
    try {
      await login(email, password, selectedRole);
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.log('Login error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(selectedRole);
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.log('Google login error:', error);
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
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to continue
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
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
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

          {selectedRole === 'employee' && (
            <View style={[styles.managerHint, { backgroundColor: colors.cardBackground }]}>
              <IconSymbol name="info.circle.fill" size={16} color={colors.accent} />
              <Text style={[styles.managerHintText, { color: colors.textSecondary }]}>
                Tip: Include &quot;manager&quot; in your email to access management features
              </Text>
            </View>
          )}

          <Pressable
            style={[styles.loginButton, { backgroundColor: colors.accent }]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
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

          <Pressable style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.accent }]}>
              Forgot password?
            </Text>
          </Pressable>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>
              Don&apos;t have an account?{' '}
            </Text>
            <Pressable>
              <Text style={[styles.signupLink, { color: colors.accent }]}>
                Sign up
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
    fontSize: 16,
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
  managerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  managerHintText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
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
