
import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import {
  ScrollView,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  useColorScheme,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantColors } from '@/constants/Colors';

export default function HomeScreen() {
  const { userRole, isAuthenticated, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  if (!userRole) {
    return null;
  }

  const colors = restaurantColors[userRole][isDark ? 'dark' : 'light'];

  const renderHeaderRight = () => (
    <Pressable
      onPress={logout}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="rectangle.portrait.and.arrow.right" color={colors.accent} />
    </Pressable>
  );

  if (userRole === 'customer') {
    return (
      <>
        {Platform.OS === 'ios' && (
          <Stack.Screen
            options={{
              title: 'Menu & Specials',
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
            {/* Weekly Specials */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="star.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Weekly Specials
                </Text>
              </View>
              <View style={styles.specialItem}>
                <Text style={[styles.specialName, { color: colors.text }]}>
                  🍕 Margherita Pizza
                </Text>
                <Text style={[styles.specialPrice, { color: colors.accent }]}>
                  $12.99
                </Text>
                <Text style={[styles.specialDescription, { color: colors.textSecondary }]}>
                  Fresh mozzarella, basil, and tomato sauce on our signature crust
                </Text>
              </View>
              <View style={styles.specialItem}>
                <Text style={[styles.specialName, { color: colors.text }]}>
                  🥗 Caesar Salad
                </Text>
                <Text style={[styles.specialPrice, { color: colors.accent }]}>
                  $8.99
                </Text>
                <Text style={[styles.specialDescription, { color: colors.textSecondary }]}>
                  Crisp romaine lettuce with parmesan and house-made dressing
                </Text>
              </View>
            </View>

            {/* Menu Categories */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="list.bullet" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Menu Categories
                </Text>
              </View>
              <View style={styles.categoryGrid}>
                {['Appetizers', 'Main Courses', 'Desserts', 'Beverages'].map((category) => (
                  <Pressable
                    key={category}
                    style={[styles.categoryCard, { backgroundColor: colors.background }]}
                  >
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Popular Items */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="flame.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Popular Items
                </Text>
              </View>
              <View style={styles.menuItem}>
                <Text style={[styles.menuItemName, { color: colors.text }]}>
                  🍔 Classic Burger
                </Text>
                <Text style={[styles.menuItemPrice, { color: colors.accent }]}>$14.99</Text>
              </View>
              <View style={styles.menuItem}>
                <Text style={[styles.menuItemName, { color: colors.text }]}>
                  🍝 Spaghetti Carbonara
                </Text>
                <Text style={[styles.menuItemPrice, { color: colors.accent }]}>$16.99</Text>
              </View>
              <View style={styles.menuItem}>
                <Text style={[styles.menuItemName, { color: colors.text }]}>
                  🍰 Chocolate Cake
                </Text>
                <Text style={[styles.menuItemPrice, { color: colors.accent }]}>$7.99</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  // Employee Dashboard
  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Dashboard',
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
          {/* Daily Info */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="calendar" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Today&apos;s Information
              </Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <View style={styles.infoItem}>
              <IconSymbol name="exclamationmark.circle.fill" size={20} color={colors.accent} />
              <Text style={[styles.infoItemText, { color: colors.text }]}>
                Staff meeting at 3:00 PM
              </Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="exclamationmark.circle.fill" size={20} color={colors.accent} />
              <Text style={[styles.infoItemText, { color: colors.text }]}>
                New menu items launching tomorrow
              </Text>
            </View>
          </View>

          {/* Weather */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="cloud.sun.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Local Weather
              </Text>
            </View>
            <View style={styles.weatherContainer}>
              <Text style={[styles.weatherTemp, { color: colors.text }]}>72°F</Text>
              <Text style={[styles.weatherCondition, { color: colors.textSecondary }]}>
                Partly Cloudy
              </Text>
              <Text style={[styles.weatherDetail, { color: colors.textSecondary }]}>
                High: 78°F • Low: 65°F
              </Text>
            </View>
          </View>

          {/* Schedule */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="clock.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Your Schedule
              </Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={[styles.scheduleDay, { color: colors.text }]}>Today</Text>
              <Text style={[styles.scheduleTime, { color: colors.accent }]}>
                11:00 AM - 7:00 PM
              </Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={[styles.scheduleDay, { color: colors.text }]}>Tomorrow</Text>
              <Text style={[styles.scheduleTime, { color: colors.accent }]}>
                2:00 PM - 10:00 PM
              </Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={[styles.scheduleDay, { color: colors.text }]}>Friday</Text>
              <Text style={[styles.scheduleTime, { color: colors.accent }]}>
                Off
              </Text>
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
  specialItem: {
    marginBottom: 16,
  },
  specialName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  specialPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  specialDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoItemText: {
    fontSize: 15,
    flex: 1,
  },
  weatherContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  weatherCondition: {
    fontSize: 18,
    marginBottom: 4,
  },
  weatherDetail: {
    fontSize: 14,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '500',
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '600',
  },
});
