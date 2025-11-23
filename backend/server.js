// server.js - minimal backend that compiles & runs C++ algorithms safely
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..'))); // serve frontend files
app.use(require('cors')());

const algorithmsDir = path.join(__dirname, '..', 'algorithms');
const allowedAlgorithms = {
  'FIFO': 'FIFO.cpp',
  'LRU': 'LRU.cpp',
  'Optimal': 'Optimal.cpp'
};

function compileIfNeeded(algKey){
  return new Promise((resolve, reject) => {
    const cpp = allowedAlgorithms[algKey];
    if(!cpp) return reject(new Error('Invalid algorithm'));
    const exeName = algKey; // e.g., FIFO
    const exePath = path.join(algorithmsDir, exeName);
    // if exe exists and is newer than source, skip
    const srcPath = path.join(algorithmsDir, cpp);
    fs.stat(exePath, (ee, est) => {
      fs.stat(srcPath, (er, sst) => {
        if(!er && !ee && est.mtimeMs >= sst.mtimeMs){
          return resolve(exePath);
        }
        // compile
        const cmd = `g++ -std=c++17 -O2 "${srcPath}" -o "${exePath}"`;
        exec(cmd, { timeout: 20_000 }, (err, stdout, stderr) => {
          if(err){
            return reject(new Error('Compilation failed: ' + stderr));
          }
          return resolve(exePath);
        });
      });
    });
  });
}

app.post('/run', async (req, res) => {
  try{
    const { algorithm, frames, refs } = req.body;
    if(!algorithm || !allowedAlgorithms[algorithm]) return res.status(400).send('Algorithm not allowed');
    if(!Number.isInteger(frames) || frames <= 0 || frames > 50) return res.status(400).send('Invalid frames');
    if(!Array.isArray(refs) || refs.length === 0 || refs.length > 200) return res.status(400).send('Invalid refs');

    // sanitize refs: only integers
    const safeRefs = refs.map(n => parseInt(n,10)).filter(n => !Number.isNaN(n));
    if(safeRefs.length === 0) return res.status(400).send('Invalid reference string');

    // compile if needed
    const exePath = await compileIfNeeded(algorithm);

    // prepare args: frames and comma-separated refs
    const args = [String(frames), safeRefs.join(',')];

    // spawn the executable
    const proc = spawn(exePath, args, { cwd: algorithmsDir, timeout: 20_000 });

    let out = '';
    let err = '';
    proc.stdout.on('data', d => out += d.toString());
    proc.stderr.on('data', d => err += d.toString());

    proc.on('error', (e) => {
      return res.status(500).send('Execution error: ' + e.message);
    });

    proc.on('close', code => {
      if(code !== 0){
        return res.status(500).send('Algorithm exited with code ' + code + ' stderr: ' + err);
      }
      // Expect valid JSON from C++ stdout
      try{
        const parsed = JSON.parse(out);
        return res.json(parsed);
      }catch(e){
        return res.status(500).send('Invalid algorithm output: ' + e.message + '\n' + out + '\n' + err);
      }
    });

  }catch(e){
    console.error(e);
    res.status(500).send(e.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
  console.log(`Server started on port ${PORT}`);
});
