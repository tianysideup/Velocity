import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type HelpSupportNavigationProp = StackNavigationProp<RootStackParamList, 'HelpSupport'>;

interface FAQItem {
  question: string;
  answer: string;
}

const HelpSupportScreen = () => {
  const navigation = useNavigation<HelpSupportNavigationProp>();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "How do I rent a car?",
      answer: "To rent a car, simply browse our available vehicles, select your preferred car, choose your rental dates, and complete the booking process. You'll need to provide your driver's license and payment information."
    },
    {
      question: "What documents do I need to rent a car?",
      answer: "You need a valid driver's license, a credit card for payment, and you must meet the minimum age requirement (usually 21 years old)."
    },
    {
      question: "Can I modify or cancel my reservation?",
      answer: "Yes, you can modify or cancel your reservation through the app. Cancellation policies may apply depending on how close to your rental date you cancel."
    },
    {
      question: "What if I return the car late?",
      answer: "Late returns may incur additional charges. We recommend returning the vehicle on time or contacting us in advance if you need to extend your rental period."
    },
    {
      question: "What happens if the car breaks down?",
      answer: "If you experience any mechanical issues, contact our emergency support line immediately. We provide 24/7 roadside assistance for all rental vehicles."
    },
    {
      question: "Is insurance included in my rental?",
      answer: "Basic insurance coverage is typically included. Additional coverage options may be available. Please review your rental agreement for specific details."
    },
    {
      question: "Can I add an additional driver?",
      answer: "Yes, additional drivers can be added to your rental agreement. They must meet the same requirements and provide valid documentation."
    },
    {
      question: "What fuel policy do you follow?",
      answer: "Our vehicles are provided with a full tank of fuel. Please return the vehicle with a full tank to avoid refueling charges."
    }
  ];

  const contactMethods = [
    {
      title: "Call Support",
      subtitle: "24/7 Phone Support",
      icon: "call",
      action: () => Linking.openURL('tel:+15551234567')
    },
    {
      title: "Email Us",
      subtitle: "Get help via email",
      icon: "mail",
      action: () => Linking.openURL('mailto:support@velocity.com')
    },
    {
      title: "Emergency Roadside",
      subtitle: "24/7 Emergency Help",
      icon: "car",
      action: () => Linking.openURL('tel:+15551234999')
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactPress = async (action: () => void) => {
    try {
      await action();
    } catch (error) {
      Alert.alert('Error', 'Unable to open this contact method. Please try again.');
    }
  };

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {contactMethods.map((method, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={() => handleContactPress(method.action)}
            >
              <View style={styles.contactIcon}>
                <Ionicons name={method.icon as any} size={24} color="#000" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqContainer}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(index)}
              >
                <Text style={styles.questionText}>{faq.question}</Text>
                <Ionicons 
                  name={expandedFAQ === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              {expandedFAQ === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          
          <View style={styles.resourceItem}>
            <Ionicons name="document-text" size={20} color="#000" />
            <Text style={styles.resourceText}>Check our website for detailed rental policies</Text>
          </View>
          
          <View style={styles.resourceItem}>
            <Ionicons name="time" size={20} color="#000" />
            <Text style={styles.resourceText}>Support hours: 24/7 for emergencies, 8AM-8PM for general inquiries</Text>
          </View>
          
          <View style={styles.resourceItem}>
            <Ionicons name="location" size={20} color="#000" />
            <Text style={styles.resourceText}>Find pickup locations near you in the app</Text>
          </View>
        </View>

        {/* Emergency Note */}
        <View style={styles.emergencyNote}>
          <Ionicons name="warning" size={24} color="#000" />
          <Text style={styles.emergencyText}>
            For roadside emergencies, call our 24/7 emergency line: +1 (555) 123-4999
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
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  faqContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginTop: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resourceText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  emergencyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ffdddd',
  },
  emergencyText: {
    fontSize: 15,
    color: '#000',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default HelpSupportScreen;