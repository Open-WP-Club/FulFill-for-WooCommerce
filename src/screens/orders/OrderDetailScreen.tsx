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
    <View style={styles.container}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Card>
          <View style={styles.headerRow}>
            <Text style={styles.orderNumber}>Order #{order.number}</Text>
            <StatusBadge status={order.status} />
          </View>
          <Text style={styles.date}>{formatDate(order.date_created)}</Text>
          <Text style={styles.total}>
            {formatCurrency(order.total, order.currency)}
          </Text>
        </Card>

        {/* Customer */}
        <Card>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.customerName}>
            {formatCustomerName(order.billing)}
          </Text>
          {order.billing.email && (
            <Text style={styles.detail}>{order.billing.email}</Text>
          )}
          {order.billing.phone && (
            <Text style={styles.detail}>{order.billing.phone}</Text>
          )}
        </Card>

        {/* Shipping Address */}
        <Card>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.detail}>
            {formatCustomerName(order.shipping)}
          </Text>
          <Text style={styles.detail}>{formatAddress(order.shipping)}</Text>
        </Card>

        {/* Line Items */}
        <Card>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.line_items.map(item => (
            <OrderLineItem
              key={item.id}
              item={item}
              currency={order.currency}
            />
          ))}
        </Card>

        {/* Actions */}
        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Button
            title="Start Pick & Pack"
            onPress={handleStartPicking}
            style={styles.actionButton}
          />
          <View style={styles.statusActions}>
            {STATUS_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.status}
                style={[
                  styles.statusBtn,
                  order.status === action.status && styles.statusBtnActive,
                ]}
                onPress={() => handleStatusChange(action.status)}>
                <Text
                  style={[
                    styles.statusBtnText,
                    order.status === action.status &&
                      styles.statusBtnTextActive,
                  ]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Notes */}
        <Card>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TouchableOpacity onPress={() => setNoteModalVisible(true)}>
              <Text style={styles.addNote}>+ Add Note</Text>
            </TouchableOpacity>
          </View>
          {notes.length === 0 ? (
            <Text style={styles.noNotes}>No notes yet</Text>
          ) : (
            notes.map(note => (
              <View key={note.id} style={styles.note}>
                <Text style={styles.noteAuthor}>{note.author}</Text>
                <Text style={styles.noteText}>{note.note}</Text>
                <Text style={styles.noteDate}>
                  {formatDate(note.date_created)}
                </Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Add Note Modal */}
      <Modal
        visible={noteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNoteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Note</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Write a note..."
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
    backgroundColor: '#F9FAFB',
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
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F46E5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  detail: {
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: '#F3F4F6',
  },
  statusBtnActive: {
    backgroundColor: '#4F46E5',
  },
  statusBtnText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBtnTextActive: {
    color: '#fff',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addNote: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  noNotes: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  note: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  noteAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  noteDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
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
