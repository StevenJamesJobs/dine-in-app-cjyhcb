
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
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantColors } from '@/constants/Colors';

export default function RewardsScreen() {
  const { userRole, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!userRole) return null;

  const colors = restaurantColors[userRole][isDark ? 'dark' : 'light'];

  const coupons = [
    {
      id: '1',
      title: '20% Off Your Next Visit',
      description: 'Valid on orders over $30',
      expiry: 'Expires: March 31, 2024',
      code: 'SAVE20',
    },
    {
      id: '2',
      title: 'Free Appetizer',
      description: 'With any entree purchase',
      expiry: 'Expires: April 15, 2024',
      code: 'FREEAPP',
    },
    {
      id: '3',
      title: 'Buy One Get One Free',
      description: 'On all desserts',
      expiry: 'Expires: March 25, 2024',
      code: 'BOGO',
    },
  ];

  const renderHeaderRight = () => (
    <Pressable onPress={logout} style={styles.headerButtonContainer}>
      <IconSymbol name="rectangle.portrait.and.arrow.right" color={colors.accent} />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Rewards',
            headerRight: renderHeaderRight,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Points Card */}
          <View style={[styles.pointsCard, { backgroundColor: colors.accent }]}>
            <View style={styles.pointsHeader}>
              <IconSymbol name="star.fill" size={32} color="#FFFFFF" />
              <Text style={styles.pointsTitle}>Your Rewards Points</Text>
            </View>
            <Text style={styles.pointsValue}>1,250</Text>
            <Text style={styles.pointsSubtext}>
              You&apos;re 250 points away from a free meal!
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
          </View>

          {/* How it Works */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="info.circle.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                How It Works
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoNumber, { color: colors.accent }]}>1</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Earn 10 points for every dollar spent
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoNumber, { color: colors.accent }]}>2</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Redeem points for rewards and discounts
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoNumber, { color: colors.accent }]}>3</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Get exclusive member-only offers
              </Text>
            </View>
          </View>

          {/* Active Coupons */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="ticket.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Your Coupons
              </Text>
            </View>
            {coupons.map((coupon) => (
              <View
                key={coupon.id}
                style={[styles.couponCard, { backgroundColor: colors.background }]}
              >
                <View style={styles.couponHeader}>
                  <Text style={[styles.couponTitle, { color: colors.text }]}>
                    {coupon.title}
                  </Text>
                  <View style={[styles.couponBadge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.couponCode}>{coupon.code}</Text>
                  </View>
                </View>
                <Text style={[styles.couponDescription, { color: colors.textSecondary }]}>
                  {coupon.description}
                </Text>
                <Text style={[styles.couponExpiry, { color: colors.accentGray }]}>
                  {coupon.expiry}
                </Text>
                <Pressable
                  style={[styles.useButton, { backgroundColor: colors.accent }]}
                >
                  <Text style={styles.useButtonText}>Use Coupon</Text>
                </Pressable>
              </View>
            ))}
          </View>

          {/* Notifications */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="bell.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Notifications
              </Text>
            </View>
            <Text style={[styles.notificationText, { color: colors.textSecondary }]}>
              🎉 New promotion available! Check your coupons.
            </Text>
            <Text style={[styles.notificationText, { color: colors.textSecondary }]}>
              ⭐ You earned 50 bonus points for your last visit!
            </Text>
          </View>
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
  },
  pointsCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pointsValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pointsSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoNumber: {
    fontSize: 20,
    fontWeight: '700',
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  couponCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  couponBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  couponCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  couponDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  couponExpiry: {
    fontSize: 12,
    marginBottom: 12,
  },
  useButton: {
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
});
