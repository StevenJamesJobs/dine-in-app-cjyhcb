
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Platform,
  useColorScheme,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Stack, router } from 'expo-router';
import { restaurantColors } from '@/constants/Colors';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import type { Database } from '@/app/integrations/supabase/types';

type McLoonesBuck = Database['public']['Tables']['mcloones_bucks']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface Transaction extends McLoonesBuck {
  awarded_by_profile?: Profile;
}

interface TopEmployee {
  employee_id: string;
  total_balance: number;
  profile?: Profile;
}

export default function RewardsScreen() {
  const { userRole, isManager, user, profile } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors[userRole || 'customer'][isDark ? 'dark' : 'light'];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [latestRewards, setLatestRewards] = useState<Transaction[]>([]);
  const [topEmployees, setTopEmployees] = useState<TopEmployee[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === 'employee' && user) {
      loadEmployeeData();
    } else {
      setLoading(false);
    }
  }, [userRole, user]);

  const loadEmployeeData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user's transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('mcloones_bucks')
        .select('*')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
      } else {
        // Fetch profiles for awarded_by users
        const awardedByIds = [...new Set(transactionsData?.map(t => t.awarded_by) || [])];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', awardedByIds);

        const transactionsWithProfiles: Transaction[] = (transactionsData || []).map(transaction => ({
          ...transaction,
          awarded_by_profile: profilesData?.find(p => p.id === transaction.awarded_by),
        }));

        setTransactions(transactionsWithProfiles);

        // Calculate balance
        const totalBalance = transactionsData?.reduce((sum, t) => sum + t.amount, 0) || 0;
        setBalance(totalBalance);
      }

      // Fetch latest rewards across all employees
      const { data: latestData, error: latestError } = await supabase
        .from('mcloones_bucks')
        .select('*, employee:profiles!mcloones_bucks_employee_id_fkey(*), awarded_by_profile:profiles!mcloones_bucks_awarded_by_fkey(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!latestError && latestData) {
        setLatestRewards(latestData as any);
      }

      // Fetch top 5 employees by balance
      const { data: balancesData, error: balancesError } = await supabase
        .from('employee_bucks_balance')
        .select('*')
        .order('total_balance', { ascending: false })
        .limit(5);

      if (!balancesError && balancesData) {
        const employeeIds = balancesData.map(b => b.employee_id);
        const { data: employeeProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', employeeIds);

        const topEmps: TopEmployee[] = balancesData.map(balance => ({
          employee_id: balance.employee_id,
          total_balance: balance.total_balance,
          profile: employeeProfiles?.find(p => p.id === balance.employee_id),
        }));

        setTopEmployees(topEmps);
      }
    } catch (error) {
      console.error('Error in loadEmployeeData:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeaderRight = () => (
    <View style={{ flexDirection: 'row', gap: 12, marginRight: 16 }}>
      {isManager && (
        <Pressable onPress={() => router.push('/(tabs)/manager')}>
          <IconSymbol name="wrench.and.screwdriver.fill" size={24} color={colors.accent} />
        </Pressable>
      )}
      <Pressable onPress={() => router.push('/(tabs)/profile')}>
        <IconSymbol name="person.circle.fill" size={28} color={colors.accent} />
      </Pressable>
    </View>
  );

  if (userRole === 'customer') {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Rewards',
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
          <View style={[styles.placeholderContainer, { backgroundColor: colors.cardBackground }]}>
            <IconSymbol name="gift.fill" size={64} color={colors.accent} />
            <Text style={[styles.placeholderTitle, { color: colors.text }]}>
              Customer Rewards
            </Text>
            <Text style={[styles.placeholderDescription, { color: colors.textSecondary }]}>
              Earn points with every purchase and redeem them for exclusive rewards!
              This feature is coming soon.
            </Text>
          </View>
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'McLoone\'s Bucks',
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
        ) : (
          <>
            {/* Balance Card */}
            <View style={[styles.balanceCard, { backgroundColor: colors.accent }]}>
              <View style={styles.balanceHeader}>
                <IconSymbol name="dollarsign.circle.fill" size={32} color="#FFFFFF" />
                <Text style={styles.balanceLabel}>Your Balance</Text>
              </View>
              <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
              <Text style={styles.balanceSubtext}>McLoone&apos;s Bucks</Text>
            </View>

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
              <IconSymbol name="info.circle.fill" size={20} color={colors.accent} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  How to Earn More
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  - Provide excellent customer service{'\n'}
                  - Perfect attendance{'\n'}
                  - Go above and beyond{'\n'}
                  - Receive great reviews{'\n'}
                  - Help train new team members
                </Text>
              </View>
            </View>

            {/* Top 5 Employees */}
            {topEmployees.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="trophy.fill" size={24} color={colors.accent} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Top Employees
                  </Text>
                </View>
                {topEmployees.map((emp, index) => (
                  <View
                    key={emp.employee_id}
                    style={[styles.topEmployeeCard, { backgroundColor: colors.cardBackground }]}
                  >
                    <View style={styles.rankBadge}>
                      <Text style={[styles.rankText, { color: colors.accent }]}>
                        #{index + 1}
                      </Text>
                    </View>
                    <View style={[styles.employeeAvatar, { backgroundColor: colors.accent }]}>
                      <Text style={styles.employeeAvatarText}>
                        {(emp.profile?.full_name || emp.profile?.email || 'E').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.employeeInfo}>
                      <Text style={[styles.employeeName, { color: colors.text }]}>
                        {emp.profile?.full_name || emp.profile?.email || 'Employee'}
                      </Text>
                      <Text style={[styles.employeeBalance, { color: colors.textSecondary }]}>
                        ${emp.total_balance.toFixed(2)}
                      </Text>
                    </View>
                    {emp.employee_id === user?.id && (
                      <View style={[styles.youBadge, { backgroundColor: colors.accent + '20' }]}>
                        <Text style={[styles.youBadgeText, { color: colors.accent }]}>
                          You
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Latest McLoone's Bucks */}
            {latestRewards.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconSymbol name="sparkles" size={24} color={colors.accent} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Latest Rewards
                  </Text>
                </View>
                {latestRewards.map((reward: any) => (
                  <View
                    key={reward.id}
                    style={[styles.rewardCard, { backgroundColor: colors.cardBackground }]}
                  >
                    <View style={[styles.rewardIcon, { backgroundColor: colors.accent + '20' }]}>
                      <IconSymbol name="star.fill" size={20} color={colors.accent} />
                    </View>
                    <View style={styles.rewardContent}>
                      <Text style={[styles.rewardEmployee, { color: colors.text }]}>
                        {reward.employee?.full_name || reward.employee?.email || 'Employee'}
                      </Text>
                      <Text style={[styles.rewardReason, { color: colors.textSecondary }]}>
                        {reward.reason}
                      </Text>
                      <Text style={[styles.rewardDate, { color: colors.textSecondary }]}>
                        {new Date(reward.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[styles.rewardAmount, { color: colors.accent }]}>
                      +${reward.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Your Transactions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Your Transactions
              </Text>

              {transactions.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
                  <IconSymbol name="tray.fill" size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No transactions yet
                  </Text>
                  <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                    Keep up the great work to earn your first McLoone&apos;s Bucks!
                  </Text>
                </View>
              ) : (
                <View style={styles.transactionsList}>
                  {transactions.map((transaction) => (
                    <View
                      key={transaction.id}
                      style={[styles.transactionCard, { backgroundColor: colors.cardBackground }]}
                    >
                      <View style={styles.transactionHeader}>
                        <View style={[styles.transactionIcon, { backgroundColor: colors.accent + '20' }]}>
                          <IconSymbol name="plus.circle.fill" size={24} color={colors.accent} />
                        </View>
                        <View style={styles.transactionDetails}>
                          <Text style={[styles.transactionReason, { color: colors.text }]}>
                            {transaction.reason}
                          </Text>
                          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                            {new Date(transaction.created_at || '').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Text>
                          {transaction.awarded_by_profile && (
                            <Text style={[styles.transactionFrom, { color: colors.textSecondary }]}>
                              From: {transaction.awarded_by_profile.full_name || transaction.awarded_by_profile.email}
                            </Text>
                          )}
                        </View>
                        <Text style={[styles.transactionAmount, { color: colors.accent }]}>
                          +${transaction.amount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  balanceCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 4,
  },
  balanceSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
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
  topEmployeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
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
  employeeBalance: {
    fontSize: 14,
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardContent: {
    flex: 1,
  },
  rewardEmployee: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  rewardReason: {
    fontSize: 13,
    marginBottom: 2,
  },
  rewardDate: {
    fontSize: 11,
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    padding: 16,
    borderRadius: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionReason: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionFrom: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: '700',
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
});
