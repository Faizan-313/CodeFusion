/*

Tracks which anomaly keys are currently active and only fires `onStart`
after a key has been continuously active for `persistMs`. When a previously
fired key becomes inactive, `onEnd` is called with the total duration.

*/

export class AnomalyTracker {
  constructor({ persistMs, onStart, onEnd }) {
    this.persistMs = persistMs;
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.states = new Map();
    this.nextId = 1;
  }

  update(activeKeys) {
    const now = performance.now();
    const nowWall = Date.now();

    for (const key of activeKeys) {
      let state = this.states.get(key);
      if (!state) {
        state = { since: now, wallSince: nowWall, logged: false, id: null };
        this.states.set(key, state);
      }
      if (!state.logged && now - state.since >= this.persistMs) {
        state.logged = true;
        state.id = this.nextId++;
        this.onStart?.({
          id: state.id,
          key,
          startTime: state.wallSince,
        });
      }
    }

    for (const [key, state] of this.states) {
      if (!activeKeys.has(key)) {
        if (state.logged) {
          this.onEnd?.({
            id: state.id,
            key,
            endTime: nowWall,
            durationMs: nowWall - state.wallSince,
          });
        }
        this.states.delete(key);
      }
    }
  }

  flush() {
    const nowWall = Date.now();
    for (const [key, state] of this.states) {
      if (state.logged) {
        this.onEnd?.({
          id: state.id,
          key,
          endTime: nowWall,
          durationMs: nowWall - state.wallSince,
        });
      }
    }
    this.states.clear();
  }
}
