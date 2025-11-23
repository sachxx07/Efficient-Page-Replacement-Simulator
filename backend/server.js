const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ----- Simulation helpers -----

function simulateFIFO(refs, framesCount) {
  const frames = Array(framesCount).fill(-1);
  const steps = [];
  let hits = 0, misses = 0;
  let nextReplaceIndex = 0;

  refs.forEach((ref, idx) => {
    const hitIndex = frames.indexOf(ref);
    if (hitIndex !== -1) {
      // hit
      hits++;
      steps.push({
        ref,
        state: [...frames],
        result: "hit",
        idx
      });
    } else {
      // miss
      misses++;
      frames[nextReplaceIndex] = ref;
      nextReplaceIndex = (nextReplaceIndex + 1) % framesCount;
      steps.push({
        ref,
        state: [...frames],
        result: "miss",
        idx
      });
    }
  });

  return { hits, misses, steps };
}

function simulateLRU(refs, framesCount) {
  const frames = Array(framesCount).fill(-1);
  const steps = [];
  let hits = 0, misses = 0;
  const lastUsed = new Map();

  refs.forEach((ref, idx) => {
    const hitIndex = frames.indexOf(ref);

    if (hitIndex !== -1) {
      // hit
      hits++;
      lastUsed.set(ref, idx);
      steps.push({
        ref,
        state: [...frames],
        result: "hit",
        idx
      });
    } else {
      // miss
      misses++;
      // if there is empty slot, use it first
      let emptyIndex = frames.indexOf(-1);
      if (emptyIndex !== -1) {
        frames[emptyIndex] = ref;
      } else {
        // find least recently used
        let lruPage = frames[0];
        let lruIndex = lastUsed.get(lruPage) ?? -1;

        frames.forEach(p => {
          const lu = lastUsed.get(p) ?? -1;
          if (lruIndex === -1 || lu < lruIndex) {
            lruPage = p;
            lruIndex = lu;
          }
        });

        const replacePos = frames.indexOf(lruPage);
        frames[replacePos] = ref;
      }

      lastUsed.set(ref, idx);
      steps.push({
        ref,
        state: [...frames],
        result: "miss",
        idx
      });
    }
  });

  return { hits, misses, steps };
}

function simulateOptimal(refs, framesCount) {
  const frames = Array(framesCount).fill(-1);
  const steps = [];
  let hits = 0, misses = 0;

  refs.forEach((ref, idx) => {
    const hitIndex = frames.indexOf(ref);

    if (hitIndex !== -1) {
      // hit
      hits++;
      steps.push({
        ref,
        state: [...frames],
        result: "hit",
        idx
      });
    } else {
      // miss
      misses++;
      const emptyIndex = frames.indexOf(-1);
      if (emptyIndex !== -1) {
        frames[emptyIndex] = ref;
      } else {
        // choose the page whose next use is farthest in the future
        let replacePos = 0;
        let farthest = -1;

        frames.forEach((page, i) => {
          const nextUse = refs.indexOf(page, idx + 1);
          if (nextUse === -1) {
            // never used again -> best to replace
            replacePos = i;
            farthest = Number.POSITIVE_INFINITY;
          } else if (nextUse > farthest) {
            farthest = nextUse;
            replacePos = i;
          }
        });

        frames[replacePos] = ref;
      }

      steps.push({
        ref,
        state: [...frames],
        result: "miss",
        idx
      });
    }
  });

  return { hits, misses, steps };
}

// ----- API route -----

app.post("/run", (req, res) => {
  try {
    const { algorithm, frames, refs } = req.body;

    if (!algorithm || !Array.isArray(refs) || !frames) {
      return res.status(400).send("Invalid input");
    }

    const framesCount = Number(frames);
    const sequence = refs.map(Number);

    let result;
    const algoLower = String(algorithm).toLowerCase();

    if (algoLower === "fifo") {
      result = simulateFIFO(sequence, framesCount);
    } else if (algoLower === "lru") {
      result = simulateLRU(sequence, framesCount);
    } else if (algoLower === "optimal" || algoLower === "opt") {
      result = simulateOptimal(sequence, framesCount);
    } else {
      return res.status(400).send("Unknown algorithm: " + algorithm);
    }

    res.json({
      frames: framesCount,
      sequence,
      hits: result.hits,
      misses: result.misses,
      steps: result.steps
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error: " + e.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
