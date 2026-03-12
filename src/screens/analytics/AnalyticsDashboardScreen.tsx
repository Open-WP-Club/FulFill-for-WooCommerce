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
import {useTheme} from '../../theme/ThemeContext';
import type {ThemeColors} from '../../theme/colors';
import type {PickSessionRecord} from '../../types/analytics';

function StatCard({
  label,
  value,
  color,
  theme,
}: {
  label: string;
  value: string;
  color: string;
  theme: ThemeColors;
}) {
  return (
    <View
      style={[
        statStyles.card,
        {backgroundColor: theme.surface, borderLeftColor: color},
      ]}>
      <Text style={[statStyles.value, {color: theme.textPrimary}]}>{value}</Text>
      <Text style={[statStyles.label, {color: theme.textTertiary}]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});

export function AnalyticsDashboardScreen() {
  const theme = useTheme();
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
    <View
      style={[
        styles.sessionRow,
        {backgroundColor: theme.surface, borderBottomColor: theme.borderLight},
      ]}>
      <View style={styles.sessionInfo}>
        <Text style={[styles.sessionOrder, {color: theme.textPrimary}]}>
          Order #{item.orderNumber}
        </Text>
        <Text style={[styles.sessionDate, {color: theme.textMuted}]}>
          {new Date(item.completedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.sessionStats}>
        <Text style={[styles.sessionPicked, {color: theme.success}]}>
          {item.pickedCorrectly}/{item.totalItems}
        </Text>
        <Text style={[styles.sessionDuration, {color: theme.textTertiary}]}>
          {formatDuration(item.durationMs)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={item => item.sessionId}
        ListHeaderComponent={
          <>
            <Card>
              <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
                Picker
              </Text>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.inputText,
                  },
                ]}
                placeholder="Enter your name"
                placeholderTextColor={theme.textMuted}
                value={pickerName}
                onChangeText={setPickerName}
              />
            </Card>

            <View style={styles.statsGrid}>
              <StatCard
                label="Sessions today"
                value={stats.sessionsToday.toString()}
                color={theme.primary}
                theme={theme}
              />
              <StatCard
                label="Total picked"
                value={stats.totalItemsPicked.toString()}
                color={theme.success}
                theme={theme}
              />
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                label="Avg time/item"
                value={formatDuration(stats.avgTimePerItemMs)}
                color={theme.warning}
                theme={theme}
              />
              <StatCard
                label="Accuracy"
                value={`${Math.round(stats.accuracyRate * 100)}%`}
                color={stats.accuracyRate >= 0.95 ? theme.success : theme.error}
                theme={theme}
              />
            </View>

            <View style={styles.historyHeader}>
              <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
                Recent Sessions
              </Text>
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
          <Text style={[styles.empty, {color: theme.textMuted}]}>
            No pick sessions recorded yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
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
    borderBottomWidth: 1,
  },
  sessionInfo: {},
  sessionOrder: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  sessionPicked: {
    fontSize: 14,
    fontWeight: '600',
  },
  sessionDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    fontSize: 14,
  },
});
