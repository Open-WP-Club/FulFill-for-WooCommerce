export const colors = {
  light: {
    isDark: false,

    // Primary — from logo (#F97316 orange)
    primary: '#F97316',
    primaryDark: '#EA580C',
    primaryLight: '#FFF7ED',

    // Backgrounds
    background: '#F9FAFB',
    surface: '#fff',
    surfaceSecondary: '#F3F4F6',

    // Text
    textPrimary: '#111827',
    textSecondary: '#374151',
    textTertiary: '#6B7280',
    textMuted: '#9CA3AF',
    textOnPrimary: '#fff',

    // Borders
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    inputBorder: '#D1D5DB',

    // Semantic
    success: '#10B981',
    successBg: '#F0FDF4',
    warning: '#F59E0B',
    error: '#EF4444',
    danger: '#DC2626',
    info: '#3B82F6',
    purple: '#8B5CF6',

    // Shadows
    shadow: '#000',

    // Status bar
    statusBar: 'dark-content' as 'dark-content' | 'light-content',

    // Tab bar
    tabBarBg: '#fff',
    tabBarBorder: '#E5E7EB',

    // Modal
    modalOverlay: 'rgba(0,0,0,0.5)',
    modalBg: '#fff',

    // Input
    inputBg: '#fff',
    inputText: '#111827',

    // Camera
    cameraBg: '#000',
  },

  dark: {
    isDark: true,

    // Primary — brighter orange for dark mode
    primary: '#FB923C',
    primaryDark: '#F97316',
    primaryLight: '#431407',

    // Backgrounds
    background: '#111827',
    surface: '#1F2937',
    surfaceSecondary: '#374151',

    // Text
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    textMuted: '#6B7280',
    textOnPrimary: '#fff',

    // Borders
    border: '#374151',
    borderLight: '#1F2937',
    inputBorder: '#4B5563',

    // Semantic
    success: '#34D399',
    successBg: '#064E3B',
    warning: '#FBBF24',
    error: '#F87171',
    danger: '#EF4444',
    info: '#60A5FA',
    purple: '#A78BFA',

    // Shadows
    shadow: '#000',

    // Status bar
    statusBar: 'light-content' as 'dark-content' | 'light-content',

    // Tab bar
    tabBarBg: '#1F2937',
    tabBarBorder: '#374151',

    // Modal
    modalOverlay: 'rgba(0,0,0,0.7)',
    modalBg: '#1F2937',

    // Input
    inputBg: '#374151',
    inputText: '#F9FAFB',

    // Camera
    cameraBg: '#000',
  },
};

export type ThemeColors = typeof colors.light;
export type ThemeMode = 'light' | 'dark' | 'system';
