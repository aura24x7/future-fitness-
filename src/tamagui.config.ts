import { createTamagui } from 'tamagui'
import { tokens } from './theme/tokens'
import { lightTheme, darkTheme } from './theme/themes'

const config = createTamagui({
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
