import { Check, CloseRounded } from '@mui/icons-material';
import { createTheme } from '@mui/material/styles';
import { ZoomTransition } from './components/ZoomTransition';

declare module '@mui/material/styles' {
  interface TypeBackground {
    s0: string;
    s1: string;
    s2: string;
    s3: string;
    s4: string;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsSizeOverrides {
    large: true;
    'extra-large': true;
  }
  interface ChipPropsVariantOverrides {
    active: true;
    text: true;
  }
  interface ChipPropsColorOverrides {
    inverse: true;
  }
}

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    text: true;
    'text-alt': true;
  }
}

declare module '@mui/material/Alert' {
  interface AlertPropsSizeOverrides {
    small: true;
  }
}

declare module '@mui/material/Alert' {
  interface AlertProps {
    size?: 'small' | 'medium' | 'large' | string;
    align?: 'left' | 'center' | 'right' | string;
  }
}

const surfaceLevels = {
  s0: '#050505',
  s1: '#0E0E0E',
  s2: '#161616',
  s3: '#1C1C1C',
  s4: '#262626',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00C8FF',
      contrastText: '#111111',
      dark: 'hsla(193, 100%, 40%, 1)',
    },
    success: {
      main: '#4CE59B',
    },
    warning: {
      main: '#F5B664',
    },
    error: {
      main: '#EF7D7D',
    },
    divider: '#252525',
    background: {
      ...surfaceLevels,
      default: surfaceLevels.s0,
      paper: surfaceLevels.s1,
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#8C8C8C',
    },
  },
  typography: {
    fontFamily: [
      '"Google Sans"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.8125rem',
      lineHeight: '3.375rem',
      fontWeight: '500',
    },
    h2: {
      fontSize: '1.5rem',
      lineHeight: '2rem',
      letterSpacing: '0',
      fontWeight: '500',
    },
    h3: {
      fontSize: '1.375rem',
      lineHeight: '1.75rem',
      letterSpacing: '0',
      fontWeight: '500',
    },
    h4: {
      fontSize: '1.125rem',
      lineHeight: '1.5rem',
      letterSpacing: '0.15%',
      fontWeight: '500',
    },
    h5: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      letterSpacing: '0.1%',
      fontWeight: '500',
    },
    h6: {
      fontSize: '0.6875rem',
      lineHeight: '1rem',
      letterSpacing: '0.5%',
      fontWeight: '500',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      letterSpacing: '0.25%',
      fontWeight: 'normal',
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: '1rem',
      letterSpacing: '0.25%',
      fontWeight: 'normal',
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {},
      variants: [
        {
          props: { color: 'primary' },
          style: {
            color: '#FFFFFF',
          },
        },
        {
          props: { color: 'secondary' },
          style: {
            color: '#8C8C8C',
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          textTransform: 'none',
          fontWeight: '700',
          boxShadow: 'none',
          height: '2rem',
          padding: '0 1rem',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          color: '#111111',
          '&:hover': {
            background: 'color-mix(in srgb, #00C8FF 60%, #FFFFFF 40%)',
          },
          '&:active': {
            background: 'color-mix(in srgb, #00C8FF 40%, #FFFFFF 60%)',
          },
        },
        containedSecondary: {
          backgroundColor: surfaceLevels.s3,
          color: '#FFFFFF',
          '&:hover': {
            background: `color-mix(in srgb, ${surfaceLevels.s3} 92%, #FFFFFF 8%)`,
          },
          '&:active': {
            background: `color-mix(in srgb, ${surfaceLevels.s3} 88%, #FFFFFF 12%)`,
          },
        },
        text: {
          color: '#FFFFFF',
          '&:hover': {
            background: 'color-mix(in srgb, #FFFFFF 8%, transparent)',
          },
          '&:active': {
            background: 'color-mix(in srgb, #FFFFFF 12%, transparent)',
          },
        },
        sizeSmall: {
          height: '1.75rem',
          padding: '0 0.75rem',
        },
        startIcon: {
          marginRight: '0.25rem',
          marginLeft: '-0.25rem',
        },
        endIcon: {
          marginLeft: '0.25rem',
          marginRight: '-0.25rem',
        },
      },
    },
    MuiChip: {
      defaultProps: {
        deleteIcon: <CloseRounded />,
        size: 'large',
      },
      styleOverrides: {
        root: {
          background: surfaceLevels.s3,
          width: 'fit-content',
          textTransform: 'none',
          fontWeight: '600',
          fontSize: '0.875rem',
          borderRadius: '0.75rem',
          '& .MuiChip-label': {
            padding: '0',
          },
        },
        sizeMedium: {
          height: '1.75rem',
          borderRadius: '100rem',
          padding: '0 0.75rem',
          fontSize: '0.875rem',
          lineHeight: '1.5rem',
          '& .MuiSvgIcon-root': {
            width: '1rem',
            height: '1rem',
            marginRight: '0.25rem',
          },
        },
        sizeSmall: {
          height: '1.5rem',
          borderRadius: '100rem',
          padding: '0 0.75rem',
          fontSize: '0.6875rem',
          lineHeight: '1.5rem',
          '& .MuiSvgIcon-root': {
            width: '0.75rem',
            height: '0.75rem',
            marginRight: '0.125rem',
          },
        },
        deleteIcon: {
          width: '1.5rem',
          height: '1.5rem',
          marginLeft: '0.5rem',
          marginRight: '-0.25rem',
          color: '#8C8C8C',
          '&:hover': {
            color: '#FFFFFF',
          },
        },
        avatar: {
          width: '1.5rem',
          height: '1.5rem',
          marginLeft: '-0.25rem',
          marginRight: '0.5rem',
        },
        icon: {
          width: '1.5rem',
          height: '1.5rem',
          marginLeft: '-0.25rem',
          marginRight: '0.5rem',
          color: '#FFFFFF',
        },
        colorPrimary: {
          backgroundColor: 'hsla(193, 100%, 50%, 0.1)',
          color: 'hsla(193, 100%, 40%, 1)',
        },
      },
      variants: [
        {
          props: { size: 'large' },
          style: {
            height: '2.75rem',
            borderRadius: '0.75rem',
            padding: '0 1rem',
          },
        },
        {
          props: { size: 'extra-large' },
          style: {
            height: '3rem',
            borderRadius: '0.75rem',
            padding: '0 1rem',
          },
        },
        {
          props: { variant: 'active' },
          style: {
            border: '2px solid #00C8FF',
            color: '#00C8FF',
          },
        },
        {
          props: { color: 'inverse' },
          style: {
            background: '#FFFFFF',
            color: '#050505',
            '& .MuiSvgIcon-root': {
              color: '#050505',
            },
          },
        },
        {
          props: { variant: 'text' },
          style: {
            padding: '0 0.5rem',
            background: 'none',
            color: '#FFFFFF',
            '& .MuiSvgIcon-root': {
              color: '#FFFFFF',
            },
          },
        },
      ],
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          height: '100%',
          '& .MuiTabs-list': {
            height: '100%',
          },
          '& .MuiTabs-flexContainer': {
            height: '100%',
          },
        },
        indicator: {
          backgroundColor: '#FFFFFF',
          height: '2px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: '0 1rem',
          minWidth: '0',
          height: '100%',
          color: '#FFFFFF',
          fontWeight: '600',
          fontSize: '1rem',
          textTransform: 'none',
          disableRipple: true,
          '&.Mui-selected': {
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'medium',
        color: 'text',
      },
      styleOverrides: {
        sizeLarge: {
          width: '5rem',
          height: '3rem',
          borderRadius: '0.25rem',
        },
        sizeMedium: {
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '0.25rem',
        },
        sizeSmall: {
          width: '2rem',
          height: '2rem',
          borderRadius: '0.75rem',
        },
        colorPrimary: {
          color: '#FFFFFF',
          background: surfaceLevels.s3,
          '&:hover': {
            background: `color-mix(in srgb, ${surfaceLevels.s3} 92%, #FFFFFF 8%)`,
          },
          '&:active': {
            background: `color-mix(in srgb, ${surfaceLevels.s3} 88%, #FFFFFF 12%)`,
          },
        },
        colorSecondary: {
          color: '#FFFFFF',
          background: surfaceLevels.s3,
          '&:hover': {
            background: `color-mix(in srgb, ${surfaceLevels.s3} 92%, #FFFFFF 8%)`,
          },
          '&:active': {
            background: `color-mix(in srgb, ${surfaceLevels.s3} 88%, #FFFFFF 12%)`,
          },
        },
      },
      variants: [
        {
          props: { color: 'text' },
          style: {
            color: '#FFFFFF',
            '&:hover': {
              background: 'color-mix(in srgb, #FFFFFF 8%, transparent)',
            },
            '&:active': {
              background: 'color-mix(in srgb, #FFFFFF 12%, transparent)',
            },
          },
        },
        {
          props: { color: 'text-alt' },
          style: {
            color: '#8C8C8C',
            '&:hover': {
              background: 'color-mix(in srgb, #FFFFFF 8%, transparent)',
              color: '#FFFFFF',
            },
            '&:active': {
              background: 'color-mix(in srgb, #FFFFFF 12%, transparent)',
              color: '#FFFFFF',
            },
          },
        },
        {
          props: { size: 'small', color: 'secondary' },
          style: {
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem',
            },
          },
        },
      ],
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          border: '1px solid #252525 !important',
          '& .MuiSvgIcon-root': {
            color: '#8C8C8C',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiButtonBase-root': {
            color: '#8C8C8C',
            height: '2rem',
            width: '2rem',
            marginRight: '-0.375rem',
          },
          '& .MuiInputBase-root': {
            borderRadius: '0.5rem',
          },
          '& .MuiInputBase-input': {
            height: '3rem',
            padding: '0 1rem',
            fontWeight: 'Medium',
            fontSize: '1rem',
            color: '#FFFFFF',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: '1px solid #252525',
          },
          '& input::placeholder': {
            color: '#8C8C8C',
          },
          '& input[type="password"]': {
            fontFamily: 'monospace',
            letterSpacing: '0.25rem',
            '&::placeholder': {
              letterSpacing: '0.25%',
              fontFamily: [
                '"Google Sans"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif',
              ].join(','),
            },
          },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: '#8C8C8C',
        },
      },
    },
    MuiSkeleton: {
      defaultProps: {
        animation: 'wave',
      },
      styleOverrides: {
        root: {
          backgroundColor: surfaceLevels.s3,
        },
        wave: {
          '&::after': {
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.5, 1)',
          },
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        TransitionComponent: ZoomTransition,
      },
      styleOverrides: {
        root: {
          '& .MuiDialog-paper': {
            borderRadius: '1.5rem',
            background: surfaceLevels.s1,
            backgroundImage: 'none',
            // width: '25rem',
            maxWidth: '25rem',
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '2rem 1rem 0.25rem',
          textAlign: 'center',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '1rem',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '1rem',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            padding: '0 0 0 1rem',
            '& .MuiAutocomplete-input': {
              padding: '0',
            },
          },
          '& .MuiButtonBase-root': {
            width: '2rem',
            height: '2rem',
            marginRight: '0',
          },
          '& .MuiButtonBase-root:last-child': {
            color: '#8C8C8C',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          '& .MuiMenu-paper': {
            borderRadius: '0.75rem',
            background: surfaceLevels.s2,
            backgroundImage: 'none',
            width: '25rem',
            marginTop: '0.375rem',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '0.5rem 4.25rem 0.5rem 1.5rem',
        },
      },
    },
    MuiListItemSecondaryAction: {
      styleOverrides: {
        root: {
          right: '1.5rem',
          color: '#FFFFFF',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          padding: '0 0.25rem',
          width: 'fit-content',
          height: 'fit-content',
          minWidth: '0.875rem',
          minHeight: '0.875rem',
          lineHeight: '0.875rem',
          fontSize: '0.6875rem',
          fontWeight: 'bold',
        },
      },
    },
    MuiAlert: {
      defaultProps: {
        iconMapping: {
          success: <Check />,
        },
      },
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          alignItems: 'center',
          fontSize: '0.75rem',
          lineHeight: '1.15rem',
          letterSpacing: '0.1%',
          fontWeight: 'medium',
        },
        action: {
          padding: '0 0 0 1rem',
        },
      },
      variants: [
        {
          props: { size: 'small' },
          style: {
            padding: '0 1rem',
            marginBottom: '-1rem',
          },
        },
        {
          props: { align: 'center' },
          style: {
            justifyContent: 'center',
            '& .MuiAlert-message': {
              textAlign: 'center',
            },
          },
        },
      ],
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: '0.375rem',
          '& .MuiSwitch-track': {
            borderRadius: '100rem',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#252525',
        },
      },
    },
  },
});
