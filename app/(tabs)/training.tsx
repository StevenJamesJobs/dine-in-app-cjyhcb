
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

export default function TrainingScreen() {
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
          title: 'Training',
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
          {/* Training Materials */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="book.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Training Materials
              </Text>
            </View>
            <Pressable style={styles.trainingItem}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol name="doc.text.fill" size={24} color={colors.accent} />
              </View>
              <View style={styles.trainingContent}>
                <Text style={[styles.trainingTitle, { color: colors.text }]}>
                  Employee Handbook
                </Text>
                <Text style={[styles.trainingDescription, { color: colors.textSecondary }]}>
                  Complete guide to policies and procedures
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.trainingItem}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol name="fork.knife" size={24} color={colors.accent} />
              </View>
              <View style={styles.trainingContent}>
                <Text style={[styles.trainingTitle, { color: colors.text }]}>
                  Menu Knowledge
                </Text>
                <Text style={[styles.trainingDescription, { color: colors.textSecondary }]}>
                  Learn about our dishes and ingredients
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.trainingItem}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol name="person.2.fill" size={24} color={colors.accent} />
              </View>
              <View style={styles.trainingContent}>
                <Text style={[styles.trainingTitle, { color: colors.text }]}>
                  Customer Service
                </Text>
                <Text style={[styles.trainingDescription, { color: colors.textSecondary }]}>
                  Best practices for guest interactions
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Cheat Sheets */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="list.bullet.clipboard.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Quick Reference
              </Text>
            </View>
            <Pressable style={styles.trainingItem}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol name="clock.fill" size={24} color={colors.accent} />
              </View>
              <View style={styles.trainingContent}>
                <Text style={[styles.trainingTitle, { color: colors.text }]}>
                  Opening Procedures
                </Text>
                <Text style={[styles.trainingDescription, { color: colors.textSecondary }]}>
                  Step-by-step opening checklist
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.trainingItem}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol name="moon.fill" size={24} color={colors.accent} />
              </View>
              <View style={styles.trainingContent}>
                <Text style={[styles.trainingTitle, { color: colors.text }]}>
                  Closing Procedures
                </Text>
                <Text style={[styles.trainingDescription, { color: colors.textSecondary }]}>
                  End-of-day closing checklist
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={styles.trainingItem}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color={colors.accent} />
              </View>
              <View style={styles.trainingContent}>
                <Text style={[styles.trainingTitle, { color: colors.text }]}>
                  Safety Protocols
                </Text>
                <Text style={[styles.trainingDescription, { color: colors.textSecondary }]}>
                  Emergency procedures and safety guidelines
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Contact Information */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="phone.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Contact Information
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                Restaurant Phone
              </Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>
                (555) 123-4567
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                Manager on Duty
              </Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>
                (555) 123-4568
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                HR Department
              </Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>
                hr@mcloones.com
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
  trainingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainingContent: {
    flex: 1,
  },
  trainingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  trainingDescription: {
    fontSize: 13,
  },
  contactItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  contactValue: {
    fontSize: 15,
  },
});
