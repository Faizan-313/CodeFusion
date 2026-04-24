/*
  Lazy-loads the MediaPipe FaceMesh CDN bundle on demand.
  The loader is idempotent and cached — calling it multiple times
  returns the same promise, and once `window.FaceMesh` exists it
  resolves immediately without re-injecting anything.
*/

const FACE_MESH_SRC = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";

let loadPromise = null;

export function loadFaceMesh() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("FaceMesh can only be loaded in a browser"));
  }
  if (window.FaceMesh) return Promise.resolve(window.FaceMesh);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // If a script tag for the same src already exists reuse it.
    const existing = document.querySelector(`script[src="${FACE_MESH_SRC}"]`);
    const script = existing || document.createElement("script");

    const onLoad = () => {
      if (window.FaceMesh) {
        resolve(window.FaceMesh);
      } else {
        reject(
          new Error(
            "MediaPipe FaceMesh script loaded but window.FaceMesh is undefined."
          )
        );
      }
    };
    const onError = () => {
      loadPromise = null; // allow a retry later
      reject(new Error(`Failed to load MediaPipe FaceMesh from ${FACE_MESH_SRC}`));
    };

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });

    if (!existing) {
      script.src = FACE_MESH_SRC;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    } else if (window.FaceMesh) {
      // Already loaded before this call subscribed to events.
      onLoad();
    }
  });

  return loadPromise;
}
