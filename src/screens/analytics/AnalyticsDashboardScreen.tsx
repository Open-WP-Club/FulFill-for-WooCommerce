import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import {useAnalyticsStore} from '../../stores/analyticsStore';
import type {PickSessionRecord} from '../../types/analytics';

function StatCard({label, value, color}: {label: string; value: string; color: string}) {
  return (
    <View style={[statStyles.card, {borderLeftColor: color}]}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export function AnalyticsDashboardScreen() {
  const {sessions, pickerName, setPickerName, clearSessions, getStats} =
    useAnalyticsStore();
  const stats = getStats();

  const formatDuration = (ms: number) => {
    if (ms === 0) {
      return '-';
    }
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const renderSession = ({item}: {item: PickSessionRecord}) => (
    <View style={styles.sessionRow}>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionOrder}>Order #{item.orderNumber}</Text>
        <Text style={styles.sessionDate}>
          {new Date(item.completedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.sessionStats}>
        <Text style={styles.sessionPicked}>
          {item.pickedCorrectly}/{item.totalItems}
        </Text>
        <Text style={styles.sessionDuration}>
          {formatDuration(item.durationMs)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={item => item.sessionId}
        ListHeaderComponent={
          <>
            {/* Picker Name */}
            <Card>
              <Text style={styles.sectionTitle}>Picker</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter your name"
                value={pickerName}
                onChangeText={setPickerName}
              />
            </Card>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Sessions today"
                value={stats.sessionsToday.toString()}
                color="#4F46E5"
              />
              <StatCard
                label="Total picked"
                value={stats.totalItemsPicked.toString()}
                color="#10B981"
              />
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                label="Avg time/item"
                value={formatDuration(stats.avgTimePerItemMs)}
                color="#F59E0B"
              />
              <StatCard
                label="Accuracy"
                value={`${Math.round(stats.accuracyRate * 100)}%`}
                color={stats.accuracyRate >= 0.95 ? '#10B981' : '#EF4444'}
              />
            </View>

            {/* History header */}
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
              {sessions.length > 0 && (
                <Button
                  title="Clear"
                  variant="danger"
                  onPress={() =>
                    Alert.alert(
                      'Clear History',
                      'Delete all pick session records?',
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Clear',
                          style: 'destructive',
                          onPress: clearSessions,
                        },
                      ],
                    )
                  }
                />
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No pick sessions recorded yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sessionInfo: {},
  sessionOrder: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sessionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  sessionPicked: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  sessionDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },
});
