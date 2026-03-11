import React from 'react';
import {View, Text, StyleSheet, Switch, ScrollView, Alert} from 'react-native';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import {useAuthStore} from '../../stores/authStore';
import {useSettingsStore} from '../../stores/settingsStore';
import {useSyncStore} from '../../stores/syncStore';
import {useSync} from '../../hooks/useSync';

export function SettingsScreen() {
  const siteUrl = useAuthStore(s => s.siteUrl);
  const logout = useAuthStore(s => s.logout);
  const {
    soundEnabled,
    hapticEnabled,
    autoSyncEnabled,
    setSoundEnabled,
    setHapticEnabled,
    setAutoSyncEnabled,
  } = useSettingsStore();
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
    <ScrollView style={styles.container}>
      {/* Connection */}
      <Card>
        <Text style={styles.sectionTitle}>Connection</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Store URL</Text>
          <Text style={styles.value} numberOfLines={1}>
            {siteUrl}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                {backgroundColor: isConnected ? '#10B981' : '#EF4444'},
              ]}
            />
            <Text style={styles.value}>
              {isConnected ? 'Connected' : 'Offline'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Preferences */}
      <Card>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Sound effects</Text>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Haptic feedback</Text>
          <Switch value={hapticEnabled} onValueChange={setHapticEnabled} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Auto sync</Text>
          <Switch value={autoSyncEnabled} onValueChange={setAutoSyncEnabled} />
        </View>
      </Card>

      {/* Sync */}
      <Card>
        <Text style={styles.sectionTitle}>Sync</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Pending changes</Text>
          <Text style={styles.value}>{pendingCount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Syncing</Text>
          <Text style={styles.value}>{isSyncing ? 'Yes' : 'No'}</Text>
        </View>
        {lastSyncAt && (
          <View style={styles.row}>
            <Text style={styles.label}>Last sync</Text>
            <Text style={styles.value}>{lastSyncAt}</Text>
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
    backgroundColor: '#F9FAFB',
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
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
    color: '#374151',
  },
  value: {
    fontSize: 15,
    color: '#6B7280',
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
  clearBtn: {
    marginTop: 12,
  },
  logoutContainer: {
    padding: 16,
    marginBottom: 32,
  },
});
