import { CloseRounded } from '@mui/icons-material';
import { createTheme } from '@mui/material/styles';

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
    divider: '#303030',
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
      fontWeight: 'bold',
    },
    h2: {
      fontSize: '1.5rem',
      lineHeight: '2rem',
      letterSpacing: '0',
      fontWeight: 'bold',
    },
    h3: {
      fontSize: '1.375rem',
      lineHeight: '1.75rem',
      letterSpacing: '0',
      fontWeight: 'bold',
    },
    h4: {
      fontSize: '1.125rem',
      lineHeight: '1.5rem',
      letterSpacing: '0.15%',
      fontWeight: 'bold',
    },
    h5: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      letterSpacing: '0.1%',
      fontWeight: 'bold',
    },
    h6: {
      fontSize: '0.6875rem',
      lineHeight: '1rem',
      letterSpacing: '0.5%',
      fontWeight: 'bold',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      letterSpacing: '0.25%',
      fontWeight: 'normal',
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          textTransform: 'uppercase',
          fontWeight: 'Bold',
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
          backgroundColor: '#262626',
          color: '#FFFFFF',
          '&:hover': {
            background: 'color-mix(in srgb, #262626 92%, #FFFFFF 8%)',
          },
          '&:active': {
            background: 'color-mix(in srgb, #262626 88%, #FFFFFF 12%)',
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
          textTransform: 'uppercase',
          fontWeight: 'Bold',
          fontSize: '0.875rem',
          borderRadius: '0.25rem',
          '& .MuiChip-label': {
            padding: '0',
          },
        },
        sizeMedium: {
          height: '1.5rem',
          borderRadius: '100rem',
          padding: '0 0.75rem',
          fontSize: '0.6875rem',
          lineHeight: '1rem',
          '& .MuiSvgIcon-root': {
            width: '1rem',
            height: '1rem',
            marginRight: '0.25rem',
          },
        },
        sizeSmall: {
          height: '1.25rem',
          borderRadius: '100rem',
          padding: '0 0.5rem',
          fontSize: '0.5625rem',
          letterSpacing: '0.5%',
          lineHeight: '0.625rem',
          fontWeight: 'Bold',
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
      },
      variants: [
        {
          props: { size: 'large' },
          style: {
            height: '2.75rem',
            borderRadius: '0.25rem',
            padding: '0 1rem',
          },
        },
        {
          props: { variant: 'active' },
          style: {
            border: '1px solid #00C8FF',
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
          fontWeight: 'bold',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
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
        colorPrimary: {
          color: '#FFFFFF',
          background: '#262626',
          '&:hover': {
            background: 'color-mix(in srgb, #262626 92%, #FFFFFF 8%)',
          },
          '&:active': {
            background: 'color-mix(in srgb, #262626 88%, #FFFFFF 12%)',
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
      ],
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            background: '#262626',
            border: '1px solid #303030',
            paddingLeft: '0.75rem',
          },
          '& input': {
            height: '2.75rem',
            padding: '0 0.75rem 0 0',
            fontWeight: 'Medium',
            fontSize: '1rem',
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
  },
});
