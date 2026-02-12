import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type PrivacyPolicyNavigationProp = StackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation<PrivacyPolicyNavigationProp>();

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
        <Text style={styles.headerTitle}>Privacy Policy & Terms</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last updated: February 11, 2026</Text>
        </View>

        {/* Privacy Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.description}>
            At Velocity, we are committed to protecting your privacy and personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your data when you 
            use our car rental services.
          </Text>
        </View>

        {/* Information We Collect */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Information We Collect</Text>
          <Text style={styles.description}>
            We collect the following types of information:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Personal information (name, email, phone number)</Text>
            <Text style={styles.bulletItem}>• Driver's license information for verification</Text>
            <Text style={styles.bulletItem}>• Payment information (processed securely)</Text>
            <Text style={styles.bulletItem}>• Vehicle usage and rental history</Text>
            <Text style={styles.bulletItem}>• Location data when using our services</Text>
          </View>
        </View>

        {/* How We Use Your Information */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>How We Use Your Information</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• To process and manage your car rentals</Text>
            <Text style={styles.bulletItem}>• To verify your identity and driving credentials</Text>
            <Text style={styles.bulletItem}>• To process payments and send confirmations</Text>
            <Text style={styles.bulletItem}>• To provide customer support</Text>
            <Text style={styles.bulletItem}>• To improve our services and user experience</Text>
            <Text style={styles.bulletItem}>• To send service-related communications</Text>
          </View>
        </View>

        {/* Data Security */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Data Security</Text>
          <Text style={styles.description}>
            We implement robust security measures to protect your personal information, including 
            encryption, secure servers, and regular security audits. Your payment information is 
            processed through secure, PCI-compliant payment processors.
          </Text>
        </View>

        {/* Terms of Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms of Service</Text>
          
          <Text style={styles.subsectionTitle}>Rental Agreement</Text>
          <Text style={styles.description}>
            By using Velocity, you agree to rent vehicles responsibly and return them in the same 
            condition as received, normal wear and tear excepted.
          </Text>
          
          <Text style={styles.subsectionTitle}>User Responsibilities</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide accurate and current information</Text>
            <Text style={styles.bulletItem}>• Use vehicles only for lawful purposes</Text>
            <Text style={styles.bulletItem}>• Report any accidents or damage immediately</Text>
            <Text style={styles.bulletItem}>• Return vehicles on time and in good condition</Text>
            <Text style={styles.bulletItem}>• Pay all fees and charges promptly</Text>
          </View>
          
          <Text style={styles.subsectionTitle}>Prohibited Activities</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Using vehicles for illegal activities</Text>
            <Text style={styles.bulletItem}>• Allowing unauthorized drivers to operate vehicles</Text>
            <Text style={styles.bulletItem}>• Smoking or allowing pets in vehicles (unless specified)</Text>
            <Text style={styles.bulletItem}>• Exceeding vehicle capacity or weight limits</Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Contact Us</Text>
          <Text style={styles.description}>
            If you have any questions about this Privacy Policy or Terms of Service, 
            please contact us at privacy@velocity.com or call +1 (555) 123-4567.
          </Text>
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
  section: {
    marginBottom: 24,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 8,
    marginLeft: 8,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 6,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default PrivacyPolicyScreen;