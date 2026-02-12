import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Vehicle } from '../services/vehicleService';

const { width, height } = Dimensions.get('window');

type VehicleDetailsRouteProp = RouteProp<RootStackParamList, 'VehicleDetails'>;
type VehicleDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'VehicleDetails'>;

const VehicleDetailsScreen = () => {
  const navigation = useNavigation<VehicleDetailsNavigationProp>();
  const route = useRoute<VehicleDetailsRouteProp>();
  const { vehicle } = route.params;
  
  const features = [
    { icon: 'car-outline', label: vehicle.type },
    { icon: 'water-outline', label: 'Gasoline' },
    { icon: 'settings-outline', label: 'Automatic' },
  ];

  const includedFeatures = [
    'Air Conditioning',
    'GPS Navigation', 
    'Cruise Control',
    'Bluetooth',
    'Backup Camera',
    'USB Ports',
  ];

  const handleReserve = () => {
    navigation.navigate('Reservation', { vehicle });
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
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          {/* Main Image */}
          <View style={styles.mainImageContainer}>
            {vehicle.image ? (
              <Image
                source={{ uri: vehicle.image }}
                style={styles.mainImage}
                resizeMode="cover"
                onError={(e) => console.log('VehicleDetails image error:', e.nativeEvent.error)}
              />
            ) : (
              <View style={[styles.mainImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
                <Ionicons name="car" size={60} color="#ccc" />
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailsSection}>
          {/* Vehicle Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{vehicle.type.toUpperCase()}</Text>
          </View>

          {/* Vehicle Name */}
          <View style={styles.titleRow}>
            <Text style={styles.vehicleName}>{vehicle.name}</Text>
          </View>

          {/* Features Row */}
          <View style={styles.featuresRow}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name={feature.icon as any} size={20} color="#666" />
                <Text style={styles.featureText}>{feature.label}</Text>
              </View>
            ))}
          </View>

          {/* What's Included Section */}
          <View style={styles.includedSection}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.includedGrid}>
              {includedFeatures.map((feature, index) => (
                <View key={index} style={styles.includedItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.includedText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.requirementsSection}>
            <View style={styles.requirementItem}>
              <Text style={styles.requirementText}>License required</Text>
            </View>
          </View>

          {/* Price and Reserve Button */}
          <View style={styles.bottomSection}>
            <View style={styles.priceSection}>
              <Text style={styles.price}>₱{vehicle.price}</Text>
              <Text style={styles.period}>/day</Text>
            </View>
            <TouchableOpacity style={styles.reserveButton} onPress={handleReserve}>
              <Text style={styles.reserveButtonText}>Reserve Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mainImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  typeBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  includedSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  includedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  includedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  includedText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  requirementsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  requirementItem: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  period: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  reserveButton: {
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default VehicleDetailsScreen;