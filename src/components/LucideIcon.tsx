/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Palette,
  Coffee,
  Sliders,
  Check,
  Trash2,
  Edit2,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Music,
  VolumeX,
  Volume2,
  Calendar,
  BarChart3,
  CheckCircle2,
  Clock,
  Award,
  Flame,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Waves,
  Wind,
  Volume1,
  Settings,
  X,
  Sparkles,
  Trophy,
  Moon,
  Info
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  GraduationCap,
  Briefcase,
  BookOpen,
  Palette,
  Coffee,
  Sliders,
  Check,
  Trash2,
  Edit2,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Music,
  VolumeX,
  Volume2,
  Calendar,
  BarChart3,
  CheckCircle2,
  Clock,
  Award,
  Flame,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Waves,
  Wind,
  Volume1,
  Settings,
  X,
  Sparkles,
  Trophy,
  Moon,
  Info
};

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function LucideIcon({ name, className = '', size = 20 }: LucideIconProps) {
  const IconComponent = iconMap[name] || Info;
  return <IconComponent className={className} size={size} />;
}
