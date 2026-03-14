import React from 'react';
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ImagePreviewModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export function ImagePreviewModal({
  visible,
  imageUri,
  onClose,
}: ImagePreviewModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity activeOpacity={1}>
          <Image
            source={{uri: imageUri}}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.closeBtn}>
          <TouchableOpacity onPress={onClose} hitSlop={{top: 16, bottom: 16, left: 16, right: 16}}>
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.6,
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
  },
});
