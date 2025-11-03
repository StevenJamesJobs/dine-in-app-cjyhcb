
import React, { useState } from 'react';
import { Stack, router } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Platform,
  useColorScheme,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { restaurantColors } from '@/constants/Colors';

interface Employee {
  id: string;
  name: string;
  bucks: number;
  avatar: string;
}

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  date: string;
  from?: string;
}

export default function RewardsScreen() {
  const { userRole, logout, isManager, user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [awardAmount, setAwardAmount] = useState('');
  const [awardReason, setAwardReason] = useState('');

  if (!userRole) return null;

  const colors = restaurantColors[userRole][isDark ? 'dark' : 'light'];

  // Mock data for employees
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'Sarah Johnson', bucks: 850, avatar: '👩‍🍳' },
    { id: '2', name: 'Mike Chen', bucks: 720, avatar: '👨‍🍳' },
    { id: '3', name: 'Emily Davis', bucks: 680, avatar: '👩‍💼' },
    { id: '4', name: 'James Wilson', bucks: 590, avatar: '👨‍💼' },
    { id: '5', name: 'Lisa Anderson', bucks: 540, avatar: '👩‍🦰' },
    { id: '6', name: 'David Brown', bucks: 420, avatar: '👨‍🦱' },
    { id: '7', name: 'Maria Garcia', bucks: 380, avatar: '👩‍🦳' },
  ]);

  // Mock transaction history for current user
  const [transactions] = useState<Transaction[]>([
    { id: '1', amount: 50, reason: 'Excellent customer service', date: '2024-03-15', from: 'Manager John' },
    { id: '2', amount: 30, reason: 'Perfect attendance this week', date: '2024-03-10', from: 'Manager Sarah' },
    { id: '3', amount: 25, reason: 'Helped train new employee', date: '2024-03-05', from: 'Manager John' },
    { id: '4', amount: 40, reason: 'Great review from customer', date: '2024-03-01', from: 'Manager Sarah' },
  ]);

  const currentUserBucks = employees.find(e => e.id === user?.id)?.bucks || 420;

  const topPerformers = [...employees].sort((a, b) => b.bucks - a.bucks).slice(0, 5);

  const handleAwardBucks = () => {
    if (!selectedEmployee || !awardAmount || !awardReason) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseInt(awardAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Update employee bucks
    setEmployees(prev => prev.map(emp => 
      emp.id === selectedEmployee.id 
        ? { ...emp, bucks: emp.bucks + amount }
        : emp
    ));

    Alert.alert('Success', `Awarded ${amount} McLoone's Bucks to ${selectedEmployee.name}!`);
    setShowAwardModal(false);
    setSelectedEmployee(null);
    setAwardAmount('');
    setAwardReason('');
  };

  const renderHeaderRight = () => (
    <Pressable onPress={logout} style={styles.headerButtonContainer}>
      <IconSymbol name="rectangle.portrait.and.arrow.right" color={colors.accent} />
    </Pressable>
  );

  // Customer Rewards View
  if (userRole === 'customer') {
    const coupons = [
      {
        id: '1',
        title: '20% Off Your Next Visit',
        description: 'Valid on orders over $30',
        expiry: 'Expires: March 31, 2024',
        code: 'SAVE20',
      },
      {
        id: '2',
        title: 'Free Appetizer',
        description: 'With any entree purchase',
        expiry: 'Expires: April 15, 2024',
        code: 'FREEAPP',
      },
      {
        id: '3',
        title: 'Buy One Get One Free',
        description: 'On all desserts',
        expiry: 'Expires: March 25, 2024',
        code: 'BOGO',
      },
    ];

    return (
      <>
        {Platform.OS === 'ios' && (
          <Stack.Screen
            options={{
              title: 'Rewards',
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
            {/* Points Card */}
            <View style={[styles.pointsCard, { backgroundColor: colors.accent }]}>
              <View style={styles.pointsHeader}>
                <IconSymbol name="star.fill" size={32} color="#FFFFFF" />
                <Text style={styles.pointsTitle}>Your Rewards Points</Text>
              </View>
              <Text style={styles.pointsValue}>1,250</Text>
              <Text style={styles.pointsSubtext}>
                You&apos;re 250 points away from a free meal!
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '80%' }]} />
              </View>
            </View>

            {/* How it Works */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="info.circle.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  How It Works
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoNumber, { color: colors.accent }]}>1</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Earn 10 points for every dollar spent
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoNumber, { color: colors.accent }]}>2</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Redeem points for rewards and discounts
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoNumber, { color: colors.accent }]}>3</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Get exclusive member-only offers
                </Text>
              </View>
            </View>

            {/* Active Coupons */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="ticket.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Your Coupons
                </Text>
              </View>
              {coupons.map((coupon) => (
                <View
                  key={coupon.id}
                  style={[styles.couponCard, { backgroundColor: colors.background }]}
                >
                  <View style={styles.couponHeader}>
                    <Text style={[styles.couponTitle, { color: colors.text }]}>
                      {coupon.title}
                    </Text>
                    <View style={[styles.couponBadge, { backgroundColor: colors.accent }]}>
                      <Text style={styles.couponCode}>{coupon.code}</Text>
                    </View>
                  </View>
                  <Text style={[styles.couponDescription, { color: colors.textSecondary }]}>
                    {coupon.description}
                  </Text>
                  <Text style={[styles.couponExpiry, { color: colors.accentGray }]}>
                    {coupon.expiry}
                  </Text>
                  <Pressable
                    style={[styles.useButton, { backgroundColor: colors.accent }]}
                  >
                    <Text style={styles.useButtonText}>Use Coupon</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {/* Notifications */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="bell.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Notifications
                </Text>
              </View>
              <Text style={[styles.notificationText, { color: colors.textSecondary }]}>
                🎉 New promotion available! Check your coupons.
              </Text>
              <Text style={[styles.notificationText, { color: colors.textSecondary }]}>
                ⭐ You earned 50 bonus points for your last visit!
              </Text>
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  // Employee Rewards View
  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Rewards & Recognition',
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
          {/* McLoone's Bucks Balance */}
          <View style={[styles.bucksCard, { backgroundColor: colors.accent }]}>
            <View style={styles.bucksHeader}>
              <IconSymbol name="dollarsign.circle.fill" size={40} color="#FFFFFF" />
              <Text style={styles.bucksTitle}>McLoone&apos;s Bucks</Text>
            </View>
            <Text style={styles.bucksValue}>{currentUserBucks}</Text>
            <Text style={styles.bucksSubtext}>
              Earned through great service and behavior
            </Text>
          </View>

          {/* Top 5 Performers Leaderboard */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="trophy.fill" size={24} color="#FFD700" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Top Performers
              </Text>
            </View>
            {topPerformers.map((employee, index) => (
              <View
                key={employee.id}
                style={[
                  styles.leaderboardItem,
                  index === 0 && styles.leaderboardFirst,
                  { backgroundColor: colors.background },
                ]}
              >
                <View style={styles.leaderboardLeft}>
                  <View style={[
                    styles.rankBadge,
                    index === 0 && { backgroundColor: '#FFD700' },
                    index === 1 && { backgroundColor: '#C0C0C0' },
                    index === 2 && { backgroundColor: '#CD7F32' },
                    index > 2 && { backgroundColor: colors.accentGray },
                  ]}>
                    <Text style={[
                      styles.rankText,
                      index > 2 && { color: colors.text },
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={styles.employeeAvatar}>{employee.avatar}</Text>
                  <Text style={[styles.employeeName, { color: colors.text }]}>
                    {employee.name}
                  </Text>
                </View>
                <View style={styles.leaderboardRight}>
                  <Text style={[styles.employeeBucks, { color: colors.accent }]}>
                    {employee.bucks}
                  </Text>
                  <Text style={[styles.bucksLabel, { color: colors.textSecondary }]}>
                    bucks
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Management Features */}
          {isManager && (
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <IconSymbol name="star.circle.fill" size={24} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Management Tools
                </Text>
              </View>
              <Text style={[styles.managerNote, { color: colors.textSecondary }]}>
                As a manager, you can reward employees with McLoone&apos;s Bucks
              </Text>
              <Pressable
                style={[styles.managerButton, { backgroundColor: colors.accent }]}
                onPress={() => setShowAwardModal(true)}
              >
                <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
                <Text style={styles.managerButtonText}>Award McLoone&apos;s Bucks</Text>
              </Pressable>
            </View>
          )}

          {/* Recent Transactions */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="clock.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Activity
              </Text>
            </View>
            {transactions.map((transaction) => (
              <View
                key={transaction.id}
                style={[styles.transactionItem, { backgroundColor: colors.background }]}
              >
                <View style={styles.transactionLeft}>
                  <View style={[styles.transactionIcon, { backgroundColor: colors.accent }]}>
                    <IconSymbol name="plus" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={[styles.transactionReason, { color: colors.text }]}>
                      {transaction.reason}
                    </Text>
                    <Text style={[styles.transactionFrom, { color: colors.textSecondary }]}>
                      From {transaction.from}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.accentGray }]}>
                      {transaction.date}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.transactionAmount, { color: colors.accent }]}>
                  +{transaction.amount}
                </Text>
              </View>
            ))}
          </View>

          {/* How to Earn */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="lightbulb.fill" size={24} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                How to Earn McLoone&apos;s Bucks
              </Text>
            </View>
            <View style={styles.earnItem}>
              <Text style={styles.earnIcon}>⭐</Text>
              <Text style={[styles.earnText, { color: colors.textSecondary }]}>
                Receive great customer reviews
              </Text>
            </View>
            <View style={styles.earnItem}>
              <Text style={styles.earnIcon}>🎯</Text>
              <Text style={[styles.earnText, { color: colors.textSecondary }]}>
                Complete extra credit tasks
              </Text>
            </View>
            <View style={styles.earnItem}>
              <Text style={styles.earnIcon}>🏆</Text>
              <Text style={[styles.earnText, { color: colors.textSecondary }]}>
                Achieve performance incentives
              </Text>
            </View>
            <View style={styles.earnItem}>
              <Text style={styles.earnIcon}>🤝</Text>
              <Text style={[styles.earnText, { color: colors.textSecondary }]}>
                Help train new team members
              </Text>
            </View>
            <View style={styles.earnItem}>
              <Text style={styles.earnIcon}>💯</Text>
              <Text style={[styles.earnText, { color: colors.textSecondary }]}>
                Perfect attendance and punctuality
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Award Modal */}
      <Modal
        visible={showAwardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAwardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Award McLoone&apos;s Bucks
              </Text>
              <Pressable onPress={() => setShowAwardModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Select Employee
            </Text>
            <ScrollView style={styles.employeeList} showsVerticalScrollIndicator={false}>
              {employees.map((employee) => (
                <Pressable
                  key={employee.id}
                  style={[
                    styles.employeeOption,
                    { backgroundColor: colors.background },
                    selectedEmployee?.id === employee.id && { 
                      backgroundColor: colors.accent,
                      opacity: 0.9,
                    },
                  ]}
                  onPress={() => setSelectedEmployee(employee)}
                >
                  <Text style={styles.employeeOptionAvatar}>{employee.avatar}</Text>
                  <Text style={[
                    styles.employeeOptionName,
                    { color: colors.text },
                    selectedEmployee?.id === employee.id && { color: '#FFFFFF' },
                  ]}>
                    {employee.name}
                  </Text>
                  <Text style={[
                    styles.employeeOptionBucks,
                    { color: colors.textSecondary },
                    selectedEmployee?.id === employee.id && { color: '#FFFFFF' },
                  ]}>
                    {employee.bucks} bucks
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Amount
            </Text>
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.accentGray,
              }]}
              placeholder="Enter amount"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={awardAmount}
              onChangeText={setAwardAmount}
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
              Reason
            </Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.accentGray,
              }]}
              placeholder="Why are you awarding these bucks?"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={awardReason}
              onChangeText={setAwardReason}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel, { 
                  backgroundColor: colors.background,
                  borderColor: colors.accentGray,
                }]}
                onPress={() => setShowAwardModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonAward, { 
                  backgroundColor: colors.accent,
                }]}
                onPress={handleAwardBucks}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Award Bucks
                </Text>
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
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  headerButtonContainer: {
    padding: 6,
  },
  // Customer styles
  pointsCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pointsValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pointsSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoNumber: {
    fontSize: 20,
    fontWeight: '700',
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  couponCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  couponBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  couponCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  couponDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  couponExpiry: {
    fontSize: 12,
    marginBottom: 12,
  },
  useButton: {
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  // Employee styles
  bucksCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  bucksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  bucksTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bucksValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bucksSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  leaderboardFirst: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employeeAvatar: {
    fontSize: 28,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  employeeBucks: {
    fontSize: 20,
    fontWeight: '700',
  },
  bucksLabel: {
    fontSize: 12,
  },
  managerNote: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  managerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  managerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionReason: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionFrom: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  earnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  earnIcon: {
    fontSize: 24,
  },
  earnText: {
    fontSize: 14,
    flex: 1,
  },
  // Modal styles
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
    fontSize: 22,
    fontWeight: '700',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  employeeList: {
    maxHeight: 200,
    marginBottom: 8,
  },
  employeeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  employeeOptionAvatar: {
    fontSize: 24,
  },
  employeeOptionName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  employeeOptionBucks: {
    fontSize: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonAward: {
    // backgroundColor set dynamically
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
