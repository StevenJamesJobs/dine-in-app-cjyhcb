
import React from 'react';
import { Stack } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Platform,
  useColorScheme,
  Pressable,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantColors } from '@/constants/Colors';

export default function ProfileScreen() {
  const { userRole, user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!userRole) return null;

  const colors = restaurantColors[userRole][isDark ? 'dark' : 'light'];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('User confirmed logout');
            await logout();
          },
        },
      ]
    );
  };

  const renderHeaderRight = () => (
    <Pressable onPress={handleLogout} style={styles.headerButtonContainer}>
      <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={colors.accent} />
    </Pressable>
  );

  if (userRole === 'customer') {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'About Us',
            headerRight: renderHeaderRight,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Restaurant Info */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.logoContainer}>
                <IconSymbol name="fork.knife" size={48} color={colors.accent} />
                <Text style={[styles.restaurantName, { color: colors.text }]}>
                  McLoone&apos;s Restaurant
                </Text>
              </View>
              <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                Welcome to McLoone&apos;s! We&apos;ve been serving delicious, 
                authentic cuisine for over 20 years. Our passion is bringing people together 
                through great food and warm hospitality.
              </Text>
            </View>

            {/* Our Story */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="book.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Our Story
                </Text>
              </View>
              <Text style={[styles.storyText, { color: colors.textSecondary }]}>
                Founded in 2003, McLoone&apos;s started as a small family kitchen with a 
                big dream. Today, we&apos;re proud to serve our community with the same 
                dedication to quality and authenticity that we started with.
              </Text>
            </View>

            {/* Location & Hours */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="location.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Location & Hours
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Address
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  123 Main Street{'\n'}
                  Anytown, ST 12345
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Hours
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  Mon-Thu: 11:00 AM - 10:00 PM{'\n'}
                  Fri-Sat: 11:00 AM - 11:00 PM{'\n'}
                  Sunday: 10:00 AM - 9:00 PM
                </Text>
              </View>
            </View>

            {/* Contact */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="phone.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Contact Us
                </Text>
              </View>
              <View style={styles.contactRow}>
                <IconSymbol name="phone.fill" size={20} color={colors.accent} />
                <Text style={[styles.contactText, { color: colors.text }]}>
                  (555) 123-4567
                </Text>
              </View>
              <View style={styles.contactRow}>
                <IconSymbol name="envelope.fill" size={20} color={colors.accent} />
                <Text style={[styles.contactText, { color: colors.text }]}>
                  info@mcloones.com
                </Text>
              </View>
              <View style={styles.contactRow}>
                <IconSymbol name="globe" size={20} color={colors.accent} />
                <Text style={[styles.contactText, { color: colors.text }]}>
                  www.mcloones.com
                </Text>
              </View>
            </View>

            {/* Logout Button */}
            <Pressable
              style={[styles.logoutButton, { backgroundColor: colors.accent }]}
              onPress={handleLogout}
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </ScrollView>
        </View>
      </>
    );
  }

  // Employee Profile
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerRight: renderHeaderRight,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'E'}
                </Text>
              </View>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.user_metadata?.full_name || 'Employee'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email || 'employee@mcloones.com'}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="square.grid.2x2.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Quick Actions
              </Text>
            </View>
            <Pressable style={styles.actionItem}>
              <IconSymbol name="calendar" size={20} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                View Full Schedule
              </Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.actionItem}>
              <IconSymbol name="clock.fill" size={20} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Time Clock
              </Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.actionItem}>
              <IconSymbol name="dollarsign.circle.fill" size={20} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Payroll Information
              </Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Settings */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="gear" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Settings
              </Text>
            </View>
            <Pressable style={styles.actionItem}>
              <IconSymbol name="bell.fill" size={20} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Notifications
              </Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.actionItem}>
              <IconSymbol name="lock.fill" size={20} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Change Password
              </Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Logout Button */}
          <Pressable
            style={[styles.logoutButton, { backgroundColor: colors.accent }]}
            onPress={handleLogout}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  headerButtonContainer: {
    padding: 6,
    marginRight: 10,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  storyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  actionText: {
    fontSize: 16,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
