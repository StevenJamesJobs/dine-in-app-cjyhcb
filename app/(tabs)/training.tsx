
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

  const materials = [
    {
      id: '1',
      title: 'Employee Handbook',
      description: 'Complete guide to policies and procedures',
      icon: 'book.fill',
      category: 'Handbook',
    },
    {
      id: '2',
      title: 'Food Safety Training',
      description: 'Essential food handling and safety protocols',
      icon: 'checkmark.shield.fill',
      category: 'Training',
    },
    {
      id: '3',
      title: 'POS System Guide',
      description: 'Step-by-step guide for the point of sale system',
      icon: 'creditcard.fill',
      category: 'Guide',
    },
    {
      id: '4',
      title: 'Menu Knowledge',
      description: 'Detailed information about all menu items',
      icon: 'list.bullet.rectangle',
      category: 'Cheat Sheet',
    },
    {
      id: '5',
      title: 'Customer Service Tips',
      description: 'Best practices for excellent customer service',
      icon: 'person.2.fill',
      category: 'Guide',
    },
    {
      id: '6',
      title: 'Opening Procedures',
      description: 'Daily opening checklist and procedures',
      icon: 'sunrise.fill',
      category: 'Cheat Sheet',
    },
    {
      id: '7',
      title: 'Closing Procedures',
      description: 'Daily closing checklist and procedures',
      icon: 'sunset.fill',
      category: 'Cheat Sheet',
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
            title: 'Training Materials',
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
            <IconSymbol name="book.fill" size={32} color={colors.accent} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Training Resources
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Access handbooks, guides, and training materials
            </Text>
          </View>

          {materials.map((material) => (
            <Pressable
              key={material.id}
              style={[styles.materialCard, { backgroundColor: colors.cardBackground }]}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
                <IconSymbol name={material.icon as any} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.materialContent}>
                <View style={styles.materialHeader}>
                  <Text style={[styles.materialTitle, { color: colors.text }]}>
                    {material.title}
                  </Text>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.background }]}>
                    <Text style={[styles.categoryText, { color: colors.accent }]}>
                      {material.category}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.materialDescription, { color: colors.textSecondary }]}>
                  {material.description}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
            </Pressable>
          ))}

          {/* Contact Information */}
          <View style={[styles.contactSection, { backgroundColor: colors.cardBackground }]}>
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
                John Smith
              </Text>
              <Text style={[styles.contactValue, { color: colors.accent }]}>
                (555) 987-6543
              </Text>
            </View>

            <View style={styles.contactItem}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                General Manager
              </Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>
                Sarah Johnson
              </Text>
              <Text style={[styles.contactValue, { color: colors.accent }]}>
                (555) 456-7890
              </Text>
            </View>

            <View style={styles.contactItem}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                HR Department
              </Text>
              <Text style={[styles.contactValue, { color: colors.accent }]}>
                hr@restaurant.com
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
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
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
  materialContent: {
    flex: 1,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  materialDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  contactSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
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
  contactItem: {
    marginBottom: 16,
    paddingBottom: 16,
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
    fontSize: 16,
    marginBottom: 2,
  },
});
