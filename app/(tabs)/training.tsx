
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

type TrainingMaterial = Database['public']['Tables']['training_materials']['Row'];

export default function TrainingScreen() {
  const { userRole } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors[userRole || 'customer'][isDark ? 'dark' : 'light'];

  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('training_materials')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('title');

      if (error) {
        console.error('Error loading training materials:', error);
        return;
      }

      setMaterials(data || []);
    } catch (error) {
      console.error('Error in loadMaterials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMaterial = async (fileUrl: string) => {
    try {
      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        console.error('Cannot open URL:', fileUrl);
      }
    } catch (error) {
      console.error('Error opening material:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'handbook':
        return 'book.fill';
      case 'guide':
        return 'doc.text.fill';
      case 'cheat_sheet':
        return 'list.bullet.clipboard.fill';
      case 'material':
        return 'folder.fill';
      default:
        return 'doc.fill';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'handbook':
        return 'Handbooks';
      case 'guide':
        return 'Guides';
      case 'cheat_sheet':
        return 'Cheat Sheets';
      case 'material':
        return 'Materials';
      default:
        return 'Other';
    }
  };

  const groupedMaterials = materials.reduce((acc, material) => {
    const category = material.category || 'material';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(material);
    return acc;
  }, {} as Record<string, TrainingMaterial[]>);

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
                Training Materials
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Access all your training resources in one place
              </Text>
            </View>

            {/* Materials by Category */}
            {Object.keys(groupedMaterials).length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
                <IconSymbol name="book.fill" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.text }]}>
                  No Training Materials Yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                  Training materials will be uploaded by management soon.
                </Text>
              </View>
            ) : (
              Object.entries(groupedMaterials).map(([category, categoryMaterials]) => (
                <View key={category} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <IconSymbol
                      name={getCategoryIcon(category) as any}
                      size={24}
                      color={colors.accent}
                    />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {getCategoryTitle(category)}
                    </Text>
                  </View>
                  {categoryMaterials.map((material) => (
                    <Pressable
                      key={material.id}
                      style={[styles.materialCard, { backgroundColor: colors.cardBackground }]}
                      onPress={() => handleOpenMaterial(material.file_url)}
                    >
                      <View style={[styles.materialIcon, { backgroundColor: colors.accent + '20' }]}>
                        <IconSymbol
                          name={material.file_type === 'pdf' ? 'doc.text.fill' : 'photo.fill'}
                          size={24}
                          color={colors.accent}
                        />
                      </View>
                      <View style={styles.materialContent}>
                        <Text style={[styles.materialTitle, { color: colors.text }]}>
                          {material.title}
                        </Text>
                        {material.description && (
                          <Text style={[styles.materialDescription, { color: colors.textSecondary }]}>
                            {material.description}
                          </Text>
                        )}
                        <Text style={[styles.materialType, { color: colors.textSecondary }]}>
                          {material.file_type.toUpperCase()}
                        </Text>
                      </View>
                      <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                    </Pressable>
                  ))}
                </View>
              ))
            )}

            {/* Contact Information */}
            <View style={[styles.contactCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="phone.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Need Help?
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                  Restaurant Phone
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  (555) 123-4567
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                  Manager on Duty
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  (555) 123-4568
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
                  HR Department
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  hr@mcloones.com
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
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  materialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialContent: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  materialType: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contactCard: {
    padding: 16,
    borderRadius: 12,
  },
  contactRow: {
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
