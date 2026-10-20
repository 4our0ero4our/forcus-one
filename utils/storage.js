import AsyncStorage from '@react-native-async-storage/async-storage';

const GOAL_KEY = '@forcus_one/goal';
const DATE_KEY = '@forcus_one/date';
const STREAK_KEY = '@forcus_one/streak';

/**
 * Saves a single string goal along with the current date.
 * @param {string} goalText - The goal text to save.
 */
export async function saveGoal(goalText) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  await AsyncStorage.multiSet([
    [GOAL_KEY, goalText],
    [DATE_KEY, today],
  ]);
}

/**
 * Retrieves the saved goal and date.
 * @returns {Promise<{ goal: string|null, date: string|null }>}
 */
export async function getGoal() {
  const values = await AsyncStorage.multiGet([GOAL_KEY, DATE_KEY]);
  return {
    goal: values[0][1],
    date: values[1][1],
  };
}

/**
 * Increments the current streak by 1.
 * If no streak exists yet, starts at 0 and saves 1.
 * @returns {Promise<number>} The new streak value.
 */
export async function incrementStreak() {
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  const current = raw !== null ? parseInt(raw, 10) : 0;
  const next = current + 1;
  await AsyncStorage.setItem(STREAK_KEY, next.toString());
  return next;
}

/**
 * Retrieves the current streak count.
 * @returns {Promise<number>}
 */
export async function getStreak() {
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  return raw !== null ? parseInt(raw, 10) : 0;
}
