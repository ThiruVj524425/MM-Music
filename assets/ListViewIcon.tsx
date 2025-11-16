import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface ListViewIconProps {
  size?: number;
  color?: string;
}

const ListViewIcon: React.FC<ListViewIconProps> = ({ size = 24, color = '#000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="2" rx="1" fill={color} />
      <Rect x="3" y="11" width="18" height="2" rx="1" fill={color} />
      <Rect x="3" y="17" width="18" height="2" rx="1" fill={color} />
    </Svg>
  );
};

export default ListViewIcon;
