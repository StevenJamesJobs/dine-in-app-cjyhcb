
import React from 'react';
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
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantColors } from '@/constants/Colors';

export default function AboutScreen() {
  const { userRole } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors[userRole || 'customer'][isDark ? 'dark' : 'light'];

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
          title: 'About Us',
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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={[styles.heroOverlay, { backgroundColor: colors.accent + 'CC' }]}>
            <Text style={styles.heroTitle}>McLoone&apos;s Restaurant</Text>
            <Text style={styles.heroSubtitle}>Est. 2003</Text>
          </View>
        </View>

        {/* Our Story */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="book.fill" size={24} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Our Story
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Founded in 2003, McLoone&apos;s started as a small family kitchen with a 
            big dream. Today, we&apos;re proud to serve our community with the same 
            dedication to quality and authenticity that we started with.
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Our passion is bringing people together through great food and warm 
            hospitality. Every dish is prepared with care, using fresh, locally-sourced 
            ingredients whenever possible.
          </Text>
        </View>

        {/* Our Values */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="heart.fill" size={24} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Our Values
            </Text>
          </View>
          <View style={styles.valueItem}>
            <View style={[styles.valueIcon, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol name="leaf.fill" size={20} color={colors.accent} />
            </View>
            <View style={styles.valueContent}>
              <Text style={[styles.valueTitle, { color: colors.text }]}>
                Fresh & Local
              </Text>
              <Text style={[styles.valueDescription, { color: colors.textSecondary }]}>
                We source ingredients from local farms and suppliers
              </Text>
            </View>
          </View>
          <View style={styles.valueItem}>
            <View style={[styles.valueIcon, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol name="person.2.fill" size={20} color={colors.accent} />
            </View>
            <View style={styles.valueContent}>
              <Text style={[styles.valueTitle, { color: colors.text }]}>
                Community First
              </Text>
              <Text style={[styles.valueDescription, { color: colors.textSecondary }]}>
                Supporting our local community is at the heart of what we do
              </Text>
            </View>
          </View>
          <View style={styles.valueItem}>
            <View style={[styles.valueIcon, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol name="star.fill" size={20} color={colors.accent} />
            </View>
            <View style={styles.valueContent}>
              <Text style={[styles.valueTitle, { color: colors.text }]}>
                Excellence
              </Text>
              <Text style={[styles.valueDescription, { color: colors.textSecondary }]}>
                We strive for excellence in every dish and every interaction
              </Text>
            </View>
          </View>
        </View>

        {/* Location & Hours */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="location.fill" size={24} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Visit Us
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Address
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              123 Main Street{'\n'}
              Anytown, ST 12345
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Hours
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              Monday - Thursday: 11:00 AM - 10:00 PM{'\n'}
              Friday - Saturday: 11:00 AM - 11:00 PM{'\n'}
              Sunday: 10:00 AM - 9:00 PM
            </Text>
          </View>
        </View>

        {/* Contact */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="phone.fill" size={24} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Get In Touch
            </Text>
          </View>
          <Pressable style={styles.contactRow}>
            <IconSymbol name="phone.fill" size={20} color={colors.accent} />
            <Text style={[styles.contactText, { color: colors.text }]}>
              (555) 123-4567
            </Text>
          </Pressable>
          <Pressable style={styles.contactRow}>
            <IconSymbol name="envelope.fill" size={20} color={colors.accent} />
            <Text style={[styles.contactText, { color: colors.text }]}>
              info@mcloones.com
            </Text>
          </Pressable>
          <Pressable style={styles.contactRow}>
            <IconSymbol name="globe" size={20} color={colors.accent} />
            <Text style={[styles.contactText, { color: colors.text }]}>
              www.mcloones.com
            </Text>
          </Pressable>
        </View>

        {/* Social Media */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="person.3.fill" size={24} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Follow Us
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Stay connected with us on social media for the latest updates, 
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
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
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 15,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
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
