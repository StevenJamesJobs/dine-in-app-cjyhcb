
import { useAuth } from '@/contexts/AuthContext';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useEffect } from 'react';
import {
  ScrollView,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { restaurantColors } from '@/constants/Colors';

export default function HomeScreen() {
  const { isAuthenticated, userRole, isManager, loading, profile } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors[userRole || 'customer'][isDark ? 'dark' : 'light'];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading]);

  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', gap: 12, marginRight: 16 }}>
      {isManager && (
        <Pressable onPress={() => router.push('/(tabs)/manager')}>
          <IconSymbol name="wrench.and.screwdriver.fill" size={24} color={colors.accent} />
        </Pressable>
      )}
      <Pressable onPress={() => router.push('/profile')}>
        <IconSymbol name="person.circle.fill" size={28} color={colors.accent} />
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
          headerRight: renderHeaderRight,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {profile?.full_name || profile?.email || 'User'}
          </Text>
          {isManager && (
            <View style={[styles.managerBadge, { backgroundColor: colors.accent }]}>
              <IconSymbol name="star.fill" size={16} color="#FFFFFF" />
              <Text style={styles.managerBadgeText}>Manager</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            {userRole === 'customer' ? (
              <>
                <Pressable
                  style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                  onPress={() => router.push('/(tabs)/events')}
                >
                  <IconSymbol name="calendar" size={32} color={colors.accent} />
                  <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                    Events
                  </Text>
                  <Text style={[styles.actionCardDescription, { color: colors.textSecondary }]}>
                    View upcoming events
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                  onPress={() => router.push('/(tabs)/rewards')}
                >
                  <IconSymbol name="gift.fill" size={32} color={colors.accent} />
                  <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                    Rewards
                  </Text>
                  <Text style={[styles.actionCardDescription, { color: colors.textSecondary }]}>
                    Check your rewards
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                  onPress={() => router.push('/(tabs)/training')}
                >
                  <IconSymbol name="book.fill" size={32} color={colors.accent} />
                  <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                    Training
                  </Text>
                  <Text style={[styles.actionCardDescription, { color: colors.textSecondary }]}>
                    Access materials
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                  onPress={() => router.push('/(tabs)/rewards')}
                >
                  <IconSymbol name="dollarsign.circle.fill" size={32} color={colors.accent} />
                  <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                    My Bucks
                  </Text>
                  <Text style={[styles.actionCardDescription, { color: colors.textSecondary }]}>
                    View your balance
                  </Text>
                </Pressable>
                {isManager && (
                  <Pressable
                    style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                    onPress={() => router.push('/(tabs)/manager')}
                  >
                    <IconSymbol name="wrench.and.screwdriver.fill" size={32} color={colors.accent} />
                    <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                      Manager
                    </Text>
                    <Text style={[styles.actionCardDescription, { color: colors.textSecondary }]}>
                      Manage restaurant
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <IconSymbol name="info.circle.fill" size={24} color={colors.accent} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              {userRole === 'customer' ? 'Welcome to McLoone\'s!' : 'Employee Portal'}
            </Text>
            <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
              {userRole === 'customer'
                ? 'Explore our menu, events, and earn rewards with every visit!'
                : 'Access training materials, view your schedule, and track your McLoone\'s Bucks.'}
            </Text>
          </View>
        </View>
      </ScrollView>
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
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  managerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  managerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionCardDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
