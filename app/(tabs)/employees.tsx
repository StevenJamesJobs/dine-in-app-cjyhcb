
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
type Schedule = Database['public']['Tables']['employee_schedules']['Row'];

interface EmployeeWithSchedules extends Profile {
  schedules: Schedule[];
}

export default function EmployeesScreen() {
  const { isManager, user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors.employee[isDark ? 'dark' : 'light'];

  const [employees, setEmployees] = useState<EmployeeWithSchedules[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  
  // Schedule form state
  const [shiftDate, setShiftDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [position, setPosition] = useState('');
  const [notes, setNotes] = useState('');

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

      // Load schedules for all employees
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('employee_schedules')
        .select('*')
        .gte('shift_date', new Date().toISOString().split('T')[0])
        .order('shift_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (schedulesError) {
        console.error('Error loading schedules:', schedulesError);
      }

      const employeesWithSchedules: EmployeeWithSchedules[] = (profilesData || []).map(profile => ({
        ...profile,
        schedules: schedulesData?.filter(s => s.employee_id === profile.id) || [],
      }));

      setEmployees(employeesWithSchedules);
    } catch (error) {
      console.error('Error in loadEmployees:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedEmployee || !shiftDate || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('employee_schedules')
        .insert({
          employee_id: selectedEmployee.id,
          shift_date: shiftDate,
          start_time: startTime,
          end_time: endTime,
          position: position || null,
          notes: notes || null,
          created_by: user?.id,
        });

      if (error) {
        console.error('Error adding schedule:', error);
        Alert.alert('Error', 'Failed to add schedule');
        return;
      }

      Alert.alert('Success', 'Schedule added successfully!');
      setShowScheduleModal(false);
      resetScheduleForm();
      loadEmployees();
    } catch (error) {
      console.error('Error in handleAddSchedule:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('employee_schedules')
                .delete()
                .eq('id', scheduleId);

              if (error) {
                console.error('Error deleting schedule:', error);
                Alert.alert('Error', 'Failed to delete schedule');
                return;
              }

              Alert.alert('Success', 'Schedule deleted successfully!');
              loadEmployees();
            } catch (error) {
              console.error('Error in handleDeleteSchedule:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const resetScheduleForm = () => {
    setSelectedEmployee(null);
    setShiftDate('');
    setStartTime('');
    setEndTime('');
    setPosition('');
    setNotes('');
  };

  const openScheduleModal = (employee: Profile) => {
    setSelectedEmployee(employee);
    setShowScheduleModal(true);
  };

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
          title: 'Staff Management',
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : employees.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
            <IconSymbol name="person.2.fill" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              No Employees Found
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Employees will appear here once they sign up
            </Text>
          </View>
        ) : (
          employees.map((employee) => (
            <View
              key={employee.id}
              style={[styles.employeeCard, { backgroundColor: colors.cardBackground }]}
            >
              <View style={styles.employeeHeader}>
                <View style={[styles.employeeAvatar, { backgroundColor: colors.accent }]}>
                  <Text style={styles.employeeAvatarText}>
                    {(employee.full_name || employee.email).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.employeeInfo}>
                  <Text style={[styles.employeeName, { color: colors.text }]}>
                    {employee.full_name || 'No name'}
                  </Text>
                  <Text style={[styles.employeeEmail, { color: colors.textSecondary }]}>
                    {employee.email}
                  </Text>
                </View>
                <Pressable
                  style={[styles.addScheduleButton, { backgroundColor: colors.accent }]}
                  onPress={() => openScheduleModal(employee)}
                >
                  <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Upcoming Schedules */}
              {employee.schedules.length > 0 && (
                <View style={styles.schedulesSection}>
                  <Text style={[styles.schedulesTitle, { color: colors.text }]}>
                    Upcoming Shifts
                  </Text>
                  {employee.schedules.slice(0, 3).map((schedule) => (
                    <View key={schedule.id} style={styles.scheduleItem}>
                      <View style={styles.scheduleInfo}>
                        <Text style={[styles.scheduleDate, { color: colors.text }]}>
                          {new Date(schedule.shift_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                        <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>
                          {schedule.start_time} - {schedule.end_time}
                        </Text>
                        {schedule.position && (
                          <Text style={[styles.schedulePosition, { color: colors.textSecondary }]}>
                            {schedule.position}
                          </Text>
                        )}
                      </View>
                      <Pressable
                        onPress={() => handleDeleteSchedule(schedule.id)}
                        style={styles.deleteButton}
                      >
                        <IconSymbol name="trash" size={16} color="#FF3B30" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Schedule Modal */}
      <Modal
        visible={showScheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add Shift
              </Text>
              <Pressable onPress={() => setShowScheduleModal(false)}>
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
                    {selectedEmployee.email}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Date (YYYY-MM-DD) *
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
                  placeholder="2024-03-15"
                  placeholderTextColor={colors.textSecondary}
                  value={shiftDate}
                  onChangeText={setShiftDate}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Start Time (HH:MM) *
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
                  placeholder="09:00"
                  placeholderTextColor={colors.textSecondary}
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  End Time (HH:MM) *
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
                  placeholder="17:00"
                  placeholderTextColor={colors.textSecondary}
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Position
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
                  placeholder="Server, Host, Bartender, etc."
                  placeholderTextColor={colors.textSecondary}
                  value={position}
                  onChangeText={setPosition}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Notes
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
                  placeholder="Any additional notes..."
                  placeholderTextColor={colors.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <Pressable
                style={[styles.submitButton, { backgroundColor: colors.accent }]}
                onPress={handleAddSchedule}
              >
                <Text style={styles.submitButtonText}>Add Shift</Text>
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
    padding: 16,
    paddingBottom: 100,
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
    fontSize: 18,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  employeeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  employeeInfo: {
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
  addScheduleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schedulesSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 16,
  },
  schedulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 13,
    marginBottom: 2,
  },
  schedulePosition: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
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
