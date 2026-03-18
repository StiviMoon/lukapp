export const haptics = {
  light:   () => navigator.vibrate?.(10),
  medium:  () => navigator.vibrate?.(25),
  success: () => navigator.vibrate?.([10, 50, 10]),
  warning: () => navigator.vibrate?.([50, 30, 50]),
  error:   () => navigator.vibrate?.([100, 50, 100]),
};
