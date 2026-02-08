import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>VELOCITY</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            {currentUser?.email}
          </Text>
        </View>

        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>🚗 Vehicle Rentals</Text>
          <Text style={styles.placeholderText}>
            Vehicle rental features coming soon...
          </Text>
        </View>

        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>⭐ Testimonials</Text>
          <Text style={styles.placeholderText}>
            Share your experience coming soon...
          </Text>
        </View>

        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>📞 Contact Us</Text>
          <Text style={styles.placeholderText}>
            Contact features coming soon...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030303',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fb6b28',
    letterSpacing: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(251, 107, 40, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fb6b28',
  },
  logoutText: {
    color: '#fb6b28',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 24,
  },
  welcomeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fefefe',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  placeholderCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fefefe',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
});

export default HomeScreen;
