import { Platform } from 'react-native';

export const DocumentationUtils = {
  // Generate component documentation
  generateComponentDocs: (component: {
    name: string;
    props: Record<string, any>;
    accessibility?: Record<string, any>;
    theme?: Record<string, any>;
  }) => {
    return {
      name: component.name,
      props: Object.keys(component.props).map(key => ({
        name: key,
        type: typeof component.props[key],
        required: component.props[key] === undefined,
        description: '', // To be filled by developer
      })),
      accessibility: component.accessibility && {
        role: component.accessibility.role,
        label: component.accessibility.label,
        hints: component.accessibility.hints,
      },
      theme: component.theme && {
        colors: Object.keys(component.theme.colors || {}),
        spacing: Object.keys(component.theme.spacing || {}),
      },
    };
  },

  // Generate testing documentation
  generateTestDocs: (tests: Array<{
    name: string;
    description: string;
    platform?: 'ios' | 'android' | 'all';
  }>) => {
    return tests
      .filter(test => 
        test.platform === undefined || 
        test.platform === 'all' || 
        test.platform === Platform.OS
      )
      .map(test => ({
        ...test,
        platform: test.platform || 'all',
      }));
  },

  // New documentation generators
  generateAccessibilityDocs: (component: {
    name: string;
    accessibility: Record<string, any>;
  }) => {
    return {
      name: component.name,
      accessibilityFeatures: {
        screenReader: {
          label: component.accessibility.label || '',
          role: component.accessibility.role || '',
          hints: component.accessibility.hints || [],
          required: true,
          testInstructions: [
            'Verify VoiceOver/TalkBack reads correct label',
            'Confirm proper role announcement',
            'Check hint clarity and relevance'
          ]
        },
        colorContrast: {
          required: true,
          ratio: '4.5:1 minimum',
          testInstructions: [
            'Verify text contrast meets WCAG standards',
            'Test with color blindness simulation',
            'Check dark mode contrast compliance'
          ]
        },
        touchTargets: {
          required: true,
          minimumSize: '44x44 points',
          testInstructions: [
            'Verify minimum touch target size',
            'Check spacing between targets',
            'Test with maximum font size'
          ]
        }
      }
    };
  },

  generateDeploymentChecklist: () => {
    return {
      preDeployment: [
        {
          category: 'Accessibility',
          items: [
            'Screen reader support verified',
            'Color contrast requirements met',
            'Touch targets properly sized',
            'RTL layout support confirmed'
          ]
        },
        {
          category: 'Theme System',
          items: [
            'Light/dark mode transitions smooth',
            'No layout shifts during switch',
            'Theme persistence working',
            'System theme sync verified'
          ]
        },
        {
          category: 'Performance',
          items: [
            'Theme switch under 16ms',
            'No memory leaks',
            'Smooth animations',
            'State preservation confirmed'
          ]
        }
      ],
      monitoring: [
        {
          category: 'Runtime',
          metrics: [
            'Theme switch timing',
            'Memory usage',
            'Frame drops',
            'Error rates'
          ]
        }
      ]
    };
  }
}; 