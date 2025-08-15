// src/Components/VideoCall.jsx
import {
    Camera,
    CameraOff,
    Maximize2,
    Mic,
    MicOff,
    Minimize2,
    MonitorUp,
    PhoneOff,
    Users,
    Wifi,
    WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./VideoCall.css";

const ICE_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Reusable tile with footer info and empty state
function VideoTile({ title, sub, children, muted = false, isOnline }) {
  return (
    <div className="vc-tile">
      {children ? (
        children
      ) : (
        <div className="vc-empty">
          {isOnline ? (
            <div className="vc-empty-status">Connecting stream…</div>
          ) : (
            <>
              <WifiOff className="vc-empty-icon" />
              <div className="vc-empty-title">Waiting for participant</div>
              <div className="vc-empty-sub">
                Ask them to open the same chat & click the call icon
              </div>
            </>
          )}
        </div>
      )}

      <div className="vc-tile-footer">
        <span className="vc-tile-title">{title}</span>
        <span className="vc-tile-dot">•</span>
        <span className="vc-tile-sub">{sub}</span>
        {muted && (
          <>
            <span className="vc-tile-dot">•</span>
            <span className="vc-tile-muted">
              <MicOff size={14} /> muted
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function VideoCall() {
  const navigate = useNavigate();
  const location = useLocation();

  // From your router state (kept same as your original)
// From your router state
  const chatName = location.state?.chatName || "Video Call";
  const chat = location.state?.chat;
  const roomId = chat?._id || "default-room"; // Correctly use the chat ID as the room ID

  // Theme
  const lightTheme = useSelector((s) => s.themeKey?.value);

  // Socket + WebRTC refs
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  // UI state
  const [participants, setParticipants] = useState(1);
  const [isRemoteOnline, setIsRemoteOnline] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [fs, setFs] = useState(false);
  const [connOk, setConnOk] = useState(false);

  // Apply theme class to root container
  const themeClass = lightTheme ? "vc-root light" : "vc-root dark";

  const iconColor = lightTheme ? "black" : "white";

  const statusBadge = useMemo(
    () =>
      connOk ? (
        <span className="vc-badge vc-badge--ok">
          <Wifi size={14} /> connected
        </span>
      ) : (
        <span className="vc-badge vc-badge--pending">
          <WifiOff size={14} /> signaling…
        </span>
      ),
    [connOk]
  );

  useEffect(() => {
      // 1) Connect socket
      const socket = io("https://chat-world-backend-9ihy.onrender.com", { transports: ["websocket"] });
      socketRef.current = socket;

      // 2) Start local media & join room
      startLocalStream().then(() => {
        socket.emit("join-call", { roomId });
      });
      
      // Existing users -> we create offer to each
      socket.on("existing-users", async (users) => {
        setParticipants(users.length + 1);
        setIsRemoteOnline(users.length > 0);
        for (const uid of users) {
          await createPeerAndOffer(uid);
        }
      });

      // Someone new joins later (they will offer to you)
      socket.on("user-joined", (_userId, count) => {
        setParticipants(count);
        setIsRemoteOnline(true);
      });

      // Offer received -> we answer
      socket.on("offer", async ({ offer, from }) => {
        await ensurePeer(from);
        await peerRef.current.setRemoteDescription(offer);
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit("answer", { answer, to: from });
      });

      // Answer received -> set remote description
      socket.on("answer", async ({ answer }) => {
        if (peerRef.current) {
          await peerRef.current.setRemoteDescription(answer);
          setConnOk(true);
        }
      });

      // ICE candidates
      socket.on("ice-candidate", async ({ candidate }) => {
        try {
          if (peerRef.current && candidate) {
            await peerRef.current.addIceCandidate(candidate);
          }
        } catch {
          // ignore duplicates
        }
      });

      // User left
      socket.on("user-left", (count) => {
        setParticipants(Math.max(1, count));
        setIsRemoteOnline(count > 1);
        teardownRemote();
      });

      // Live participants count pushes
      socket.on("participants-update", (count) => {
        setParticipants(count);
        setIsRemoteOnline(count > 1);
      });
    // Cleanup on unmount
    return () => {
      leaveCall(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // --- Media & WebRTC helpers ---
  const startLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  };

  const ensurePeer = async (otherId) => {
    if (peerRef.current) return peerRef.current;
    const pc = new RTCPeerConnection(ICE_CONFIG);
    peerRef.current = pc;

    // local -> peer
    localStreamRef.current
      ?.getTracks()
      .forEach((t) => pc.addTrack(t, localStreamRef.current));

    // remote -> attach
    pc.ontrack = (e) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      e.streams[0].getTracks().forEach((t) => {
        remoteStreamRef.current.addTrack(t);
      });
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
    };

    // ICE -> send to other
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socketRef.current.emit("ice-candidate", { candidate, to: otherId });
      }
    };

    pc.onconnectionstatechange = () => {
      setConnOk(["connected", "completed"].includes(pc.connectionState));
    };

    return pc;
  };

  const createPeerAndOffer = async (otherId) => {
    const pc = await ensurePeer(otherId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current.emit("offer", { offer, to: otherId });
  };

  const teardownRemote = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }
    if (peerRef.current) {
      try {
        peerRef.current.getSenders().forEach((s) => s.track?.stop?.());
        peerRef.current.close();
      } catch {}
      peerRef.current = null;
    }
    setConnOk(false);
  };

  // --- Controls ---
  const leaveCall = (goBack = true) => {
    try {
      socketRef.current?.emit("leave-call", { roomId });
    } catch {}
    teardownRemote();

    // stop local media
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    try {
      socketRef.current?.disconnect();
    } catch {}

    if (goBack) navigate(-1);
  };

  const toggleMic = () => {
    const t = localStreamRef.current?.getAudioTracks?.()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setMicOn(t.enabled);
  };

  const toggleCam = () => {
    const t = localStreamRef.current?.getVideoTracks?.()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setCamOn(t.enabled);
  };

  const toggleScreenShare = async () => {
    if (!sharing) {
      try {
        const display = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        const screenTrack = display.getVideoTracks()[0];

        // replace sender track
        const sender = peerRef.current
          ?.getSenders()
          .find((s) => s.track?.kind === "video");
        sender?.replaceTrack(screenTrack);

        // show shared screen in local tile
        if (localVideoRef.current) localVideoRef.current.srcObject = display;

        setSharing(true);
        screenTrack.onended = () => stopScreenShare();
      } catch {
        // user canceled
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (!sharing) return;

    // stop display stream
    const ds = localVideoRef.current?.srcObject;
    if (ds && "getTracks" in ds) {
      ds.getTracks().forEach((t) => t.stop());
    }

    // switch back to camera
    if (localStreamRef.current) {
      const camTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = peerRef.current
        ?.getSenders()
        .find((s) => s.track?.kind === "video");
      sender?.replaceTrack(camTrack);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }

    setSharing(false);
  };

  const toggleFullscreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setFs(true);
    } else {
      document.exitFullscreen?.();
      setFs(false);
    }
  };

  return (
    <div className={themeClass}>
      {/* Top Bar */}
      <header className="vc-topbar">
        <div className="vc-topbar-left">
          <div className="vc-room-icon" />
          <div className="vc-room-text">
            <div className="vc-room-name">{chatName}</div>
            <div className="vc-room-sub">Room: {roomId}</div>
          </div>
        </div>

        <div className="vc-topbar-right">
          {statusBadge}
          <span className="vc-chip">
            <Users size={14} /> {participants}
          </span>
        </div>
      </header>

      {/* Stage */}
      <main className="vc-stage">
        <div className="vc-grid">
          {/* Local */}
          <VideoTile
            title="You"
            sub={camOn ? (micOn ? "camera • mic on" : "camera") : "camera off"}
            muted={!micOn}
            isOnline
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="vc-video"
            />
          </VideoTile>

          {/* Remote */}
          <VideoTile
            title="Participant"
            sub={isRemoteOnline ? (connOk ? "online" : "connecting…") : "offline"}
            isOnline={isRemoteOnline}
          >
            {isRemoteOnline && (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="vc-video"
              />
            )}
          </VideoTile>
        </div>
      </main>

      {/* Controls */}
      <div className="vc-controls-wrap">
        <div className="vc-controls">
          <button
            onClick={toggleMic}
            className={`vc-btn ${micOn ? "" : "is-off"}`}
            title={micOn ? "Mute microphone" : "Unmute microphone"}
            aria-label="Toggle microphone"
          >
            {micOn ? <Mic size={20} color={iconColor}/> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleCam}
            className={`vc-btn ${camOn ? "" : "is-off"}`}
            title={camOn ? "Turn off camera" : "Turn on camera"}
            aria-label="Toggle camera"
          >
            {camOn ? <Camera size={20} color={iconColor} /> : <CameraOff size={20} />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`vc-btn ${sharing ? "is-active" : ""}`}
            title={sharing ? "Stop sharing" : "Share screen"}
            aria-label="Toggle screen share"
          >
            <MonitorUp size={20} color={iconColor} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="vc-btn"
            title={fs ? "Exit full screen" : "Enter full screen"}
            aria-label="Toggle fullscreen"
          >
            {fs ? <Minimize2 size={20} color={iconColor} /> : <Maximize2 size={20} color={iconColor} />}
          </button>

          <button
            onClick={() => leaveCall(true)}
            className="vc-btn vc-btn--danger"
            title="Leave call"
            aria-label="Leave call"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
