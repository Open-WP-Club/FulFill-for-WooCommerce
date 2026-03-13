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
  Image,
} from 'react-native';
import {Button} from '../../components/common/Button';
import {useAuthStore} from '../../stores/authStore';
import {createApiClient} from '../../api/client';
import {useTheme} from '../../theme/ThemeContext';

const logo = require('../../assets/logo.png');

export function LoginScreen() {
  const theme = useTheme();
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

    const urlPattern = /^https?:\/\/.+\..+/;
    if (!urlPattern.test(siteUrl.trim())) {
      Alert.alert('Error', 'Please enter a valid URL (e.g. https://yourstore.com)');
      return;
    }

    setLoading(true);
    try {
      login(siteUrl.trim(), consumerKey.trim(), consumerSecret.trim());
      const client = createApiClient();
      await client.get('/orders', {params: {per_page: 1}});
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
      style={[styles.container, {backgroundColor: theme.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Image source={logo} style={styles.logo} />
        <Text style={[styles.title, {color: theme.primary}]}>FulFill</Text>
        <Text style={[styles.subtitle, {color: theme.textTertiary}]}>
          Connect to your WooCommerce store
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, {color: theme.textSecondary}]}>Store URL</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              },
            ]}
            placeholder="https://yourstore.com"
            placeholderTextColor={theme.textMuted}
            value={siteUrl}
            onChangeText={setSiteUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Text style={[styles.label, {color: theme.textSecondary}]}>Consumer Key</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              },
            ]}
            placeholder="ck_..."
            placeholderTextColor={theme.textMuted}
            value={consumerKey}
            onChangeText={setConsumerKey}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, {color: theme.textSecondary}]}>
            Consumer Secret
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              },
            ]}
            placeholder="cs_..."
            placeholderTextColor={theme.textMuted}
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
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 24,
  },
});
