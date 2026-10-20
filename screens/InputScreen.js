import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getStreak, saveGoal } from '../utils/storage';

export default function InputScreen() {
  const navigation = useNavigation();
  const [streak, setStreak] = useState(0);
  const [goal, setGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refresh the streak whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadStreak() {
        try {
          const currentStreak = await getStreak();
          if (isActive) {
            setStreak(currentStreak);
          }
        } catch (error) {
          console.error('Failed to load streak:', error);
        }
      }

      loadStreak();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleStartFocus = async () => {
    const trimmedGoal = goal.trim();
    if (!trimmedGoal || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await saveGoal(trimmedGoal);
      navigation.navigate('Focus');
    } catch (error) {
      console.error('Failed to save goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Top Streak Display */}
          <View style={styles.topSection}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak} Day Streak</Text>
            </View>
          </View>

          {/* Centered Goal Input & Button */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.centerSection}
          >
            <Text style={styles.title}>What is your #1 goal for today?</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Finish project proposal"
              placeholderTextColor="#666670"
              value={goal}
              onChangeText={setGoal}
              returnKeyType="done"
              onSubmitEditing={handleStartFocus}
              autoCapitalize="sentences"
              autoCorrect={false}
              selectionColor="#FFFFFF"
            />

            <TouchableOpacity
              style={[
                styles.button,
                !goal.trim() && styles.buttonDisabled,
              ]}
              onPress={handleStartFocus}
              disabled={!goal.trim() || isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.buttonText}>Start Focus</Text>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>

          {/* Absolute Bottom Google AdMob Banner */}
          <View style={styles.adContainer}>
            <BannerAd
              unitId={TestIds.BANNER}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    justifyContent: 'space-between',
    backgroundColor: '#0D0D0E',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 24,
  },
  streakBadge: {
    backgroundColor: '#18181C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#292930',
  },
  streakText: {
    color: '#ECECEE',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  title: {
    color: '#F4F4F6',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: -0.4,
  },
  input: {
    width: '100%',
    backgroundColor: '#16161A',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#292932',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D0E',
  },
});
