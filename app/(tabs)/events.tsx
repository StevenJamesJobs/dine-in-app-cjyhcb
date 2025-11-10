
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

export default function EventsScreen() {
  const { userRole, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!userRole) return null;

  const colors = restaurantColors[userRole][isDark ? 'dark' : 'light'];

  const renderHeaderRight = () => (
    <Pressable onPress={logout} style={styles.headerButtonContainer}>
      <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={colors.accent} />
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Events',
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
          {/* Upcoming Events */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="calendar" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Upcoming Events
              </Text>
            </View>
            <View style={styles.eventCard}>
              <View style={[styles.eventDate, { backgroundColor: colors.accent }]}>
                <Text style={styles.eventDateDay}>15</Text>
                <Text style={styles.eventDateMonth}>MAR</Text>
              </View>
              <View style={styles.eventContent}>
                <Text style={[styles.eventTitle, { color: colors.text }]}>
                  Live Music Night
                </Text>
                <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                  Join us for an evening of live jazz music
                </Text>
                <View style={styles.eventMeta}>
                  <IconSymbol name="clock.fill" size={14} color={colors.textSecondary} />
                  <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                    7:00 PM - 10:00 PM
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.eventCard}>
              <View style={[styles.eventDate, { backgroundColor: colors.accent }]}>
                <Text style={styles.eventDateDay}>22</Text>
                <Text style={styles.eventDateMonth}>MAR</Text>
              </View>
              <View style={styles.eventContent}>
                <Text style={[styles.eventTitle, { color: colors.text }]}>
                  Wine Tasting Event
                </Text>
                <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                  Sample our finest selection of wines
                </Text>
                <View style={styles.eventMeta}>
                  <IconSymbol name="clock.fill" size={14} color={colors.textSecondary} />
                  <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                    6:00 PM - 9:00 PM
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weekly Specials */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="star.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Weekly Specials
              </Text>
            </View>
            <View style={styles.specialCard}>
              <View style={styles.specialHeader}>
                <Text style={[styles.specialDay, { color: colors.accent }]}>
                  Monday
                </Text>
                <Text style={[styles.specialTitle, { color: colors.text }]}>
                  Burger Night
                </Text>
              </View>
              <Text style={[styles.specialDescription, { color: colors.textSecondary }]}>
                All burgers 20% off with any drink purchase
              </Text>
            </View>
            <View style={styles.specialCard}>
              <View style={styles.specialHeader}>
                <Text style={[styles.specialDay, { color: colors.accent }]}>
                  Wednesday
                </Text>
                <Text style={[styles.specialTitle, { color: colors.text }]}>
                  Wine Down Wednesday
                </Text>
              </View>
              <Text style={[styles.specialDescription, { color: colors.textSecondary }]}>
                Half price on all wines by the glass
              </Text>
            </View>
            <View style={styles.specialCard}>
              <View style={styles.specialHeader}>
                <Text style={[styles.specialDay, { color: colors.accent }]}>
                  Friday
                </Text>
                <Text style={[styles.specialTitle, { color: colors.text }]}>
                  Fresh Catch Friday
                </Text>
              </View>
              <Text style={[styles.specialDescription, { color: colors.textSecondary }]}>
                Special seafood selections from local fishermen
              </Text>
            </View>
          </View>

          {/* Social Engagements */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="person.3.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Social Engagements
              </Text>
            </View>
            <Text style={[styles.socialDescription, { color: colors.textSecondary }]}>
              Follow us on social media to stay updated on all our events, 
              special offers, and behind-the-scenes content!
            </Text>
            <View style={styles.socialButtons}>
              <Pressable style={[styles.socialButton, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol name="camera.fill" size={20} color={colors.accent} />
                <Text style={[styles.socialButtonText, { color: colors.accent }]}>
                  Instagram
                </Text>
              </Pressable>
              <Pressable style={[styles.socialButton, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol name="f.square.fill" size={20} color={colors.accent} />
                <Text style={[styles.socialButtonText, { color: colors.accent }]}>
                  Facebook
                </Text>
              </Pressable>
            </View>
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
    marginRight: 10,
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
  eventCard: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  eventDate: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDateDay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventDateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventTime: {
    fontSize: 13,
  },
  specialCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  specialHeader: {
    marginBottom: 8,
  },
  specialDay: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  specialDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  socialDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
