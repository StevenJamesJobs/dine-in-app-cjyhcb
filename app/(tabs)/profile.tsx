
import React from 'react';
import { Stack, router } from 'expo-router';
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
  const { userRole, user, profile, logout } = useAuth();
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Text style={styles.avatarText}>
                  {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.userName, { color: colors.text }]}>
                {profile?.full_name || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email || 'user@mcloones.com'}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: colors.accent + '20' }]}>
                <Text style={[styles.roleBadgeText, { color: colors.accent }]}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Settings */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="gear" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Account Settings
              </Text>
            </View>
            <Pressable style={styles.actionItem}>
              <IconSymbol name="person.fill" size={20} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Edit Profile
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
            <Pressable style={styles.actionItem}>
              <IconSymbol name="bell.fill" size={20} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Notifications
              </Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* App Info */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="info.circle.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                About
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Version
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                1.0.0
              </Text>
            </View>
            <Pressable style={styles.actionItem}>
              <IconSymbol name="doc.text.fill" size={20} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Terms of Service
              </Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.actionItem}>
              <IconSymbol name="hand.raised.fill" size={20} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Privacy Policy
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
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
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
