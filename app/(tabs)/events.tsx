
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

  const events = [
    {
      id: '1',
      title: 'Wine Tasting Night',
      date: 'Friday, March 15',
      time: '7:00 PM - 10:00 PM',
      description: 'Join us for an evening of fine wines paired with our chef&apos;s special appetizers.',
      icon: 'wineglass',
    },
    {
      id: '2',
      title: 'Live Jazz Music',
      date: 'Saturday, March 16',
      time: '8:00 PM - 11:00 PM',
      description: 'Enjoy live jazz performances while dining with us this Saturday evening.',
      icon: 'music.note',
    },
    {
      id: '3',
      title: 'Sunday Brunch',
      date: 'Every Sunday',
      time: '10:00 AM - 2:00 PM',
      description: 'Our famous all-you-can-eat brunch buffet with bottomless mimosas.',
      icon: 'cup.and.saucer.fill',
    },
    {
      id: '4',
      title: 'Cooking Class',
      date: 'Wednesday, March 20',
      time: '6:00 PM - 8:00 PM',
      description: 'Learn to make authentic Italian pasta from our head chef.',
      icon: 'flame.fill',
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
            title: 'Events & Social',
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
          <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
            <IconSymbol name="calendar" size={32} color={colors.accent} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Upcoming Events
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Join us for special occasions and social gatherings
            </Text>
          </View>

          {events.map((event) => (
            <View
              key={event.id}
              style={[styles.eventCard, { backgroundColor: colors.cardBackground }]}
            >
              <View style={styles.eventHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                  <IconSymbol name={event.icon as any} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.eventHeaderText}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>
                    {event.title}
                  </Text>
                  <Text style={[styles.eventDate, { color: colors.accent }]}>
                    {event.date}
                  </Text>
                </View>
              </View>
              <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                ⏰ {event.time}
              </Text>
              <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                {event.description}
              </Text>
              <Pressable
                style={[styles.rsvpButton, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.rsvpButtonText}>RSVP</Text>
              </Pressable>
            </View>
          ))}

          <View style={[styles.socialSection, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="person.3.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Follow Us
              </Text>
            </View>
            <Text style={[styles.socialText, { color: colors.textSecondary }]}>
              Stay connected with us on social media for daily updates, special offers, and behind-the-scenes content!
            </Text>
            <View style={styles.socialButtons}>
              <Pressable style={[styles.socialButton, { backgroundColor: colors.background }]}>
                <Text style={[styles.socialButtonText, { color: colors.text }]}>
                  📱 Instagram
                </Text>
              </Pressable>
              <Pressable style={[styles.socialButton, { backgroundColor: colors.background }]}>
                <Text style={[styles.socialButtonText, { color: colors.text }]}>
                  👍 Facebook
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
  },
  header: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  eventCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventHeaderText: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  rsvpButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rsvpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  socialSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  socialText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
