import { Button } from "@mui/material"

interface TournamentTabProps {
  selected: 'past' | 'current' | 'future';
  setSelected: (selected: 'past' | 'current' | 'future') => void;
  label: string;
  value: 'past' | 'current' | 'future';
}

export const TournamentTab = ({ selected, setSelected, label, value }: TournamentTabProps) => {
  return (
    <Button
      data-value={value}
      size="large"
      sx={{
        color: selected === value ? 'text.primary' : 'text.secondary',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: selected === value ? 'none' : 'auto',
        '&:hover': {
          opacity: 0.6,
          background: 'none',
        },
      }}
      onClick={() => setSelected(value)}
    >
      {label}
    </Button>
  )
}