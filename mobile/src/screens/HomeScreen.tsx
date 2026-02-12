import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Modal,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { getAllVehicles, type Vehicle } from '../services/vehicleService';
import { subscribeToUserRentals, type Rental } from '../services/rentalService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [rentalCount, setRentalCount] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    sortBy: 'name'
  });

  const filterOptions = {
    type: [
      { label: 'All Types', value: 'all' },
      { label: 'SUV', value: 'suv' },
      { label: 'Sedan', value: 'sedan' },
      { label: 'Truck', value: 'truck' },
      { label: 'Sports Car', value: 'sports' }
    ],
    sortBy: [
      { label: 'Name', value: 'name' },
      { label: 'Price (Low to High)', value: 'price-asc' },
      { label: 'Price (High to Low)', value: 'price-desc' },
      { label: 'Rating', value: 'rating' }
    ]
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserRentals(currentUser.uid, (rentals) => {
        // Count active and pending rentals
        const activeCount = rentals.filter(
          r => r.status === 'pending' || r.status === 'active'
        ).length;
        setRentalCount(activeCount);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [vehicles, searchQuery, selectedFilters]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = vehicles;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(vehicle =>
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedFilters.type !== 'all') {
      filtered = filtered.filter(vehicle =>
        vehicle.type.toLowerCase() === selectedFilters.type.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedFilters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredVehicles(filtered);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      type: 'all',
      sortBy: 'name'
    });
    setSearchQuery('');
  };

  const renderVehicleCard = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity 
      style={styles.vehicleCard}
      onPress={() => navigation.navigate('VehicleDetails', { vehicle: item })}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.vehicleImage}
            resizeMode="cover"
            onError={(e) => console.log('Image load error for', item.name, ':', e.nativeEvent.error)}
          />
        ) : (
          <View style={[styles.vehicleImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
            <Ionicons name="car" size={40} color="#ccc" />
          </View>
        )}
      </View>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.vehicleType}>{item.type.toUpperCase()}</Text>
        <View style={styles.vehicleFooter}>
          <Text style={styles.price}>₱{item.price}</Text>
          <Text style={styles.period}>/day</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const SkeletonCard = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    const opacity = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });

    return (
      <View style={styles.vehicleCard}>
        <Animated.View style={[styles.skeletonImage, { opacity }]} />
        <View style={styles.vehicleInfo}>
          <Animated.View style={[styles.skeletonText, styles.skeletonTitle, { opacity }]} />
          <Animated.View style={[styles.skeletonText, styles.skeletonSubtitle, { opacity }]} />
          <Animated.View style={[styles.skeletonText, styles.skeletonPrice, { opacity }]} />
        </View>
      </View>
    );
  };

  const renderSkeletonLoading = () => (
    <ScrollView contentContainerStyle={styles.vehiclesGrid} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Cars</Text>
      </View>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { opacity: 0.5 }]}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
        </View>
        <View style={[styles.filterButton, { opacity: 0.5 }]}>
          <Ionicons name="menu" size={20} color="#374151" />
        </View>
      </View>
      <View style={styles.skeletonGrid}>
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <SkeletonCard key={index} />
        ))}
      </View>
    </ScrollView>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#666666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vehicles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666666"
          textAlignVertical="center"
        />
      </View>
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setIsFilterVisible(true)}
      >
        <Ionicons name="menu" size={20} color="#000000" />
      </TouchableOpacity>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={isFilterVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsFilterVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Vehicle Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Vehicle Type</Text>
              {filterOptions.type.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    selectedFilters.type === option.value && styles.filterOptionSelected
                  ]}
                  onPress={() => handleFilterChange('type', option.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilters.type === option.value && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {selectedFilters.type === option.value && (
                    <Ionicons name="checkmark" size={18} color="#000" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort By Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {filterOptions.sortBy.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    selectedFilters.sortBy === option.value && styles.filterOptionSelected
                  ]}
                  onPress={() => handleFilterChange('sortBy', option.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedFilters.sortBy === option.value && styles.filterOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {selectedFilters.sortBy === option.value && (
                    <Ionicons name="checkmark" size={18} color="#000" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={() => setIsFilterVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/app-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>
              {userProfile?.name || currentUser?.email?.split('@')[0] || 'Guest'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={18} color="#000" />
            {rentalCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{rentalCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        renderSkeletonLoading()
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleCard}
          keyExtractor={(item) => item.id || ''}
          numColumns={2}
          contentContainerStyle={styles.vehiclesGrid}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available Cars</Text>
              </View>
              {renderSearchBar()}
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    width: 60,
    height: 60,
    marginRight: 8,
  },
  greetingContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 10,
    fontWeight: '400',
    color: '#666666',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  profileButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  vehicleCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  vehiclesGrid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vehicleCard: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  vehicleInfo: {
    padding: 12,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  vehicleFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  period: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    fontWeight: '400',
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    height: 44,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  filterOptionTextSelected: {
    color: '#000',
    fontWeight: '500',
  },
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  skeletonImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  skeletonText: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonTitle: {
    height: 16,
    width: '80%',
  },
  skeletonSubtitle: {
    height: 12,
    width: '50%',
  },
  skeletonPrice: {
    height: 14,
    width: '40%',
  },
});

export default HomeScreen;
