import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserRentals, type Rental } from '../services/rentalService';
import { RootStackParamList } from '../navigation/types';

type NotificationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const { currentUser } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigation.goBack();
      return;
    }

    const unsubscribe = subscribeToUserRentals(currentUser.uid, (data) => {
      setRentals(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const viewReceipt = (rental: Rental) => {
    setSelectedRental(rental);
    setShowReceiptModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'active':
        return 'checkmark-circle-outline';
      case 'completed':
        return 'checkbox-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const renderRentalItem = ({ item }: { item: Rental }) => (
    <TouchableOpacity
      style={styles.rentalItem}
      onPress={() => viewReceipt(item)}
    >
      <View style={styles.rentalHeader}>
        <View style={styles.statusContainer}>
          <Ionicons
            name={getStatusIcon(item.status) as any}
            size={20}
            color={getStatusColor(item.status)}
          />
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.rentalInfo}>
        <Text style={styles.vehicleName}>{item.vehicleName}</Text>
        <Text style={styles.confirmationNumber}>#{item.confirmationNumber}</Text>
      </View>

      <View style={styles.rentalDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.pickupDate).toLocaleDateString()} - {new Date(item.returnDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.detailText}>₱{item.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewReceiptButton}
        onPress={() => viewReceipt(item)}
      >
        <Text style={styles.viewReceiptText}>View Receipt</Text>
        <Ionicons name="chevron-forward" size={16} color="#000" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rentals</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading rentals...</Text>
        </View>
      ) : rentals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Rentals Yet</Text>
          <Text style={styles.emptyText}>
            Your rental history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={rentals}
          renderItem={renderRentalItem}
          keyExtractor={(item) => item.id || item.confirmationNumber}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Receipt Modal */}
      {selectedRental && (
        <Modal
          visible={showReceiptModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowReceiptModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.receiptModal}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptTitle}>Rental Receipt</Text>
                <TouchableOpacity
                  onPress={() => setShowReceiptModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.receiptContent}>
                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRental.status) }]}>
                    <Ionicons name={getStatusIcon(selectedRental.status) as any} size={24} color="#fff" />
                    <Text style={styles.statusBadgeText}>
                      {selectedRental.status.toUpperCase()}
                    </Text>
                  </View>

                  {/* Confirmation Number */}
                  <View style={styles.confirmationSection}>
                    <Text style={styles.confirmationLabel}>Confirmation Number</Text>
                    <Text style={styles.confirmationCode}>{selectedRental.confirmationNumber}</Text>
                  </View>

                  {/* Vehicle Info */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle Details</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Vehicle:</Text>
                      <Text style={styles.infoValue}>{selectedRental.vehicleName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Type:</Text>
                      <Text style={styles.infoValue}>{selectedRental.vehicleType}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Daily Rate:</Text>
                      <Text style={styles.infoValue}>₱{selectedRental.dailyRate}/day</Text>
                    </View>
                  </View>

                  {/* Rental Period */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rental Period</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Pickup Date:</Text>
                      <Text style={styles.infoValue}>
                        {new Date(selectedRental.pickupDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Return Date:</Text>
                      <Text style={styles.infoValue}>
                        {new Date(selectedRental.returnDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Duration:</Text>
                      <Text style={styles.infoValue}>
                        {selectedRental.numberOfDays} {selectedRental.numberOfDays === 1 ? 'day' : 'days'}
                      </Text>
                    </View>
                  </View>

                  {/* Customer Info */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Name:</Text>
                      <Text style={styles.infoValue}>{selectedRental.customerName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Email:</Text>
                      <Text style={styles.infoValue}>{selectedRental.customerEmail}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Phone:</Text>
                      <Text style={styles.infoValue}>{selectedRental.customerPhone}</Text>
                    </View>
                  </View>

                  {/* Payment Summary */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Summary</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Subtotal:</Text>
                      <Text style={styles.infoValue}>₱{selectedRental.subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Amount:</Text>
                      <Text style={styles.totalValue}>₱{selectedRental.totalAmount.toFixed(2)}</Text>
                    </View>
                  </View>

                  <Text style={styles.receiptFooter}>
                    Created: {new Date(selectedRental.createdAt).toLocaleString()}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  listContainer: {
    padding: 20,
  },
rentalItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  rentalInfo: {
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  confirmationNumber: {
    fontSize: 14,
    color: '#666',
  },
  rentalDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  viewReceiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  viewReceiptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  receiptModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  receiptContent: {
    padding: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  confirmationSection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  confirmationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  confirmationCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  receiptFooter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NotificationsScreen;
