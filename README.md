# Efficient Page Replacement Simulator

A web-based simulator to visualize and compare classic **page replacement algorithms** used in Operating Systems – **FIFO, LRU, and Optimal**.  
The project provides an interactive frontend with animations and a Node.js backend that computes hits, misses and step-by-step frame states.

---

## 1. Objectives

- To demonstrate how different page replacement algorithms work.
- To show the effect of **frame size** and **reference string** on page hits/misses.
- To provide a clean, interactive tool that can be used in OS labs, demos, and viva.

---

## 2. Features

- Support for **FIFO**, **LRU**, and **Optimal** algorithms.
- User can enter:
  - Number of frames
  - Reference string (comma-separated)
  - Algorithm selection
- Animated visualization of:
  - Frames changing at each reference
  - Hit/Miss status for every step
- Live metrics:
  - Total hits
  - Total misses
  - Hit ratio (%)
- Step mode and auto-play mode (simulation speed control).
- Clear log panel showing the steps performed by the algorithm.
- Responsive UI built with pure HTML, CSS and JavaScript.

---

## 3. Tech Stack

**Frontend**

- HTML5, CSS3
- Vanilla JavaScript (no frontend frameworks)
- Live Server (for local development)

**Backend**

- Node.js
- Express.js
- CORS

**Algorithms**

- Logic implemented in **JavaScript** inside the backend for:
  - FIFO
  - LRU
  - Optimal
- Reference C++ implementations are present in the `algorithms/` folder.

---

## 4. Project Structure

```text
Efficient-Page-Replacement-Simulator/
├── algorithms/
│   ├── FIFO.cpp
│   ├── LRU.cpp
│   └── Optical.cpp
├── backend/
│   ├── node_modules/        # Installed automatically (not pushed to GitHub)
│   ├── package.json
│   ├── package-lock.json
│   └── server.js            # Node.js backend (API + algorithms)
├── index.html               # Frontend UI
├── script.js                # Frontend logic + API calls + animation
├── style.css                # Styling
└── README.md
