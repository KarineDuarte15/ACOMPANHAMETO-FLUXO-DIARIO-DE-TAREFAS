import React, { useEffect, useState, useRef } from 'react';
import { Execution, Activity } from '../types';

interface SchedulerAlertsProps {
  executions: Execution[];
  activities: Activity[];
  soundEnabled: boolean;
  onTriggerAlert: (execution: Execution, activity: Activity) => void;
  alertOffsetMinutes: number; // offset to trigger before or after schedule
}

export const SchedulerAlerts: React.FC<SchedulerAlertsProps> = ({
  executions,
  activities,
  soundEnabled,
  onTriggerAlert,
  alertOffsetMinutes
}) => {
  const [alertedIds, setAlertedIds] = useState<string[]>([]);
  const alertedIdsRef = useRef<string[]>([]);

  // Synchronize ref to prevent stale closures
  useEffect(() => {
    alertedIdsRef.current = alertedIds;
  }, [alertedIds]);

  // Audio synthesizer beep helper (Web Audio API)
  const playAlertChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Play a beautiful dual-tone chime (corporate notification style)
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880.00, now + 0.15); // A5
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(293.66, now); // D4
      osc2.frequency.setValueAtTime(440.00, now + 0.15); // A4
      
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Web Audio API not allowed or supported yet:', e);
    }
  };

  useEffect(() => {
    // Poller to check time every 5 seconds
    const checkSchedule = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      executions.forEach((exec) => {
        if (exec.status !== 'PENDENTE') return;

        // Apply alertOffsetMinutes
        // For simplicity, trigger exactly on schedule matching
        if (exec.scheduledTime === currentTimeString) {
          const uniqueId = `${exec.id}-${currentTimeString}`;
          
          if (!alertedIdsRef.current.includes(uniqueId)) {
            const act = activities.find((a) => a.id === exec.activityId);
            if (act) {
              setAlertedIds((prev) => [...prev, uniqueId]);
              playAlertChime();
              onTriggerAlert(exec, act);
              
              // Alter page title
              document.title = `🔴 [${exec.scheduledTime}] - Rotina Pendente | Rotina Inteligente`;
            }
          }
        }
      });
    };

    // Check immediately and then set interval
    checkSchedule();
    const interval = setInterval(checkSchedule, 5000);

    return () => clearInterval(interval);
  }, [executions, activities, onTriggerAlert, alertOffsetMinutes]);

  return null; // Silent background element
};
export default SchedulerAlerts;
