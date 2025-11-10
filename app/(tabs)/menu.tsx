
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Platform,
  useColorScheme,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';
import { restaurantColors } from '@/constants/Colors';
import { Stack } from 'expo-router';
import type { Database } from '@/app/integrations/supabase/types';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface MenuSection {
  category: string;
  items: MenuItem[];
}

export default function MenuScreen() {
  const { userRole } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors[userRole || 'customer'][isDark ? 'dark' : 'light'];

  const [mealType, setMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, [mealType]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      console.log('Loading menu for meal type:', mealType);
      
      // Fetch items that match the selected meal type OR are available for both
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .in('meal_type', [mealType, 'both'])
        .eq('is_available', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading menu:', error);
        return;
      }

      console.log('Loaded menu items:', data?.length);

      // Group items by category
      const sections: MenuSection[] = [];
      const categoryMap = new Map<string, MenuItem[]>();

      data?.forEach((item) => {
        const category = item.category || 'Other';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)?.push(item);
      });

      // Define category order
      const categoryOrder = [
        'Starters',
        'Raw Bar',
        'Soup',
        'Salads',
        'Tacos',
        'Burgers',
        'Sandwiches',
        'Entrees',
        'Pasta',
        'Sides',
      ];

      categoryOrder.forEach((category) => {
        if (categoryMap.has(category)) {
          sections.push({
            category,
            items: categoryMap.get(category) || [],
          });
        }
      });

      console.log('Menu sections:', sections.length);
      setMenuSections(sections);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', gap: 12, marginRight: 16 }}>
      <Pressable onPress={() => {}}>
        <IconSymbol name="magnifyingglass" size={24} color={colors.accent} />
      </Pressable>
    </View>
  );

  const renderDietaryInfo = (info: string | null) => {
    if (!info) return null;

    const badges = info.split('|').map((badge) => {
      let label = '';
      let icon = '';
      
      switch (badge.toLowerCase()) {
        case 'gf':
          label = 'GF';
          icon = 'leaf.fill';
          break;
        case 'gfa':
          label = 'GF Available';
          icon = 'leaf';
          break;
        case 'v':
          label = 'Vegan';
          icon = 'leaf.fill';
          break;
        case 'va':
          label = 'Vegan Available';
          icon = 'leaf';
          break;
        default:
          label = badge.toUpperCase();
      }

      return { label, icon };
    });

    return (
      <View style={styles.dietaryBadges}>
        {badges.map((badge, index) => (
          <View
            key={index}
            style={[styles.dietaryBadge, { backgroundColor: colors.accent + '20' }]}
          >
            {badge.icon && (
              <IconSymbol name={badge.icon} size={12} color={colors.accent} />
            )}
            <Text style={[styles.dietaryBadgeText, { color: colors.accent }]}>
              {badge.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderMenuItem = (item: MenuItem) => (
    <View key={item.id} style={[styles.menuItem, { borderBottomColor: colors.textSecondary + '20' }]}>
      <View style={styles.menuItemHeader}>
        <Text style={[styles.menuItemName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.menuItemPrice, { color: colors.accent }]}>
          ${item.price}
        </Text>
      </View>
      {item.description && (
        <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      )}
      {renderDietaryInfo(item.dietary_info)}
    </View>
  );

  const renderSection = (section: MenuSection) => (
    <View key={section.category} style={styles.section}>
      <View style={[styles.sectionHeader, { backgroundColor: colors.accent + '10' }]}>
        <Text style={[styles.sectionTitle, { color: colors.accent }]}>
          {section.category}
        </Text>
      </View>
      {section.items.map(renderMenuItem)}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Menu',
          headerRight: renderHeaderRight,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Meal Type Selector */}
        <View style={[styles.mealTypeSelector, { backgroundColor: colors.cardBackground }]}>
          <Pressable
            style={[
              styles.mealTypeButton,
              mealType === 'lunch' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setMealType('lunch')}
          >
            <IconSymbol
              name="sun.max.fill"
              size={20}
              color={mealType === 'lunch' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.mealTypeText,
                {
                  color: mealType === 'lunch' ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
            >
              Lunch
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.mealTypeButton,
              mealType === 'dinner' && { backgroundColor: colors.accent },
            ]}
            onPress={() => setMealType('dinner')}
          >
            <IconSymbol
              name="moon.fill"
              size={20}
              color={mealType === 'dinner' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.mealTypeText,
                {
                  color: mealType === 'dinner' ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
            >
              Dinner
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : menuSections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="fork.knife" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No menu items available for {mealType}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {menuSections.map(renderSection)}
            
            {/* Footer Note */}
            <View style={[styles.footerNote, { backgroundColor: colors.cardBackground }]}>
              <IconSymbol name="info.circle.fill" size={20} color={colors.accent} />
              <View style={styles.footerNoteContent}>
                <Text style={[styles.footerNoteText, { color: colors.textSecondary }]}>
                  v = vegan • va = vegan available
                </Text>
                <Text style={[styles.footerNoteText, { color: colors.textSecondary }]}>
                  gf = gluten free • gfa = gluten free available
                </Text>
                <Text style={[styles.footerNoteText, { color: colors.textSecondary }]}>
                  Consuming raw or undercooked meats, poultry, seafood, shellfish or eggs may increase your risk of foodborne illness
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
  mealTypeSelector: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  mealTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  menuItemName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  menuItemDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  dietaryBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  dietaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  dietaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerNote: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  footerNoteContent: {
    flex: 1,
    gap: 4,
  },
  footerNoteText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
