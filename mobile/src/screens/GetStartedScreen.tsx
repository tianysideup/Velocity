import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

type GetStartedScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'GetStarted'>;
};

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 64;
const BUTTON_WIDTH = 60;
const SLIDE_THRESHOLD = SLIDER_WIDTH - BUTTON_WIDTH - 10;

const GetStartedScreen = ({ navigation }: GetStartedScreenProps) => {
  const pan = useRef(new Animated.Value(0)).current;
  const { currentUser } = useAuth();

  const completeOnboarding = async () => {
    if (currentUser) {
      try {
        await AsyncStorage.setItem(`onboarding_${currentUser.uid}`, 'true');
      } catch (error) {
        console.error('Error saving onboarding status:', error);
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx >= 0 && gestureState.dx <= SLIDE_THRESHOLD) {
          pan.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SLIDE_THRESHOLD * 0.7) {
          Animated.timing(pan, {
            toValue: SLIDE_THRESHOLD,
            duration: 200,
            useNativeDriver: false,
          }).start(async () => {
            await completeOnboarding();
            navigation.replace('Home');
          });
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Background decorative circles */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
      <View style={styles.backgroundCircle3} />

      <View style={styles.content}>
        {/* Floating feature card - top left */}
        <View style={styles.featureCardLeft}>
          <View style={styles.featureIconContainer}>
            <Ionicons name="car" size={24} color="#000" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Instant booking</Text>
            <Text style={styles.featureSubtitle}>Fast confirmation</Text>
          </View>
        </View>

        {/* Hero Image */}
        <Image
          source={require('../../assets/hero.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />

        {/* Floating feature card - bottom right */}
        <View style={styles.featureCardRight}>
          <View style={styles.featureIconContainer}>
            <Ionicons name="construct" size={24} color="#000" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Quality checked</Text>
            <Text style={styles.featureSubtitle}>Ready to rent</Text>
          </View>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.actionText}>Swipe to begin your journey</Text>
        <View style={styles.sliderTrack}>
          <Text style={styles.sliderText}>Get Started</Text>
          <Animated.View
            style={[
              styles.sliderButton,
              {
                transform: [{ translateX: pan }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'space-between',
    paddingVertical: 60,
    overflow: 'hidden',
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    top: -100,
    right: -100,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    bottom: 200,
    left: -50,
  },
  backgroundCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
    top: '40%',
    right: -30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    position: 'relative',
  },
  featureCardLeft: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: 180,
  },
  featureCardRight: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: 180,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 11,
    color: 'rgba(26, 26, 26, 0.6)',
  },
  heroImage: {
    width: '100%',
    height: 280,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(26, 26, 26, 0.6)',
    textAlign: 'center',
  },
  sliderContainer: {
    paddingHorizontal: 32,
    paddingBottom: 20,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    color: 'rgba(26, 26, 26, 0.7)',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  sliderTrack: {
    height: 60,
    width: SLIDER_WIDTH,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sliderText: {
    fontSize: 16,
    color: 'rgba(26, 26, 26, 0.5)',
    fontWeight: '500',
  },
  sliderButton: {
    position: 'absolute',
    left: 5,
    width: BUTTON_WIDTH,
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default GetStartedScreen;
