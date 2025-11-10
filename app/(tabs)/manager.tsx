
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
  const [loading, setLoading] = useState(true);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithBalance | null>(null);
  const [awardAmount, setAwardAmount] = useState('');
  const [awardReason, setAwardReason] = useState('');

  useEffect(() => {
    if (!isManager) {
      router.replace('/(tabs)/(home)/');
      return;
    }
    loadEmployees();
  }, [isManager]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch all employees
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

      // Fetch balances for all employees
      const { data: balancesData, error: balancesError } = await supabase
        .from('employee_bucks_balance')
        .select('*');

      if (balancesError) {
        console.error('Error loading balances:', balancesError);
      }

      // Combine data
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
        {/* Tab Navigation */}
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

        {/* Tab Content */}
        {activeTab === 'bucks' && renderBucksTab()}
        {activeTab === 'menu' && renderPlaceholderTab(
          'Menu Management',
          'Create and manage menu items. This feature is coming soon!'
        )}
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
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
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
    minHeight: 100,
    textAlignVertical: 'top',
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
