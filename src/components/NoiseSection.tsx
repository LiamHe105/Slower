/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { audioManager } from '../lib/audioManager';
import { NOISE_OPTIONS } from '../lib/constants';
import LucideIcon from './LucideIcon';
import { ColorTheme } from '../types';

interface NoiseSectionProps {
  theme: ColorTheme;
}

export default function NoiseSection({ theme }: NoiseSectionProps) {
  const [activeNoise, setActiveNoise] = useState<string | null>(audioManager.getType());
  const [isPlaying, setIsPlaying] = useState<boolean>(audioManager.getIsPlaying());
  const [volume, setVolume] = useState<number>(0.5);
  const [bars, setBars] = useState<number[]>(new Array(8).fill(2));
  
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    // Sync settings initially
    audioManager.setVolume(volume);
    setActiveNoise(audioManager.getType());
    setIsPlaying(audioManager.getIsPlaying());

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Set up analyzer monitoring loop when playing
  useEffect(() => {
    if (isPlaying) {
      analyserRef.current = audioManager.getAnalyser();
      
      const updateVisuals = () => {
        if (!analyserRef.current) return;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Map subset of frequencies to 8 bars
        const nextBars: number[] = [];
        for (let i = 0; i < 8; i++) {
          const sampleIndex = Math.floor((i / 8) * (bufferLength / 2));
          const val = dataArray[sampleIndex] || 0;
          // Scale value to height percentage [4px to 32px]
          const height = Math.max(4, Math.round((val / 255) * 32));
          nextBars.push(height);
        }
        setBars(nextBars);
        animationRef.current = requestAnimationFrame(updateVisuals);
      };

      animationRef.current = requestAnimationFrame(updateVisuals);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setBars(new Array(8).fill(3));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, activeNoise]);

  const handleToggleNoise = (type: 'rain' | 'cafe' | 'forest' | 'ocean' | 'white_noise') => {
    if (activeNoise === type && isPlaying) {
      // Pause
      audioManager.stop();
      setIsPlaying(false);
      setActiveNoise(null);
    } else {
      // Play
      audioManager.play(type);
      audioManager.setVolume(volume);
      setActiveNoise(type);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = parseFloat(e.target.value);
    setVolume(nextVolume);
    audioManager.setVolume(nextVolume);
  };

  const handleStopAll = () => {
    audioManager.stop();
    setIsPlaying(false);
    setActiveNoise(null);
  };

  return (
    <div 
      id="noise-ambient" 
      className="glass-panel rounded-2xl border p-5 shadow-mac-card h-full flex flex-col transition-all duration-300"
      style={{
        backgroundColor: theme.bgCard,
        borderColor: theme.borderThemed
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 
            className="font-display font-bold text-sm tracking-tight flex items-center gap-1.5"
            style={{ color: theme.textDarkThemed }}
          >
            <LucideIcon name="Music" className="opacity-75" size={18} />
            白噪音环境声
          </h3>
          <p 
            className="text-xs mt-0.5"
            style={{ color: theme.textMutedThemed }}
          >
            专注时的环境原声遮噪
          </p>
        </div>

        {/* Dynamic Equalizer Visualizer */}
        <div 
          className="flex items-end gap-0.5 h-8 px-2 py-1 rounded-lg border transition-all"
          style={{
            backgroundColor: theme.bgLightGrey,
            borderColor: theme.borderThemed
          }}
        >
          {bars.map((height, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-75"
              style={{
                height: `${height}px`,
                backgroundColor: isPlaying ? theme.primary : '#94a3b8',
                opacity: isPlaying ? 0.85 : 0.4
              }}
            />
          ))}
        </div>
      </div>

      {/* Noise presets grid */}
      <div className="grid grid-cols-1 gap-2.5 flex-1 overflow-y-auto max-h-[290px] pr-1">
        {NOISE_OPTIONS.map((noise) => {
          const isActive = activeNoise === noise.id && isPlaying;
          return (
            <button
              id={`noise-button-${noise.id}`}
              key={noise.id}
              onClick={() => handleToggleNoise(noise.id as any)}
              className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-250 cursor-pointer"
              style={{
                backgroundColor: isActive ? theme.primary : theme.bgCard,
                borderColor: isActive ? 'transparent' : theme.borderThemed,
                color: isActive ? '#ffffff' : theme.textDarkThemed
              }}
            >
              <div
                className="p-2 rounded-lg transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : theme.bgLightGrey,
                  color: isActive ? '#ffffff' : theme.primary
                }}
              >
                <LucideIcon name={noise.icon} size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-tight truncate">
                    {noise.name}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-mono py-0.5 px-1.5 rounded-full bg-white/20 text-white font-medium uppercase tracking-wider pulsing-glow">
                      播放中
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-0.5 truncate transition-all font-medium"
                  style={{
                    color: isActive ? 'rgba(255, 255, 255, 0.85)' : theme.textMutedThemed
                  }}
                >
                  {noise.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Playback Controls */}
      <div 
        className="mt-4 pt-3 border-t flex flex-col gap-3 transition-all"
        style={{ borderTopColor: theme.borderThemed }}
      >
        <div className="flex items-center gap-3">
          <button
            id="noise-control-voice-btn"
            onClick={handleStopAll}
            disabled={!isPlaying}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              isPlaying
                ? 'hover:bg-slate-100 cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: theme.bgLightGrey,
              borderColor: theme.borderThemed,
              color: isPlaying ? theme.textDarkThemed : '#cbd5e1'
            }}
          >
            <LucideIcon name="VolumeX" size={14} />
            全部静音
          </button>

          <div className="flex-1 flex items-center gap-2">
            <span className="opacity-60 flex items-center" style={{ color: theme.textMutedThemed }}>
              <LucideIcon name={volume === 0 ? "VolumeX" : "Volume1"} size={14} />
            </span>
            <input
              id="noise-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: theme.primary
              }}
            />
            <span 
              className="text-[10px] font-mono w-6 text-right font-medium"
              style={{ color: theme.textMutedThemed }}
            >
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
