import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { getGoal, incrementStreak } from '../utils/storage';

export default function FocusScreen() {
  const navigation = useNavigation();
  const [goal, setGoal] = useState('');
  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interstitialRef = useRef(null);
  const hasFinishedRef = useRef(false);

  // 1. Fetch saved goal from storage
  useEffect(() => {
    async function loadGoal() {
      try {
        const data = await getGoal();
        if (data && data.goal) {
          setGoal(data.goal);
        }
      } catch (error) {
        console.error('Failed to load goal:', error);
      } finally {
        setIsLoadingGoal(false);
      }
    }

    loadGoal();
  }, []);

  // 2. Load AdMob Interstitial Ad on mount and configure event listeners
  useEffect(() => {
    const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });
    interstitialRef.current = interstitial;

    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setIsAdLoaded(true);
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        // When user closes the ad, increment streak and navigate back
        finishAndNavigate();
      }
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.warn('Interstitial ad failed to load:', error);
        setIsAdLoaded(false);
      }
    );

    // Trigger loading
    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      interstitialRef.current = null;
    };
  }, []);

  // Completes session: increments streak and navigates back (guaranteed once)
  const finishAndNavigate = async () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    try {
      await incrementStreak();
    } catch (error) {
      console.error('Failed to increment streak:', error);
    } finally {
      navigation.navigate('Input');
    }
  };

  // 3. Handle 'Done' button press
  const handleDone = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (isAdLoaded && interstitialRef.current) {
      try {
        await interstitialRef.current.show();
        // The CLOSED event listener handles finishAndNavigate()
      } catch (showError) {
        console.warn('Failed to show interstitial ad:', showError);
        await finishAndNavigate();
      }
    } else {
      // Ad hasn't loaded or failed: navigate immediately
      await finishAndNavigate();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Subtle Category Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>TODAY'S FOCUS</Text>
        </View>

        {/* Centered Goal Display in Large, Bold Text */}
        <View style={styles.centerSection}>
          {isLoadingGoal ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <Text
              style={styles.goalText}
              numberOfLines={6}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {goal || 'No goal set'}
            </Text>
          )}
        </View>

        {/* Large 'Done' Action Button at Bottom */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.doneButtonText}>Done</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0D0E',
  },
  container: {
    flex: 1,
    backgroundColor: '#0D0D0E',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    paddingTop: 28,
  },
  headerLabel: {
    color: '#71717A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  goalText: {
    color: '#FAFAFA',
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  bottomSection: {
    paddingBottom: 32,
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  doneButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});