import {Platform, ToastAndroid, Alert} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

export function copyToClipboard(text: string, label?: string) {
  Clipboard.setString(text);
  const msg = label ? `${label} copied` : 'Copied to clipboard';
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert(msg);
  }
}
