import { Zoom } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { forwardRef, ReactElement, Ref } from 'react';

export const ZoomTransition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>,
) {
  return (
    <Zoom
      easing={{
        enter: 'cubic-bezier(0.16, 1.0, 0.3, 1.0)',
        exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
      }}
      ref={ref}
      {...props}
    />
  );
});
