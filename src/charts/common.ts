import Chart from 'chart.js';

//Chart.defaults.global.animation = { duration: 0 };

export const Colors = {
  BLUE: 'hsla(210, 90%, 50%, 0.7)',
  LIGHT_BLUE: 'hsla(210, 90%, 50%, 0.2)',
  GREEN: 'hsla(120, 100%, 50%, 0.3)',
  RED: 'hsla(0, 100%, 50%, 0.3)',
  ORANGE: 'hsla(30, 100%, 50%, 0.3)',
  CYAN: 'hsla(160, 100%, 50%, 0.3)',
  REFERENCE_LIGHT: 'hsla(0, 0%, 70%, 0.3)',
  REFERENCE_DARK: 'hsla(0, 0%, 30%, 0.3)',
};

export interface References<T> {
  means?: T;
  medians?: T;
  upperQuantile?: T;
  lowerQuantile?: T;
}
