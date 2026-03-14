import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Card} from '../../components/common/Card';
import {Button} from '../../components/common/Button';
import {StatusBadge} from '../../components/orders/StatusBadge';
import {OrderLineItem} from '../../components/orders/OrderLineItem';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import {OfflineBanner} from '../../components/common/OfflineBanner';
import {useOrderDetail} from '../../hooks/useOrderDetail';
import {useTheme} from '../../theme/ThemeContext';
import {copyToClipboard} from '../../utils/clipboard';
import {
  formatCurrency,
  formatDate,
  formatAddress,
  formatCustomerName,
} from '../../utils/formatters';
import type {OrdersStackParamList} from '../../types/navigation';
import type {WcOrderStatus} from '../../types/order';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderDetail'>;

const STATUS_ACTIONS: Array<{label: string; status: WcOrderStatus}> = [
  {label: 'Processing', status: 'processing'},
  {label: 'On Hold', status: 'on-hold'},
  {label: 'Completed', status: 'completed'},
  {label: 'Cancelled', status: 'cancelled'},
];

export function OrderDetailScreen({route, navigation}: Props) {
  const theme = useTheme();
  const {orderId} = route.params;
  const {order, notes, isLoading, changeStatus, addNote} =
    useOrderDetail(orderId);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleStatusChange = useCallback(
    (status: WcOrderStatus) => {
      Alert.alert(
        'Change Status',
        `Set order status to "${status}"?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Confirm',
            onPress: () => changeStatus(status),
          },
        ],
      );
    },
    [changeStatus],
  );

  const handleAddNote = useCallback(() => {
    if (noteText.trim()) {
      addNote(noteText.trim());
      setNoteText('');
      setNoteModalVisible(false);
    }
  }, [noteText, addNote]);

  const handleStartPicking = useCallback(() => {
    if (order) {
      navigation.navigate('PickAndPack', {order});
    }
  }, [order, navigation]);

  if (isLoading && !order) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return null;
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.headerRow}>
            <Text
              style={[styles.orderNumber, {color: theme.textPrimary}]}
              onLongPress={() => copyToClipboard(order.number, `Order #${order.number}`)}>
              Order #{order.number}
            </Text>
            <StatusBadge status={order.status} />
          </View>
          <Text style={[styles.date, {color: theme.textMuted}]}>
            {formatDate(order.date_created)}
          </Text>
          <Text style={[styles.total, {color: theme.primary}]}>
            {formatCurrency(order.total, order.currency)}
          </Text>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
            Customer
          </Text>
          <Text style={[styles.customerName, {color: theme.textSecondary}]}>
            {formatCustomerName(order.billing)}
          </Text>
          {order.billing.email && (
            <Text style={[styles.detail, {color: theme.textTertiary}]}>
              {order.billing.email}
            </Text>
          )}
          {order.billing.phone && (
            <Text style={[styles.detail, {color: theme.textTertiary}]}>
              {order.billing.phone}
            </Text>
          )}
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
            Shipping Address
          </Text>
          <Text style={[styles.detail, {color: theme.textTertiary}]}>
            {formatCustomerName(order.shipping)}
          </Text>
          <Text style={[styles.detail, {color: theme.textTertiary}]}>
            {formatAddress(order.shipping)}
          </Text>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>Items</Text>
          {order.line_items.map(item => (
            <OrderLineItem
              key={item.id}
              item={item}
              currency={order.currency}
            />
          ))}
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
            Actions
          </Text>
          <Button
            title="Start Pick & Pack"
            onPress={handleStartPicking}
            style={styles.actionButton}
          />
          <View style={styles.statusActions}>
            {STATUS_ACTIONS.map(action => {
              const isActive = order.status === action.status;
              return (
                <TouchableOpacity
                  key={action.status}
                  style={[
                    styles.statusBtn,
                    {backgroundColor: isActive ? theme.primary : theme.surfaceSecondary},
                  ]}
                  onPress={() => handleStatusChange(action.status)}>
                  <Text
                    style={[
                      styles.statusBtnText,
                      {color: isActive ? theme.textOnPrimary : theme.textTertiary},
                    ]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Card>
          <View style={styles.notesHeader}>
            <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
              Notes
            </Text>
            <TouchableOpacity onPress={() => setNoteModalVisible(true)}>
              <Text style={[styles.addNote, {color: theme.primary}]}>+ Add Note</Text>
            </TouchableOpacity>
          </View>
          {notes.length === 0 ? (
            <Text style={[styles.noNotes, {color: theme.textMuted}]}>
              No notes yet
            </Text>
          ) : (
            notes.map(note => (
              <View
                key={note.id}
                style={[styles.note, {borderBottomColor: theme.borderLight}]}>
                <Text style={[styles.noteAuthor, {color: theme.textSecondary}]}>
                  {note.author}
                </Text>
                <Text style={[styles.noteText, {color: theme.textTertiary}]}>
                  {note.note}
                </Text>
                <Text style={[styles.noteDate, {color: theme.textMuted}]}>
                  {formatDate(note.date_created)}
                </Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      <Modal
        visible={noteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}>
        <View style={[styles.modalOverlay, {backgroundColor: theme.modalOverlay}]}>
          <View style={[styles.modalContent, {backgroundColor: theme.modalBg}]}>
            <Text style={[styles.modalTitle, {color: theme.textPrimary}]}>
              Add Note
            </Text>
            <TextInput
              style={[
                styles.noteInput,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.inputText,
                },
              ]}
              placeholder="Write a note..."
              placeholderTextColor={theme.textMuted}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setNoteModalVisible(false)}
              />
              <Button title="Save" onPress={handleAddNote} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '500',
  },
  detail: {
    fontSize: 14,
    marginTop: 2,
  },
  actionButton: {
    marginBottom: 12,
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addNote: {
    fontSize: 14,
    fontWeight: '600',
  },
  noNotes: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  note: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  noteAuthor: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 14,
    marginTop: 2,
  },
  noteDate: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});
