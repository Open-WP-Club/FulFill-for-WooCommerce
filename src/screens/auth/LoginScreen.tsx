import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Button} from '../../components/common/Button';
import {useAuthStore} from '../../stores/authStore';
import {createApiClient} from '../../api/client';

export function LoginScreen() {
  const [siteUrl, setSiteUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore(s => s.login);

  const handleLogin = async () => {
    if (!siteUrl.trim() || !consumerKey.trim() || !consumerSecret.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    setLoading(true);
    try {
      // Temporarily set credentials to test
      login(siteUrl.trim(), consumerKey.trim(), consumerSecret.trim());
      const client = createApiClient();

      // Test connection
      await client.get('/orders', {params: {per_page: 1}});
      // Login successful — credentials already saved
    } catch {
      useAuthStore.getState().logout();
      Alert.alert(
        'Connection Failed',
        'Could not connect to WooCommerce. Please check your URL and API keys.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>FulFill</Text>
        <Text style={styles.subtitle}>Connect to your WooCommerce store</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Store URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://yourstore.com"
            value={siteUrl}
            onChangeText={setSiteUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Text style={styles.label}>Consumer Key</Text>
          <TextInput
            style={styles.input}
            placeholder="ck_..."
            value={consumerKey}
            onChangeText={setConsumerKey}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Consumer Secret</Text>
          <TextInput
            style={styles.input}
            placeholder="cs_..."
            value={consumerSecret}
            onChangeText={setConsumerSecret}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          <Button
            title="Connect"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    marginTop: 24,
  },
});
