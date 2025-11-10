
import React, { useState, useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantColors } from '@/constants/Colors';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import type { Database } from '@/app/integrations/supabase/types';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Platform,
  useColorScheme,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';

type Profile = Database['public']['Tables']['profiles']['Row'];
type McLoonesBuck = Database['public']['Tables']['mcloones_bucks']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];

interface EmployeeWithBalance extends Profile {
  balance: number;
}

export default function ManagerScreen() {
  const { isManager, user, profile } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors.employee[isDark ? 'dark' : 'light'];

  const [activeTab, setActiveTab] = useState<'menu' | 'specials' | 'events' | 'promotions' | 'bucks'>('bucks');
  const [employees, setEmployees] = useState<EmployeeWithBalance[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithBalance | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [awardAmount, setAwardAmount] = useState('');
  const [awardReason, setAwardReason] = useState('');
  
  // Menu item form state
  const [menuName, setMenuName] = useState('');
  const [menuDescription, setMenuDescription] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuCategory, setMenuCategory] = useState('Starters');
  const [menuMealType, setMenuMealType] = useState<'lunch' | 'dinner' | 'both'>('both');
  const [menuDietaryInfo, setMenuDietaryInfo] = useState('');

  const categories = [
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

  useEffect(() => {
    if (!isManager) {
      router.replace('/(tabs)/(home)/');
      return;
    }
    loadEmployees();
    loadMenuItems();
  }, [isManager]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee')
        .order('full_name');

      if (profilesError) {
        console.error('Error loading employees:', profilesError);
        Alert.alert('Error', 'Failed to load employees');
        return;
      }

      const { data: balancesData, error: balancesError } = await supabase
        .from('employee_bucks_balance')
        .select('*');

      if (balancesError) {
        console.error('Error loading balances:', balancesError);
      }

      const employeesWithBalances: EmployeeWithBalance[] = (profilesData || []).map(profile => {
        const balance = balancesData?.find(b => b.employee_id === profile.id);
        return {
          ...profile,
          balance: balance?.total_balance || 0,
        };
      });

      setEmployees(employeesWithBalances);
    } catch (error) {
      console.error('Error in loadEmployees:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category')
        .order('sort_order');

      if (error) {
        console.error('Error loading menu items:', error);
        return;
      }

      setMenuItems(data || []);
    } catch (error) {
      console.error('Error in loadMenuItems:', error);
    }
  };

  const handleAwardBucks = async () => {
    if (!selectedEmployee || !awardAmount || !awardReason || !user) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(awardAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('mcloones_bucks')
        .insert({
          employee_id: selectedEmployee.id,
          amount,
          reason: awardReason,
          awarded_by: user.id,
        });

      if (error) {
        console.error('Error awarding bucks:', error);
        Alert.alert('Error', 'Failed to award McLoone\'s Bucks');
        return;
      }

      Alert.alert(
        'Success',
        `Awarded $${amount} McLoone's Bucks to ${selectedEmployee.full_name || selectedEmployee.email}!`
      );

      setShowAwardModal(false);
      setSelectedEmployee(null);
      setAwardAmount('');
      setAwardReason('');
      loadEmployees();
    } catch (error) {
      console.error('Error in handleAwardBucks:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleSaveMenuItem = async () => {
    if (!menuName || !menuPrice || !menuCategory) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const price = parseFloat(menuPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      if (selectedMenuItem) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: menuName,
            description: menuDescription,
            price,
            category: menuCategory,
            meal_type: menuMealType,
            dietary_info: menuDietaryInfo,
          })
          .eq('id', selectedMenuItem.id);

        if (error) {
          console.error('Error updating menu item:', error);
          Alert.alert('Error', 'Failed to update menu item');
          return;
        }

        Alert.alert('Success', 'Menu item updated successfully!');
      } else {
        // Create new item
        const { error } = await supabase
          .from('menu_items')
          .insert({
            name: menuName,
            description: menuDescription,
            price,
            category: menuCategory,
            meal_type: menuMealType,
            dietary_info: menuDietaryInfo,
            created_by: user?.id,
          });

        if (error) {
          console.error('Error creating menu item:', error);
          Alert.alert('Error', 'Failed to create menu item');
          return;
        }

        Alert.alert('Success', 'Menu item created successfully!');
      }

      setShowMenuModal(false);
      resetMenuForm();
      loadMenuItems();
    } catch (error) {
      console.error('Error in handleSaveMenuItem:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', item.id);

              if (error) {
                console.error('Error deleting menu item:', error);
                Alert.alert('Error', 'Failed to delete menu item');
                return;
              }

              Alert.alert('Success', 'Menu item deleted successfully!');
              loadMenuItems();
            } catch (error) {
              console.error('Error in handleDeleteMenuItem:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const resetMenuForm = () => {
    setSelectedMenuItem(null);
    setMenuName('');
    setMenuDescription('');
    setMenuPrice('');
    setMenuCategory('Starters');
    setMenuMealType('both');
    setMenuDietaryInfo('');
  };

  const openMenuModal = (item?: MenuItem) => {
    if (item) {
      setSelectedMenuItem(item);
      setMenuName(item.name || '');
      setMenuDescription(item.description || '');
      setMenuPrice(item.price?.toString() || '');
      setMenuCategory(item.category || 'Starters');
      setMenuMealType((item.meal_type as 'lunch' | 'dinner' | 'both') || 'both');
      setMenuDietaryInfo(item.dietary_info || '');
    } else {
      resetMenuForm();
    }
    setShowMenuModal(true);
  };

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => router.push('/profile')}
      style={{ marginRight: 16 }}
    >
      <IconSymbol name="person.circle.fill" size={28} color={colors.accent} />
    </Pressable>
  );

  const renderTabButton = (
    tab: typeof activeTab,
    label: string,
    icon: string
  ) => (
    <Pressable
      style={[
        styles.tabButton,
        { backgroundColor: colors.cardBackground },
        activeTab === tab && { backgroundColor: colors.accent },
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <IconSymbol
        name={icon as any}
        size={20}
        color={activeTab === tab ? '#FFFFFF' : colors.text}
      />
      <Text
        style={[
          styles.tabButtonText,
          { color: colors.text },
          activeTab === tab && { color: '#FFFFFF' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const renderBucksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Employee McLoone&apos;s Bucks
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Award and manage employee rewards
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : employees.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
          <IconSymbol name="person.2.fill" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            No employees found
          </Text>
        </View>
      ) : (
        <View style={styles.employeeList}>
          {employees.map((employee) => (
            <View
              key={employee.id}
              style={[styles.employeeCard, { backgroundColor: colors.cardBackground }]}
            >
              <View style={styles.employeeInfo}>
                <View style={[styles.employeeAvatar, { backgroundColor: colors.accent }]}>
                  <Text style={styles.employeeAvatarText}>
                    {(employee.full_name || employee.email).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.employeeDetails}>
                  <Text style={[styles.employeeName, { color: colors.text }]}>
                    {employee.full_name || 'No name'}
                  </Text>
                  <Text style={[styles.employeeEmail, { color: colors.textSecondary }]}>
                    {employee.email}
                  </Text>
                </View>
              </View>
              <View style={styles.employeeActions}>
                <View style={styles.balanceContainer}>
                  <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
                    Balance
                  </Text>
                  <Text style={[styles.balanceAmount, { color: colors.accent }]}>
                    ${employee.balance.toFixed(2)}
                  </Text>
                </View>
                <Pressable
                  style={[styles.awardButton, { backgroundColor: colors.accent }]}
                  onPress={() => {
                    setSelectedEmployee(employee);
                    setShowAwardModal(true);
                  }}
                >
                  <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
                  <Text style={styles.awardButtonText}>Award</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderMenuTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Menu Management
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Create and manage menu items
        </Text>
      </View>

      <Pressable
        style={[styles.addButton, { backgroundColor: colors.accent }]}
        onPress={() => openMenuModal()}
      >
        <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Menu Item</Text>
      </Pressable>

      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <View
            key={item.id}
            style={[styles.menuItemCard, { backgroundColor: colors.cardBackground }]}
          >
            <View style={styles.menuItemHeader}>
              <View style={styles.menuItemInfo}>
                <Text style={[styles.menuItemName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.menuItemCategory, { color: colors.textSecondary }]}>
                  {item.category} • {item.meal_type}
                </Text>
                {item.description && (
                  <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                )}
              </View>
              <Text style={[styles.menuItemPrice, { color: colors.accent }]}>
                ${item.price}
              </Text>
            </View>
            <View style={styles.menuItemActions}>
              <Pressable
                style={[styles.editButton, { backgroundColor: colors.accent + '20' }]}
                onPress={() => openMenuModal(item)}
              >
                <IconSymbol name="pencil" size={16} color={colors.accent} />
                <Text style={[styles.editButtonText, { color: colors.accent }]}>
                  Edit
                </Text>
              </Pressable>
              <Pressable
                style={[styles.deleteButton, { backgroundColor: '#FF3B3020' }]}
                onPress={() => handleDeleteMenuItem(item)}
              >
                <IconSymbol name="trash" size={16} color="#FF3B30" />
                <Text style={[styles.deleteButtonText, { color: '#FF3B30' }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPlaceholderTab = (title: string, description: string) => (
    <View style={styles.tabContent}>
      <View style={[styles.placeholderContainer, { backgroundColor: colors.cardBackground }]}>
        <IconSymbol name="wrench.and.screwdriver.fill" size={64} color={colors.textSecondary} />
        <Text style={[styles.placeholderTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.placeholderDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Manager Portal',
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {renderTabButton('bucks', 'Bucks', 'dollarsign.circle.fill')}
          {renderTabButton('menu', 'Menu', 'fork.knife')}
          {renderTabButton('specials', 'Specials', 'star.fill')}
          {renderTabButton('events', 'Events', 'calendar')}
          {renderTabButton('promotions', 'Promos', 'tag.fill')}
        </ScrollView>

        {activeTab === 'bucks' && renderBucksTab()}
        {activeTab === 'menu' && renderMenuTab()}
        {activeTab === 'specials' && renderPlaceholderTab(
          'Weekly Specials',
          'Create and manage weekly specials. This feature is coming soon!'
        )}
        {activeTab === 'events' && renderPlaceholderTab(
          'Events Management',
          'Create and manage events. This feature is coming soon!'
        )}
        {activeTab === 'promotions' && renderPlaceholderTab(
          'Promotions',
          'Create and manage promotions. This feature is coming soon!'
        )}
      </ScrollView>

      {/* Award Modal */}
      <Modal
        visible={showAwardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAwardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Award McLoone&apos;s Bucks
              </Text>
              <Pressable onPress={() => setShowAwardModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </Pressable>
            </View>

            {selectedEmployee && (
              <View style={[styles.selectedEmployeeCard, { backgroundColor: colors.cardBackground }]}>
                <View style={[styles.employeeAvatar, { backgroundColor: colors.accent }]}>
                  <Text style={styles.employeeAvatarText}>
                    {(selectedEmployee.full_name || selectedEmployee.email).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.employeeName, { color: colors.text }]}>
                    {selectedEmployee.full_name || 'No name'}
                  </Text>
                  <Text style={[styles.employeeEmail, { color: colors.textSecondary }]}>
                    Current Balance: ${selectedEmployee.balance.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Amount ($)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.cardBackground,
                      color: colors.text,
                      borderColor: colors.accentGray,
                    },
                  ]}
                  placeholder="10.00"
                  placeholderTextColor={colors.textSecondary}
                  value={awardAmount}
                  onChangeText={setAwardAmount}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Reason
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: colors.cardBackground,
                      color: colors.text,
                      borderColor: colors.accentGray,
                    },
                  ]}
                  placeholder="Great customer service, excellent teamwork, etc."
                  placeholderTextColor={colors.textSecondary}
                  value={awardReason}
                  onChangeText={setAwardReason}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <Pressable
                style={[styles.submitButton, { backgroundColor: colors.accent }]}
                onPress={handleAwardBucks}
              >
                <Text style={styles.submitButtonText}>Award Bucks</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Item Modal */}
      <Modal
        visible={showMenuModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </Text>
                <Pressable onPress={() => setShowMenuModal(false)}>
                  <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.modalForm}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Name *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                        borderColor: colors.accentGray,
                      },
                    ]}
                    placeholder="Menu item name"
                    placeholderTextColor={colors.textSecondary}
                    value={menuName}
                    onChangeText={setMenuName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Description
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                        borderColor: colors.accentGray,
                      },
                    ]}
                    placeholder="Item description"
                    placeholderTextColor={colors.textSecondary}
                    value={menuDescription}
                    onChangeText={setMenuDescription}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Price ($) *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                        borderColor: colors.accentGray,
                      },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    value={menuPrice}
                    onChangeText={setMenuPrice}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Category *
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    {categories.map((cat) => (
                      <Pressable
                        key={cat}
                        style={[
                          styles.categoryButton,
                          { backgroundColor: colors.cardBackground },
                          menuCategory === cat && { backgroundColor: colors.accent },
                        ]}
                        onPress={() => setMenuCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            { color: colors.text },
                            menuCategory === cat && { color: '#FFFFFF' },
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Meal Type *
                  </Text>
                  <View style={styles.mealTypeButtons}>
                    {(['lunch', 'dinner', 'both'] as const).map((type) => (
                      <Pressable
                        key={type}
                        style={[
                          styles.mealTypeButton,
                          { backgroundColor: colors.cardBackground },
                          menuMealType === type && { backgroundColor: colors.accent },
                        ]}
                        onPress={() => setMenuMealType(type)}
                      >
                        <Text
                          style={[
                            styles.mealTypeButtonText,
                            { color: colors.text },
                            menuMealType === type && { color: '#FFFFFF' },
                          ]}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Dietary Info
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                        borderColor: colors.accentGray,
                      },
                    ]}
                    placeholder="e.g., gf|va (use | to separate)"
                    placeholderTextColor={colors.textSecondary}
                    value={menuDietaryInfo}
                    onChangeText={setMenuDietaryInfo}
                  />
                </View>

                <Pressable
                  style={[styles.submitButton, { backgroundColor: colors.accent }]}
                  onPress={handleSaveMenuItem}
                >
                  <Text style={styles.submitButtonText}>
                    {selectedMenuItem ? 'Update Item' : 'Create Item'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    padding: 16,
    gap: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
  },
  employeeList: {
    gap: 12,
  },
  employeeCard: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  employeeDetails: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  employeeEmail: {
    fontSize: 14,
  },
  employeeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceContainer: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  awardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  awardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuList: {
    gap: 12,
  },
  menuItemCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  menuItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderContainer: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    justifyContent: 'flex-end',
    minHeight: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  selectedEmployeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  modalForm: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mealTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mealTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
