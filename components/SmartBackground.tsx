
import React from 'react';
import Background4K from './ui/Background4K';
import { AppMode } from '../types';

interface SmartBackgroundProps {
  mode: AppMode;
}

const SmartBackground: React.FC<SmartBackgroundProps> = ({ mode }) => {
  return <Background4K mode={mode} />;
};

export default SmartBackground;
