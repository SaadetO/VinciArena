import { Add, Remove } from '@mui/icons-material';
import { IconButton, TextField, styled } from '@mui/material';
import { theme } from '../../../themes';

const StyledNumericTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    padding: 0,
    backgroundColor: theme.palette.background.s3,
    borderRadius: '0.75rem',
  },
  '& .MuiInputBase-input': {
    padding: '0 1rem',
    height: '2.75rem',
    boxSizing: 'border-box',
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '&[type=number]': {
      MozAppearance: 'textfield',
    },
  },
  '& .MuiInputAdornment-root': {
    height: '2.75rem',
    maxHeight: 'none',
    margin: 0,
  },
  '& .MuiButtonBase-root': {
    margin: '0 !important',
  },
}));

const AdornmentButton = styled(IconButton)(
  ({ position }: { position: 'start' | 'end' }) => ({
    minHeight: '2.75rem',
    minWidth: '2.75rem',
    flexShrink: 0,
    borderRadius:
      position === 'start' ? '0.75rem 0 0 0.75rem' : '0 0.75rem 0.75rem 0',
    borderRight:
      position === 'start' ? `1px solid ${theme.palette.divider}` : 'none',
    borderLeft:
      position === 'end' ? `1px solid ${theme.palette.divider}` : 'none',
  }),
);

interface NumericTextFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  fullWidth?: boolean;
}

export const NumericTextField = ({
  value,
  onChange,
  min = 2,
  max,
  placeholder,
  fullWidth = true,
}: NumericTextFieldProps) => {
  const handleIncrement = () => {
    const newVal = value + 1;
    if (max !== undefined && newVal > max) return;
    onChange(newVal);
  };

  const handleDecrement = () => {
    const newVal = value - 1;
    if (newVal < min) return;
    onChange(newVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isNaN(val)) return; // Allow empty typing for now or handle later
    onChange(Math.max(min, max !== undefined ? Math.min(max, val) : val));
  };

  return (
    <StyledNumericTextField
      fullWidth={fullWidth}
      value={value || ''}
      onChange={handleInputChange}
      placeholder={placeholder}
      type="number"
      slotProps={{
        input: {
          startAdornment: (
            <AdornmentButton
              onClick={handleDecrement}
              disabled={value <= min}
              position="start"
            >
              <Remove fontSize="small" />
            </AdornmentButton>
          ),
          endAdornment: (
            <AdornmentButton
              onClick={handleIncrement}
              disabled={max !== undefined && value >= max}
              position="end"
            >
              <Add fontSize="small" />
            </AdornmentButton>
          ),
        },
      }}
    />
  );
};
