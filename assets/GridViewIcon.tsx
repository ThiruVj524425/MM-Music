import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface GridViewIconProps {
  size?: number;
  color?: string;
}

const GridViewIcon: React.FC<GridViewIconProps> = ({ size = 24, color = '#000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" fill={color} />
      <Rect x="14" y="3" width="7" height="7" rx="1" fill={color} />
      <Rect x="3" y="14" width="7" height="7" rx="1" fill={color} />
      <Rect x="14" y="14" width="7" height="7" rx="1" fill={color} />
    </Svg>
  );
};

export default GridViewIcon;
