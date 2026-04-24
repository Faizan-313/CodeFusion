import { useCallback, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import toast from "react-hot-toast";
import { useProctoring } from "../features/ai-monitoring/useProctoring.js";
import { ProctoringContext } from "./proctoringContextCore.js";

export function ProctoringProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  //  ExamSection can register a handler so AI-monitoring anomalies
  // get forwarded into the same violation pipeline as DOM-based events. If no
  // handler is registered (during calibration), we fall back to a toast.
  const anomalyHandlerRef = useRef(null);

  const { webcamRef, phase } = useProctoring({
    enabled,
    onAnomalyStart: (anomaly) => {
      if (anomalyHandlerRef.current) {
        anomalyHandlerRef.current(anomaly);
      } else {
        toast.error(anomaly.message);
      }
    },
  });

  const setAnomalyHandler = useCallback((handler) => {
    anomalyHandlerRef.current = handler ?? null;
  }, []);

  const startCalibration = useCallback(() => {
    setEnabled(true);
    setShowOverlay(true);
    setStatusMessage(null);
  }, []);

  const finishCalibration = useCallback(() => {
    setShowOverlay(false);
    setStatusMessage(null);
  }, []);

  const stop = useCallback(() => {
    setEnabled(false);
    setShowOverlay(false);
    setStatusMessage(null);
  }, []);

  // Memoize the context value so ExamSection don't re-render on every provider
  // re-render. startCalibration/finishCalibration/stop/setStatusMessage are all
  // stable, so the value only changes when phase, enabled, or showOverlay do.
  const value = useMemo(
    () => ({
      phase,
      enabled,
      isCalibrating: showOverlay,
      startCalibration,
      finishCalibration,
      stop,
      setStatusMessage,
      setAnomalyHandler,
    }),
    [phase, enabled, showOverlay, startCalibration, finishCalibration, stop, setStatusMessage, setAnomalyHandler]
  );

  return (
    <ProctoringContext.Provider value={value}>
      {children}

      {enabled && (
        showOverlay ? (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl aspect-video max-w-2xl w-full mx-4">
              <Webcam
                ref={webcamRef}
                mirrored
                audio={false}
                videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                className="w-full h-full object-cover"
              />
              <CalibrationOverlay phase={phase} statusMessage={statusMessage} />
            </div>
          </div>
        ) : (
          <div
            className="fixed bottom-4 right-4 z-40 w-48 md:w-56 rounded-lg overflow-hidden shadow-2xl border-2 border-white/80 bg-black select-none"
            style={{ pointerEvents: "none" }}
            onContextMenu={(e) => e.preventDefault()}
            aria-hidden="true"
          >
            <div className="relative aspect-video">
              <Webcam
                ref={webcamRef}
                mirrored
                audio={false}
                disablePictureInPicture
                controls={false}
                videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded text-[10px] font-semibold text-white tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </div>
            </div>
          </div>
        )
      )}
    </ProctoringContext.Provider>
  );
}

function CalibrationOverlay({ phase, statusMessage }) {
  const msg =
    statusMessage ??
    (phase === "initializing"
      ? "Loading detection models, please wait…"
      : phase === "calibrating"
      ? "Calibrating — hold still and look straight at the screen."
      : "Calibration complete. Preparing your session…");

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-3 px-6 text-center">
      <div className="w-10 h-10 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
      <p className="text-sm font-medium">{msg}</p>
    </div>
  );
}
