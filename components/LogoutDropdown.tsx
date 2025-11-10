
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantColors } from '@/constants/Colors';

export default function LogoutDropdown() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { logout, user, profile, userRole } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors[userRole || 'customer'][isDark ? 'dark' : 'light'];

  const handleLogout = () => {
    setDropdownVisible(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('User confirmed logout from dropdown');
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setDropdownVisible(!dropdownVisible)}
        style={[styles.button, { backgroundColor: colors.accent }]}
      >
        <IconSymbol name="person.circle.fill" size={24} color="#FFFFFF" />
        <IconSymbol 
          name={dropdownVisible ? "chevron.up" : "chevron.down"} 
          size={16} 
          color="#FFFFFF" 
        />
      </Pressable>

      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={[styles.dropdown, { backgroundColor: colors.cardBackground }]}>
            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
                <Text style={styles.avatarText}>
                  {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                  {profile?.full_name || 'User'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {user?.email || 'user@mcloones.com'}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.accent }]}>
                    {userRole?.charAt(0).toUpperCase()}{userRole?.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.accentGray }]} />

            {/* Logout Button */}
            <Pressable
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#FF3B30" />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingLeft: 16,
  },
  dropdown: {
    width: 280,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
