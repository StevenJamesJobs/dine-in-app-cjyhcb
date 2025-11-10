
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
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantColors } from '@/constants/Colors';
import { supabase } from '@/app/integrations/supabase/client';
import type { Database } from '@/app/integrations/supabase/types';

type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 2; // 2 columns with padding

export default function GalleryScreen() {
  const { userRole } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors[userRole || 'customer'][isDark ? 'dark' : 'light'];

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading gallery:', error);
        return;
      }

      setImages(data || []);
    } catch (error) {
      console.error('Error in loadGallery:', error);
    } finally {
      setLoading(false);
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

  // Placeholder images if no gallery images exist
  const placeholderImages = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=400&fit=crop',
  ];

  const displayImages = images.length > 0 
    ? images.map(img => img.image_url)
    : placeholderImages;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Gallery',
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
                Our Gallery
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Take a look at our restaurant, dishes, and events
              </Text>
            </View>

            {/* Gallery Grid */}
            <View style={styles.gallery}>
              {displayImages.map((imageUrl, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={[styles.image, { width: imageSize, height: imageSize }]}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>

            {images.length === 0 && (
              <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
                <IconSymbol name="info.circle.fill" size={20} color={colors.accent} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Gallery images will be uploaded soon. Check back later for more photos!
                </Text>
              </View>
            )}
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
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 12,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
