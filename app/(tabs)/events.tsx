
import React, { useState, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Platform,
  useColorScheme,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantColors } from '@/constants/Colors';
import { supabase } from '@/app/integrations/supabase/client';
import type { Database } from '@/app/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

export default function EventsScreen() {
  const { userRole } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors[userRole || 'customer'][isDark ? 'dark' : 'light'];

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error in loadEvents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (rsvpLink: string) => {
    try {
      const supported = await Linking.canOpenURL(rsvpLink);
      if (supported) {
        await Linking.openURL(rsvpLink);
      } else {
        console.error('Cannot open URL:', rsvpLink);
      }
    } catch (error) {
      console.error('Error opening RSVP link:', error);
    }
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => router.push('/(tabs)/profile')}
      style={{ marginRight: 16 }}
    >
      <IconSymbol name="person.circle.fill" size={28} color={colors.accent} />
    </Pressable>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Events & Entertainment',
          headerRight: renderHeaderRight,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Upcoming Events
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Join us for special events and entertainment
              </Text>
            </View>

            {/* Events List */}
            {events.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
                <IconSymbol name="calendar" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.text }]}>
                  No Upcoming Events
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                  Check back soon for exciting events and entertainment!
                </Text>
              </View>
            ) : (
              events.map((event) => (
                <View
                  key={event.id}
                  style={[styles.eventCard, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={styles.eventDateBadge}>
                    <View style={[styles.dateBadge, { backgroundColor: colors.accent }]}>
                      <Text style={styles.dateBadgeDay}>
                        {new Date(event.event_date).getDate()}
                      </Text>
                      <Text style={styles.dateBadgeMonth}>
                        {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={[styles.eventTitle, { color: colors.text }]}>
                        {event.title}
                      </Text>
                      <View style={styles.eventMeta}>
                        <IconSymbol name="clock.fill" size={14} color={colors.textSecondary} />
                        <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                          {new Date(event.event_date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      {event.location && (
                        <View style={styles.eventMeta}>
                          <IconSymbol name="location.fill" size={14} color={colors.textSecondary} />
                          <Text style={[styles.eventLocation, { color: colors.textSecondary }]}>
                            {event.location}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {event.description && (
                    <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                      {event.description}
                    </Text>
                  )}

                  {event.rsvp_link && (
                    <Pressable
                      style={[styles.rsvpButton, { backgroundColor: colors.accent }]}
                      onPress={() => handleRSVP(event.rsvp_link!)}
                    >
                      <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                      <Text style={styles.rsvpButtonText}>RSVP Now</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
              <IconSymbol name="info.circle.fill" size={20} color={colors.accent} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Stay Updated
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Follow us on social media to stay informed about upcoming events and special promotions!
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  eventCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  eventDateBadge: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dateBadge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeDay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateBadgeMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
  },
  eventLocation: {
    fontSize: 13,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  rsvpButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
