// Adaptive WebRTC call management hook
// Provides: localStream, remoteStream, isAudioOnly, metrics, start(), end(), toggleMute(), toggleCamera()
// Auto-downgrades to audio-only if outbound bitrate or packet loss sustained below thresholds.
import { useCallback, useEffect, useRef, useState } from 'react';

// Simple in-memory signaling fallback (for demo only). In production replace with WebSocket / SFU.
const globalSignal = typeof window !== 'undefined' ? (window.__HELIO_SIGNAL__ ||= {}) : {};

export function useAdaptiveCall({ callId, wantVideo = true }) {
  const pcRef = useRef(null);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const downgradeRef = useRef(false);
  const intervalRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioOnly, setIsAudioOnly] = useState(!wantVideo);
  const [metrics, setMetrics] = useState({ bitrateKbps: 0, packetLoss: 0, framesPerSecond: 0 });
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(wantVideo);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    pcRef.current?.getSenders().forEach(s => s.track && s.track.stop());
    pcRef.current?.close();
    pcRef.current = null;
    localRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const createPc = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
    });
    pc.ontrack = (e) => {
      if (!remoteRef.current) {
        const rs = new MediaStream();
        remoteRef.current = rs;
        setRemoteStream(rs);
      }
      e.streams[0].getTracks().forEach(t => remoteRef.current.addTrack(t));
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        const arr = (globalSignal[callId] ||= []);
        arr.push({ type: 'candidate', candidate: e.candidate });
      }
    };
    return pc;
  }, [callId]);

  const applySignal = useCallback(async () => {
    const queue = globalSignal[callId] || [];
    while (queue.length) {
      const msg = queue.shift();
      if (!pcRef.current) return;
      if (msg.type === 'offer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        (globalSignal[callId] ||= []).push({ type: 'answer', answer });
      } else if (msg.type === 'answer') {
        if (!pcRef.current.currentRemoteDescription) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.answer));
        }
      } else if (msg.type === 'candidate') {
        try { await pcRef.current.addIceCandidate(msg.candidate); } catch { /* ignore */ }
      }
    }
  }, [callId]);

  const monitor = useCallback(() => {
    if (!pcRef.current) return;
    intervalRef.current = setInterval(async () => {
      try {
        const stats = await pcRef.current.getStats();
        let bytesNow = 0, bytesPrev = monitor._bytesPrev || 0, tsPrev = monitor._tsPrev || 0;
        let packetsLost = 0, packetsTotal = 0, fps = 0;
        const tsNow = Date.now();
        stats.forEach(report => {
          if (report.type === 'outbound-rtp' && !report.isRemote) {
            if (report.mediaType === 'video' || report.kind === 'video') {
              bytesNow += report.bytesSent || 0;
              if (report.framesPerSecond) fps = report.framesPerSecond;
            } else if (report.mediaType === 'audio' || report.kind === 'audio') {
              bytesNow += report.bytesSent || 0;
            }
            packetsLost += report.packetsLost || 0;
            packetsTotal += report.packetsSent || 0;
          }
        });
        const deltaBytes = bytesNow - bytesPrev;
        const deltaTime = tsPrev ? (tsNow - tsPrev) / 1000 : 1;
        const bitrateKbps = deltaTime > 0 ? Math.round((deltaBytes * 8) / 1000 / deltaTime) : 0;
        const packetLoss = packetsTotal > 0 ? +(packetsLost / packetsTotal * 100).toFixed(1) : 0;
        setMetrics({ bitrateKbps, packetLoss, framesPerSecond: fps });
        monitor._bytesPrev = bytesNow; monitor._tsPrev = tsNow;

        // Improved adaptive logic:
        // 1. Ignore first 20s (warm-up) to prevent premature downgrade.
        // 2. Require some outbound activity (packets or fps) before judging quality.
        // 3. Require remote stream presence (handshake complete) before downgrade.
        if (!downgradeRef.current || typeof downgradeRef.current !== 'object') {
          downgradeRef.current = { streak: 0, start: Date.now() };
        } else if (!downgradeRef.current.start) {
          downgradeRef.current.start = Date.now();
        }
        const elapsed = Date.now() - downgradeRef.current.start;
        const remoteReady = !!remoteRef.current; // basic indicator remote side answered
        const activeVideoStats = (packetsTotal > 0 || fps > 0);
        const poor = activeVideoStats && (bitrateKbps < 150 || packetLoss > 8);
        const eligible = elapsed > 20000 && remoteReady;

        if (eligible && poor && !isAudioOnly && cameraOn) {
          downgradeRef.current.streak++;
          if (downgradeRef.current.streak >= 5) {
            pcRef.current.getSenders().forEach(s => {
              if (s.track && s.track.kind === 'video') s.track.stop();
            });
            setIsAudioOnly(true);
            setCameraOn(false);
          }
        } else if (!poor) {
          // Reset streak when conditions improve or not yet active
          downgradeRef.current.streak = 0;
        }
      } catch {/* ignore stats errors */}
    }, 2000);
  }, [cameraOn, isAudioOnly]);

  const start = useCallback(async () => {
    if (pcRef.current) return;
    pcRef.current = createPc();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: wantVideo });
      localRef.current = stream; setLocalStream(stream);
      stream.getTracks().forEach(t => pcRef.current.addTrack(t, stream));
    } catch (e) {
      // Fallback to audio only
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localRef.current = stream; setLocalStream(stream); setIsAudioOnly(true); setCameraOn(false);
        stream.getTracks().forEach(t => pcRef.current.addTrack(t, stream));
      } catch(err) { console.error('Media init failed', err); }
    }
    // Offer side always (first caller). In real app coordinate roles.
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    (globalSignal[callId] ||= []).push({ type: 'offer', offer });
    monitor();
  }, [callId, createPc, monitor, wantVideo]);

  const pollSignal = useCallback(() => {
    const id = setInterval(applySignal, 1000);
    return () => clearInterval(id);
  }, [applySignal]);

  const end = useCallback(() => { cleanup(); }, [cleanup]);

  const toggleMute = useCallback(() => {
    if (!localRef.current) return; setMuted(m => !m);
    localRef.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
  }, []);
  const toggleCamera = useCallback(async () => {
    if (!localRef.current) return;
    const videoTracks = localRef.current.getVideoTracks();
    if (videoTracks.length) {
      const enabled = videoTracks[0].enabled;
      videoTracks[0].enabled = !enabled;
      setCameraOn(!enabled);
      if (!enabled) setIsAudioOnly(false); // camera turning back on
      return;
    }
    // No video track (likely after downgrade) – attempt to reacquire
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      if (track) {
        localRef.current.addTrack(track);
        try { pcRef.current?.addTrack(track, localRef.current); } catch { /* ignore */ }
        setCameraOn(true);
        setIsAudioOnly(false);
      }
    } catch (e) {
      // silently fail (permissions or device issue)
    }
  }, []);

  useEffect(() => {
    const stop = pollSignal();
    return () => { stop(); cleanup(); };
  }, [pollSignal, cleanup]);

  return { localStream, remoteStream, isAudioOnly, metrics, start, end, toggleMute, toggleCamera, muted, cameraOn };
}

export default useAdaptiveCall;