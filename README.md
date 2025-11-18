📘 Efficient Page Replacement Algorithm Simulator

FIFO • LRU • Optimal — Visual, Interactive & Full-Stack Simulator

This project is an interactive simulator designed to demonstrate and compare the behavior of three OS page replacement algorithms:

FIFO (First-In First-Out)

LRU (Least Recently Used)

Optimal Page Replacement

It provides visualizations, step-by-step execution, hit/miss statistics, and frame-by-frame animations to help students understand how each algorithm works internally.

Features -

• Beautiful, responsive UI (HTML + CSS + JavaScript)
• Smooth animations
• Hit/Miss highlighting
• Step-by-step visualization
• Adjustable playback speed
• Real-time metrics panel

Backend (Node.js):
• Accepts input from frontend
• Compiles C++ files automatically
• Executes the algorithms
• Returns JSON output to UI

Algorithms (C++):
• FIFO implementation
• LRU implementation
• Optimal implementation
• Outputs detailed simulation data

📂 Project Structure

Efficient_Page_Replacement_Algorithm_Simulator/
│
├── index.html
├── style.css
├── script.js
│
├── backend/
│ ├── server.js
│ └── package.json
│
└── algorithms/
├── FIFO.cpp
├── LRU.cpp
└── Optimal.cpp

🧠 How the Simulator Works

User enters:

Algorithm (FIFO/LRU/Optimal)

Number of frames

Reference string (ex: 7,0,1,2,0,3,0,4)

Frontend sends data to backend via POST request.

Backend compiles the C++ algorithm if needed:
g++ FIFO.cpp -o FIFO

Backend runs the compiled binary and collects JSON output.

C++ algorithm processes:

hits & misses

frame states

replacement decisions

simulation steps (JSON)

Frontend receives JSON and animates:

frame-by-frame visualization

logs

hit/miss metrics

highlighting

🛠️ Installation & Setup

Install Requirements:
• Node.js (https://nodejs.org
)
• g++ compiler

Navigate to the backend folder:
cd backend

Install backend dependencies:
npm install

Start the backend server:
npm start

You should see:
Server started on port 3000

Open the simulator in your browser:
http://localhost:3000

🧪 Example Reference String

7,0,1,2,0,3,0,4

🖥️ Technologies Used

Frontend:
• HTML
• CSS
• JavaScript

Backend:
• Node.js
• Express.js
• CORS
• Body-parser

Algorithms:
• C++ (FIFO, LRU, Optimal)
• JSON output