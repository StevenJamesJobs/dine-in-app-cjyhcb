
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';
import { restaurantColors } from '@/constants/Colors';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { login, loginWithGoogle } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<'customer' | 'employee'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const colors = restaurantColors[selectedRole][isDark ? 'dark' : 'light'];

  const handleLogin = async () => {
    if (!email || !password) {
      console.log('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password, selectedRole);
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.log('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle(selectedRole);
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.log('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <IconSymbol 
            name="fork.knife" 
            size={60} 
            color={colors.accent}
          />
          <Text style={[styles.title, { color: colors.text }]}>
            Restaurant App
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Welcome back!
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Pressable
            style={[
              styles.roleButton,
              selectedRole === 'customer' && { 
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
              { borderColor: colors.accentGray }
            ]}
            onPress={() => setSelectedRole('customer')}
          >
            <IconSymbol 
              name="person.fill" 
              size={24} 
              color={selectedRole === 'customer' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text style={[
              styles.roleButtonText,
              { color: selectedRole === 'customer' ? '#FFFFFF' : colors.textSecondary }
            ]}>
              Customer
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.roleButton,
              selectedRole === 'employee' && { 
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
              { borderColor: colors.accentGray }
            ]}
            onPress={() => setSelectedRole('employee')}
          >
            <IconSymbol 
              name="briefcase.fill" 
              size={24} 
              color={selectedRole === 'employee' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text style={[
              styles.roleButtonText,
              { color: selectedRole === 'employee' ? '#FFFFFF' : colors.textSecondary }
            ]}>
              Employee
            </Text>
          </Pressable>
        </View>

        {/* Login Form */}
        <View style={[styles.formContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            Sign in as {selectedRole}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.accentGray,
              }]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.accentGray,
              }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
          </View>

          <Pressable style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.accent }]}>
              Forgot password?
            </Text>
          </Pressable>

          <Button
            onPress={handleLogin}
            loading={isLoading}
            style={{ 
              backgroundColor: colors.accent,
              marginTop: 8,
            }}
            textStyle={{ color: '#FFFFFF' }}
          >
            Sign In
          </Button>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.accentGray }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.accentGray }]} />
          </View>

          <Pressable
            style={[styles.googleButton, { 
              borderColor: colors.accentGray,
              backgroundColor: colors.background,
            }]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <IconSymbol name="globe" size={20} color={colors.text} />
            <Text style={[styles.googleButtonText, { color: colors.text }]}>
              Continue with Google
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
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
