import { addDays } from 'date-fns';
import { Platform } from 'react-native';

export function getPlatformDate(date: Date) {
  // if (Platform.OS === 'ios' || Platform.OS === '') {
  return addDays(date, 1);
  // }
  // return date;
}
