import { TamaguiProvider as Provider } from 'tamagui';
import config from '../tamagui.config';

export const TamaguiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider config={config}>{children}</Provider>;
};
