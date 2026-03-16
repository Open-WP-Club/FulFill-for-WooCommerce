import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Switch, ScrollView, Alert, TouchableOpacity} from 'react-native';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import {useAuthStore} from '../../stores/authStore';
import {useSettingsStore} from '../../stores/settingsStore';
import {useSyncStore} from '../../stores/syncStore';
import {useSync} from '../../hooks/useSync';
import {useTheme} from '../../theme/ThemeContext';
import {scheduleDailySummary, cancelDailySummary} from '../../utils/localNotifications';
import type {ThemeMode} from '../../theme/colors';

const THEME_OPTIONS: Array<{label: string; value: ThemeMode}> = [
  {label: 'System', value: 'system'},
  {label: 'Light', value: 'light'},
  {label: 'Dark', value: 'dark'},
];

export function SettingsScreen() {
  const theme = useTheme();
  const siteUrl = useAuthStore(s => s.siteUrl);
  const logout = useAuthStore(s => s.logout);
  const {
    soundEnabled,
    hapticEnabled,
    autoSyncEnabled,
    notificationsEnabled,
    dailySummaryEnabled,
    lowStockThreshold,
    themeMode,
    setSoundEnabled,
    setHapticEnabled,
    setAutoSyncEnabled,
    setNotificationsEnabled,
    setDailySummaryEnabled,
    setLowStockThreshold,
    setThemeMode,
  } = useSettingsStore();

  // Schedule/cancel daily summary when setting changes
  useEffect(() => {
    if (dailySummaryEnabled) {
      scheduleDailySummary(8);
    } else {
      cancelDailySummary();
    }
  }, [dailySummaryEnabled]);
  const clearQueue = useSyncStore(s => s.clearQueue);
  const {pendingCount, isSyncing, lastSyncAt, isConnected} = useSync();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to disconnect?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Connection */}
      <Card>
        <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
          Connection
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>Store URL</Text>
          <Text style={[styles.value, {color: theme.textTertiary}]} numberOfLines={1}>
            {siteUrl}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>Status</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                {backgroundColor: isConnected ? theme.success : theme.error},
              ]}
            />
            <Text style={[styles.value, {color: theme.textTertiary}]}>
              {isConnected ? 'Connected' : 'Offline'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Appearance */}
      <Card>
        <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
          Appearance
        </Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map(option => {
            const isActive = themeMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.themeBtn,
                  {backgroundColor: isActive ? theme.primary : theme.surfaceSecondary},
                ]}
                onPress={() => setThemeMode(option.value)}>
                <Text
                  style={[
                    styles.themeBtnText,
                    {color: isActive ? theme.textOnPrimary : theme.textTertiary},
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Preferences */}
      <Card>
        <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
          Preferences
        </Text>
        <View style={styles.switchRow}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>
            Sound effects
          </Text>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>
            Haptic feedback
          </Text>
          <Switch value={hapticEnabled} onValueChange={setHapticEnabled} />
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>Auto sync</Text>
          <Switch value={autoSyncEnabled} onValueChange={setAutoSyncEnabled} />
        </View>
      </Card>

      {/* Notifications */}
      <Card>
        <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
          Notifications
        </Text>
        <View style={styles.switchRow}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>
            New order alerts
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>
            Daily summary (8:00 AM)
          </Text>
          <Switch
            value={dailySummaryEnabled}
            onValueChange={setDailySummaryEnabled}
          />
        </View>
      </Card>

      {/* Inventory */}
      <Card>
        <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
          Inventory
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>
            Low stock threshold
          </Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() =>
                setLowStockThreshold(Math.max(1, lowStockThreshold - 1))
              }
              style={[styles.stepperBtn, {backgroundColor: theme.surfaceSecondary}]}>
              <Text style={[styles.stepperBtnText, {color: theme.textSecondary}]}>
                -
              </Text>
            </TouchableOpacity>
            <Text style={[styles.stepperValue, {color: theme.textPrimary}]}>
              {lowStockThreshold}
            </Text>
            <TouchableOpacity
              onPress={() => setLowStockThreshold(lowStockThreshold + 1)}
              style={[styles.stepperBtn, {backgroundColor: theme.surfaceSecondary}]}>
              <Text style={[styles.stepperBtnText, {color: theme.textSecondary}]}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Sync */}
      <Card>
        <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>Sync</Text>
        <View style={styles.row}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>
            Pending changes
          </Text>
          <Text style={[styles.value, {color: theme.textTertiary}]}>
            {pendingCount}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>Syncing</Text>
          <Text style={[styles.value, {color: theme.textTertiary}]}>
            {isSyncing ? 'Yes' : 'No'}
          </Text>
        </View>
        {lastSyncAt && (
          <View style={styles.row}>
            <Text style={[styles.label, {color: theme.textSecondary}]}>
              Last sync
            </Text>
            <Text style={[styles.value, {color: theme.textTertiary}]}>
              {lastSyncAt}
            </Text>
          </View>
        )}
        {pendingCount > 0 && (
          <Button
            title="Clear Queue"
            variant="danger"
            onPress={() =>
              Alert.alert(
                'Clear Queue',
                'Discard all pending offline changes?',
                [
                  {text: 'Cancel', style: 'cancel'},
                  {text: 'Clear', style: 'destructive', onPress: clearQueue},
                ],
              )
            }
            style={styles.clearBtn}
          />
        )}
      </Card>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <Button
          title="Disconnect Store"
          variant="danger"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 15,
    maxWidth: 200,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  themeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearBtn: {
    marginTop: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  logoutContainer: {
    padding: 16,
    marginBottom: 32,
  },
});
