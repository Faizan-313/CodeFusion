// Pre-flight check that verifies the user's device has a usable camera AND that the user grants permission. 
export async function checkCamera() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia){
        return {
            ok: false,
            code: "unsupported",
            reason:
                "This browser does not support camera access. Please use a recent version of Chrome, Edge, or Firefox.",
        };
    }

    // Secure-context guard: getUserMedia only works on HTTPS or localhost.
    if (typeof window !== "undefined" && window.isSecureContext === false) {
        return {
            ok: false,
            code: "insecure_context",
            reason:
                "Camera access requires HTTPS. Please open this site over a secure connection.",
        };
    }

  //confirm at least one video input exists. 
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some((d) => d.kind === "videoinput");
        if (!hasVideoInput) {
            return {
                ok: false,
                code: "no_device",
                reason:
                "No camera was found on this device. Please connect a webcam and try again.",
            };
        }
    } catch { /* enumerateDevices failing isn't fatal — we'll still try getUserMedia below. */ }

    // request access.
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false,
        });
    } catch (err) {
        const name = err?.name || "";
        if (name === "NotAllowedError" || name === "SecurityError") {
            return {
                ok: false,
                code: "permission_denied",
                reason:
                "Camera permission was denied. Please allow camera access in your browser settings and try again.",
            };
        }
        if (name === "NotFoundError" || name === "OverconstrainedError") {
            return {
                ok: false,
                code: "no_device",
                reason:
                "No camera was found on this device. Please connect a webcam and try again.",
            };
        }
        if (name === "NotReadableError" || name === "TrackStartError") {
            return {
                ok: false,
                code: "in_use",
                reason:
                "The camera is currently being used by another application. Close it and try again.",
            };
        }
        return {
            ok: false,
            code: "unknown",
            reason: `Could not access the camera: ${err?.message || name || "unknown error"}.`,
        };
    } finally {
        // release the stream — the proctoring component will open its own.
        if (stream) stream.getTracks().forEach((t) => t.stop());
    }

    return { ok: true };
}
