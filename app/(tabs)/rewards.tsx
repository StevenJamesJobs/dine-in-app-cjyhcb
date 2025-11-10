
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

export default function RewardsScreen() {
  const { userRole, isManager, user, profile } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = restaurantColors[userRole || 'customer'][isDark ? 'dark' : 'light'];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === 'employee' && user) {
      loadTransactions();
    } else {
      setLoading(false);
    }
  }, [userRole, user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('mcloones_bucks')
        .select('*')
        .eq('employee_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
        Alert.alert('Error', 'Failed to load transactions');
        return;
      }

      // Fetch profiles for awarded_by users
      const awardedByIds = [...new Set(transactionsData?.map(t => t.awarded_by) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', awardedByIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      // Combine data
      const transactionsWithProfiles: Transaction[] = (transactionsData || []).map(transaction => ({
        ...transaction,
        awarded_by_profile: profilesData?.find(p => p.id === transaction.awarded_by),
      }));

      setTransactions(transactionsWithProfiles);

      // Calculate balance
      const totalBalance = transactionsData?.reduce((sum, t) => sum + t.amount, 0) || 0;
      setBalance(totalBalance);
    } catch (error) {
      console.error('Error in loadTransactions:', error);
      Alert.alert('Error', 'An unexpected error occurred');
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
      <Pressable onPress={() => router.push('/profile')}>
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
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Earn McLoone&apos;s Bucks for great service, teamwork, and going above and beyond!
            Redeem them for rewards and perks.
          </Text>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Transactions
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : transactions.length === 0 ? (
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
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
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
