import MuiGrid from '@mui/material/Grid';
import type { GridProps as MuiGridProps } from '@mui/material/Grid';

type BreakpointSize = 'auto' | 'grow' | number | false | undefined;

type LegacyGridProps = Omit<MuiGridProps, 'size'> & {
  item?: boolean;
  xs?: BreakpointSize;
  sm?: BreakpointSize;
  md?: BreakpointSize;
  lg?: BreakpointSize;
  xl?: BreakpointSize;
  size?: MuiGridProps['size'];
};

export default function Grid(props: LegacyGridProps) {
  const { xs, sm, md, lg, xl, size, ...rest } = props;
  delete (rest as { item?: boolean }).item;

  const mappedSize =
    size ??
    (xs !== undefined ||
    sm !== undefined ||
    md !== undefined ||
    lg !== undefined ||
    xl !== undefined
      ? { xs, sm, md, lg, xl }
      : undefined);

  return <MuiGrid size={mappedSize} {...rest} />;
}

export { Grid };
