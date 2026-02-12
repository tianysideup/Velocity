import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type AboutAppNavigationProp = StackNavigationProp<RootStackParamList, 'AboutApp'>;

const AboutAppScreen = () => {
  const navigation = useNavigation<AboutAppNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About App</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.appLogo}>
            <Image
              source={require('../../assets/app-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Velocity</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* About Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Velocity</Text>
          <Text style={styles.description}>
            Velocity is your ultimate car rental companion, designed to make vehicle rental simple, 
            fast, and convenient. Whether you need a car for business, leisure, or special occasions, 
            Velocity connects you with a wide range of quality vehicles at competitive prices.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="search" size={20} color="#000" />
              <Text style={styles.featureText}>Easy vehicle search and filtering</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={20} color="#000" />
              <Text style={styles.featureText}>Flexible booking and scheduling</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color="#000" />
              <Text style={styles.featureText}>Secure payment processing</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="notifications" size={20} color="#000" />
              <Text style={styles.featureText}>Real-time booking updates</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="headset" size={20} color="#000" />
              <Text style={styles.featureText}>24/7 customer support</Text>
            </View>
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <Text style={styles.description}>
            Velocity is committed to providing exceptional car rental services with a focus on 
            customer satisfaction, safety, and reliability. Our team works tirelessly to ensure 
            you have access to well-maintained vehicles and outstanding service.
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color="#000" />
              <Text style={styles.contactText}>support@velocity.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#000" />
              <Text style={styles.contactText}>+1 (555) 123-4567</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color="#000" />
              <Text style={styles.contactText}>123 Main Street, City, State 12345</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  contactInfo: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default AboutAppScreen;