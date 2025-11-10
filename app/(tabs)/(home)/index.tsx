
import { useAuth } from '@/contexts/AuthContext';
import { Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import LogoutDropdown from '@/components/LogoutDropdown';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  useColorScheme,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { restaurantColors } from '@/constants/Colors';
import { supabase } from '@/app/integrations/supabase/client';
import type { Database } from '@/app/integrations/supabase/types';

type WeeklySpecial = Database['public']['Tables']['weekly_specials']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type Announcement = Database['public']['Tables']['announcements']['Row'];
type Schedule = Database['public']['Tables']['employee_schedules']['Row'];

export default function HomeScreen() {
  const { isAuthenticated, userRole, isManager, loading, profile, user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors[userRole || 'customer'][isDark ? 'dark' : 'light'];

  const [weeklySpecials, setWeeklySpecials] = useState<WeeklySpecial[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [nextShifts, setNextShifts] = useState<Schedule[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (isAuthenticated && userRole) {
      loadData();
    }
  }, [isAuthenticated, userRole, user]);

  const loadData = async () => {
    try {
      setDataLoading(true);

      if (userRole === 'customer') {
        // Load weekly specials
        const { data: specialsData } = await supabase
          .from('weekly_specials')
          .select('*')
          .eq('is_active', true)
          .lte('start_date', new Date().toISOString().split('T')[0])
          .gte('end_date', new Date().toISOString().split('T')[0])
          .order('created_at', { ascending: false })
          .limit(3);

        setWeeklySpecials(specialsData || []);

        // Load upcoming events
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .eq('is_published', true)
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(2);

        setUpcomingEvents(eventsData || []);
      } else if (userRole === 'employee' || userRole === 'manager') {
        // Load announcements
        const { data: announcementsData } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .in('target_role', [userRole, 'both'])
          .order('created_at', { ascending: false })
          .limit(3);

        setAnnouncements(announcementsData || []);

        // Load next shifts
        if (user) {
          const { data: shiftsData } = await supabase
            .from('employee_schedules')
            .select('*')
            .eq('employee_id', user.id)
            .gte('shift_date', new Date().toISOString().split('T')[0])
            .order('shift_date', { ascending: true })
            .order('start_time', { ascending: true })
            .limit(3);

          setNextShifts(shiftsData || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const renderHeaderLeft = () => (
    <View style={{ marginLeft: 16 }}>
      <LogoutDropdown />
    </View>
  );

  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', gap: 12, marginRight: 16 }}>
      {isManager && (
        <Pressable onPress={() => router.push('/(tabs)/manager')}>
          <IconSymbol name="wrench.and.screwdriver.fill" size={24} color={colors.accent} />
        </Pressable>
      )}
      <Pressable onPress={() => router.push('/(tabs)/profile')}>
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

  // Customer Home Screen
  if (userRole === 'customer') {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Welcome',
            headerLeft: renderHeaderLeft,
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
              Welcome to
            </Text>
            <Text style={[styles.restaurantName, { color: colors.text }]}>
              McLoone&apos;s Restaurant
            </Text>
          </View>

          {/* Weekly Specials */}
          {weeklySpecials.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="star.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Weekly Specials
                </Text>
              </View>
              {weeklySpecials.map((special) => (
                <View
                  key={special.id}
                  style={[styles.specialCard, { backgroundColor: colors.cardBackground }]}
                >
                  <Text style={[styles.specialTitle, { color: colors.text }]}>
                    {special.title}
                  </Text>
                  {special.description && (
                    <Text style={[styles.specialDescription, { color: colors.textSecondary }]}>
                      {special.description}
                    </Text>
                  )}
                  {special.price && (
                    <Text style={[styles.specialPrice, { color: colors.accent }]}>
                      ${special.price}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="calendar" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Upcoming Events
                </Text>
              </View>
              {upcomingEvents.map((event) => (
                <View
                  key={event.id}
                  style={[styles.eventCard, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>
                      {event.title}
                    </Text>
                    <Text style={[styles.eventDate, { color: colors.accent }]}>
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  {event.description && (
                    <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
                      {event.description}
                    </Text>
                  )}
                </View>
              ))}
              <Pressable
                style={[styles.viewAllButton, { backgroundColor: colors.accent + '20' }]}
                onPress={() => router.push('/(tabs)/events')}
              >
                <Text style={[styles.viewAllButtonText, { color: colors.accent }]}>
                  View All Events
                </Text>
                <IconSymbol name="chevron.right" size={16} color={colors.accent} />
              </Pressable>
            </View>
          )}

          {/* Contact Information */}
          <View style={[styles.contactCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="phone.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Contact Us
              </Text>
            </View>
            <View style={styles.contactRow}>
              <IconSymbol name="phone.fill" size={18} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                (555) 123-4567
              </Text>
            </View>
            <View style={styles.contactRow}>
              <IconSymbol name="envelope.fill" size={18} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                info@mcloones.com
              </Text>
            </View>
            <View style={styles.contactRow}>
              <IconSymbol name="location.fill" size={18} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                123 Main Street, Anytown, ST 12345
              </Text>
            </View>
          </View>
        </ScrollView>
      </>
    );
  }

  // Employee/Manager Home Screen
  return (
    <>
      <Stack.Screen
        options={{
          title: isManager ? 'Manager Dashboard' : 'Employee Dashboard',
          headerLeft: renderHeaderLeft,
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

        {/* Weather Widget - Placeholder */}
        <View style={[styles.weatherCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.weatherHeader}>
            <IconSymbol name="cloud.sun.fill" size={32} color={colors.accent} />
            <View style={styles.weatherInfo}>
              <Text style={[styles.weatherTemp, { color: colors.text }]}>
                72°F
              </Text>
              <Text style={[styles.weatherCondition, { color: colors.textSecondary }]}>
                Partly Cloudy
              </Text>
            </View>
          </View>
          <Text style={[styles.weatherLocation, { color: colors.textSecondary }]}>
            Local Weather
          </Text>
        </View>

        {/* Announcements */}
        {announcements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="megaphone.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Announcements
              </Text>
            </View>
            {announcements.map((announcement) => (
              <View
                key={announcement.id}
                style={[styles.announcementCard, { backgroundColor: colors.cardBackground }]}
              >
                <Text style={[styles.announcementTitle, { color: colors.text }]}>
                  {announcement.title}
                </Text>
                <Text style={[styles.announcementContent, { color: colors.textSecondary }]}>
                  {announcement.content}
                </Text>
                <Text style={[styles.announcementDate, { color: colors.textSecondary }]}>
                  {new Date(announcement.created_at || '').toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Next Shifts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="calendar" size={24} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Next Shifts
            </Text>
          </View>
          {nextShifts.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
              <IconSymbol name="calendar" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No upcoming shifts scheduled
              </Text>
            </View>
          ) : (
            nextShifts.map((shift) => (
              <View
                key={shift.id}
                style={[styles.shiftCard, { backgroundColor: colors.cardBackground }]}
              >
                <View style={styles.shiftHeader}>
                  <Text style={[styles.shiftDate, { color: colors.text }]}>
                    {new Date(shift.shift_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={[styles.shiftTime, { color: colors.accent }]}>
                    {shift.start_time} - {shift.end_time}
                  </Text>
                </View>
                {shift.position && (
                  <Text style={[styles.shiftPosition, { color: colors.textSecondary }]}>
                    Position: {shift.position}
                  </Text>
                )}
                {shift.notes && (
                  <Text style={[styles.shiftNotes, { color: colors.textSecondary }]}>
                    {shift.notes}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <Pressable
              style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => router.push('/(tabs)/training')}
            >
              <IconSymbol name="book.fill" size={32} color={colors.accent} />
              <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                Training
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
            </Pressable>
            {isManager && (
              <>
                <Pressable
                  style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                  onPress={() => router.push('/(tabs)/manager')}
                >
                  <IconSymbol name="wrench.and.screwdriver.fill" size={32} color={colors.accent} />
                  <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                    Manage
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
                  onPress={() => router.push('/(tabs)/employees')}
                >
                  <IconSymbol name="person.2.fill" size={32} color={colors.accent} />
                  <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                    Staff
                  </Text>
                </Pressable>
              </>
            )}
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
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 32,
    fontWeight: '700',
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
  weatherCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: '700',
  },
  weatherCondition: {
    fontSize: 14,
  },
  weatherLocation: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
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
  specialCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  specialDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  specialPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  eventCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactCard: {
    padding: 16,
    borderRadius: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    flex: 1,
  },
  announcementCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  shiftCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  shiftPosition: {
    fontSize: 14,
    marginBottom: 4,
  },
  shiftNotes: {
    fontSize: 13,
    fontStyle: 'italic',
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
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
