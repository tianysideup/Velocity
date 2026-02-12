import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  StatusBar,
  Modal,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../navigation/types';
import { Vehicle } from '../services/vehicleService';
import { createRental } from '../services/rentalService';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

type ReservationRouteProp = RouteProp<RootStackParamList, 'Reservation'>;
type ReservationNavigationProp = StackNavigationProp<RootStackParamList, 'Reservation'>;

interface ReservationData {
  pickupDate: Date;
  returnDate: Date;
  fullName: string;
  email: string;
  phone: string;
  vehicleId: string;
  userId: string;
  totalAmount: number;
  numberOfDays: number;
}

const ReservationScreen = () => {
  const navigation = useNavigation<ReservationNavigationProp>();
  const route = useRoute<ReservationRouteProp>();
  const { vehicle } = route.params;
  const { currentUser } = useAuth();
  
  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  
  const numberOfDays = Math.max(1, Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)));
  const subtotal = vehicle.price * numberOfDays;
  const totalAmount = subtotal;

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFullName(userData.name || '');
            setPhone(userData.phone || '');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const handlePickupDateChange = (event: any, selectedDate?: Date) => {
    setShowPickupPicker(false);
    if (selectedDate) {
      setPickupDate(selectedDate);
      // Ensure return date is after pickup date
      if (selectedDate >= returnDate) {
        setReturnDate(new Date(selectedDate.getTime() + 86400000));
      }
    }
  };

  const handleReturnDateChange = (event: any, selectedDate?: Date) => {
    setShowReturnPicker(false);
    if (selectedDate && selectedDate > pickupDate) {
      setReturnDate(selectedDate);
    }
  };

  const generateConfirmationNumber = (): string => {
    const timestamp = Date.now().toString();
    return `VR${timestamp.slice(-8)}`;
  };

  const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const showConfirmationDialog = () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (pickupDate <= new Date()) {
      Alert.alert('Invalid Date', 'Pick-up date must be in the future.');
      return;
    }

    setShowConfirmationModal(true);
  };



  const handleConfirmReservation = async () => {
    try {
      setLoading(true);
      setShowConfirmationModal(false);
      
      // Generate confirmation number
      const confirmNumber = generateConfirmationNumber();
      
      const reservationData: ReservationData & { vehicle: Vehicle; confirmationNumber: string } = {
        confirmationNumber: confirmNumber,
        pickupDate,
        returnDate,
        fullName,
        email,
        phone,
        vehicleId: vehicle.id || '',
        userId: currentUser?.uid || '',
        totalAmount,
        numberOfDays,
        vehicle,
      };

      // Create rental in Firebase (returns confirmation number)
      await createRental(reservationData);
      
      setConfirmationNumber(confirmNumber);
      
      setLoading(false);
      setShowReceiptModal(true);
      
    } catch (error) {
      console.error('Reservation error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to create reservation. Please try again.');
    }
  };

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
        <Text style={styles.headerTitle}>Complete Your Reservation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Rental Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rental Details</Text>
            
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.label}>Pick-up Date</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => setShowPickupPicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(pickupDate)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateField}>
                <Text style={styles.label}>Return Date</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => setShowReturnPicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(returnDate)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputField}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
              />
            </View>
            
            <View style={styles.inputField}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputField}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={(text) => {
                  const digitsOnly = text.replace(/[^0-9]/g, '');
                  if (digitsOnly.length <= 11) {
                    setPhone(digitsOnly);
                  }
                }}
                placeholder="09123456789"
                keyboardType="phone-pad"
                maxLength={11}
              />
              <Text style={styles.helperText}>{phone.length}/11 digits</Text>
            </View>
          </View>

          {/* Booking Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            
            <View style={styles.vehicleInfo}>
              <Image 
                source={{ uri: vehicle.image }}
                style={styles.vehicleImage}
                resizeMode="cover"
              />
              <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleType}>{vehicle.type}</Text>
              </View>
            </View>
            
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Daily Rate</Text>
                <Text style={styles.priceValue}>₱{vehicle.price}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Number of Days</Text>
                <Text style={styles.priceValue}>{numberOfDays}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>₱{subtotal}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₱{totalAmount.toFixed(0)}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
              onPress={showConfirmationDialog}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.confirmButtonText}>Processing Reservation...</Text>
                </View>
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
              )}
            </TouchableOpacity>
            

          </View>
        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showPickupPicker && (
        <DateTimePicker
          value={pickupDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handlePickupDateChange}
        />
      )}
      
      {showReturnPicker && (
        <DateTimePicker
          value={returnDate}
          mode="date"
          display="default"
          minimumDate={new Date(pickupDate.getTime() + 86400000)}
          onChange={handleReturnDateChange}
        />
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.confirmationHeader}>
              <Ionicons name="help-circle" size={48} color="#000" />
              <Text style={styles.confirmationTitle}>Confirm Reservation</Text>
              <Text style={styles.confirmationMessage}>
                Are you sure you want to reserve this vehicle?
              </Text>
            </View>
            
            <View style={styles.confirmationDetails}>
              <Text style={styles.confirmationDetailText}>
                {vehicle.name} • {formatDate(pickupDate)} to {formatDate(returnDate)}
              </Text>
              <Text style={styles.confirmationAmountText}>
                Total: {formatCurrency(totalAmount)}
              </Text>
            </View>
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmationConfirmButton}
                onPress={handleConfirmReservation}
                disabled={loading}
              >
                <Text style={styles.confirmationConfirmText}>
                  {loading ? 'Processing...' : 'Yes, Reserve'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        visible={showReceiptModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptModal}>
            <ScrollView style={styles.receiptContent} showsVerticalScrollIndicator={false}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptTitle}>RENTAL CONFIRMATION RECEIPT</Text>
                <Text style={styles.receiptCompany}>Velocity</Text>
                <View style={styles.receiptDivider} />
              </View>

              <View style={styles.receiptSection}>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Confirmation Number:</Text>
                  <Text style={styles.receiptValue}>{confirmationNumber}</Text>
                </View>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Date Issued:</Text>
                  <Text style={styles.receiptValue}>{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</Text>
                </View>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>CUSTOMER INFORMATION</Text>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Name:</Text>
                  <Text style={styles.receiptValue}>{fullName}</Text>
                </View>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Email:</Text>
                  <Text style={styles.receiptValue}>{email}</Text>
                </View>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Phone:</Text>
                  <Text style={styles.receiptValue}>{phone}</Text>
                </View>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>VEHICLE INFORMATION</Text>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Vehicle:</Text>
                  <Text style={styles.receiptValue}>{vehicle.name}</Text>
                </View>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Type:</Text>
                  <Text style={styles.receiptValue}>{vehicle.type}</Text>
                </View>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Daily Rate:</Text>
                  <Text style={styles.receiptValue}>{formatCurrency(vehicle.price)}</Text>
                </View>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>RENTAL PERIOD</Text>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Pick-up Date:</Text>
                  <Text style={styles.receiptValue}>{formatDate(pickupDate)}</Text>
                </View>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Return Date:</Text>
                  <Text style={styles.receiptValue}>{formatDate(returnDate)}</Text>
                </View>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Duration:</Text>
                  <Text style={styles.receiptValue}>{numberOfDays} Day{numberOfDays > 1 ? 's' : ''}</Text>
                </View>
              </View>

              <View style={styles.receiptSection}>
                <Text style={styles.receiptSectionTitle}>PAYMENT SUMMARY</Text>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptLabel}>Subtotal ({numberOfDays} day{numberOfDays > 1 ? 's' : ''} × {formatCurrency(vehicle.price)}):</Text>
                  <Text style={styles.receiptValue}>{formatCurrency(subtotal)}</Text>
                </View>
              </View>

              <View style={styles.receiptTotal}>
                <View style={styles.receiptInfoRow}>
                  <Text style={styles.receiptTotalLabel}>Total Amount:</Text>
                  <Text style={styles.receiptTotalValue}>{formatCurrency(totalAmount)}</Text>
                </View>
              </View>

              <View style={styles.receiptNotice}>
                <Text style={styles.receiptNoticeText}>
                  IMPORTANT: Please present this confirmation receipt at our store to complete your reservation.
                </Text>
              </View>

              <View style={styles.receiptTerms}>
                <Text style={styles.receiptTermsText}>
                  Terms & Conditions: Valid driver's license required. Payment due at vehicle pick-up. Free cancellation within 24 hours.
                </Text>
              </View>

              <View style={styles.receiptFooter}>
                <Text style={styles.receiptThankYou}>Thank you for choosing Velocity!</Text>
              </View>
            </ScrollView>

            <View style={styles.receiptActions}>
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => {
                  setShowReceiptModal(false);
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  summarySection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  inputField: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    color: '#000',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  vehicleImage: {
    width: 60,
    height: 45,
    borderRadius: 6,
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  vehicleType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'lowercase',
  },
  priceBreakdown: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#333',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
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
  confirmButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Confirmation Modal
  confirmationModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 340,
    width: '100%',
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmationDetails: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmationDetailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  confirmationAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  confirmationConfirmButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmationConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Receipt Modal
  receiptModal: {
    backgroundColor: '#fff',
    marginTop: 60,
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    flex: 1,
    maxHeight: '90%',
  },
  receiptContent: {
    flex: 1,
    padding: 24,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  receiptCompany: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginTop: 8,
  },
  receiptDivider: {
    height: 2,
    backgroundColor: '#000',
    width: '100%',
    marginTop: 12,
  },
  receiptSection: {
    marginBottom: 20,
  },
  receiptSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  receiptInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 4,
  },
  receiptLabel: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
    flex: 1,
  },
  receiptTotal: {
    borderTopWidth: 2,
    borderTopColor: '#000',
    paddingTop: 16,
    marginBottom: 24,
  },
  receiptTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  receiptTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  receiptNotice: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#000',
  },
  receiptNoticeText: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },
  receiptTerms: {
    marginBottom: 16,
  },
  receiptTermsText: {
    fontSize: 10,
    color: '#666',
    lineHeight: 14,
    textAlign: 'center',
  },
  receiptFooter: {
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptThankYou: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  receiptActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  doneButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default ReservationScreen;