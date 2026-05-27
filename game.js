// FAB-36 Advanced Packaging Yield Classifier - Core Game Engine

class AdvancedPackagingGame {
    constructor() {
        // Game State Variables
        this.score = 0;
        this.perfectCount = 0;
        this.funds = 0;
        this.totalProcessed = 0;
        this.totalCorrect = 0;
        this.yieldRate = 100.0;
        this.stabilityBeacons = 3;
        
        // Upgrades Levels (max 3)
        this.aoiLevel = 0;
        this.cleanroomLevel = 0;
        this.beltLevel = 0;

        // Upgrade Costs
        this.upgradeCosts = {
            aoi: [150, 300, 500],
            clean: [250, 450, 750],
            belt: [200, 350, 600]
        };

        // Game Configuration
        this.isPlaying = false;
        this.chips = [];
        this.chipIdCounter = 10000;
        this.lastSpawnTime = 0;
        this.spawnInterval = 2800; // ms between chip spawns
        this.baseSpeed = 1.6; // px per frame at 60fps
        this.speedMultiplier = 1.0;
        this.gameLoopId = null;

        // Web Audio Synthesizer Context
        this.audioCtx = null;
        this.audioEnabled = true;

        // Visual References
        this.conveyorBelt = document.getElementById('chips-conveyor-belt');
        this.terminalBody = document.getElementById('terminal-body');
        
        // Bind functions to preserve context
        this.update = this.update.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    // INIT AUDIO CONTEXT ON FIRST USER INTERACTION
    initAudio() {
        if (!this.audioCtx && this.audioEnabled) {
            try {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn("Web Audio API not supported in this browser.", e);
            }
        }
    }

    // SYNTHESIZE TECH SFX - 3D Vacuum Suction (PASS)
    playPassSound() {
        if (!this.audioCtx) return;
        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        // Synthesizing a high tech suction sound
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.3);

        // Add a small metallic chime chime
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(880, now + 0.1);
        chime.frequency.setValueAtTime(1320, now + 0.18);
        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        chimeGain.gain.linearRampToValueAtTime(0.001, now + 0.35);
        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chime.start(now);
        chime.stop(now + 0.35);
    }

    // SYNTHESIZE TECH SFX - Mechanical Scrap Rejecter (REJECT)
    playRejectSound() {
        if (!this.audioCtx) return;
        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        // Synthesizing a pneumatic sweep sound
        const osc = ctx.createOscillator();
        const noise = ctx.createOscillator(); // low sweep
        const gainNode = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.25);

        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);

        // Industrial crunch noise
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        
        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        noiseNode.start(now);
        noiseNode.stop(now + 0.15);
    }

    // SYNTHESIZE TECH SFX - Alarm Warning Beacon (ERROR)
    playErrorSound() {
        if (!this.audioCtx) return;
        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(330, now);
        osc1.frequency.linearRampToValueAtTime(220, now + 0.15);
        osc1.frequency.linearRampToValueAtTime(330, now + 0.3);
        osc1.frequency.linearRampToValueAtTime(220, now + 0.45);

        osc2.frequency.setValueAtTime(335, now);
        osc2.frequency.linearRampToValueAtTime(225, now + 0.15);
        osc2.frequency.linearRampToValueAtTime(335, now + 0.3);
        osc2.frequency.linearRampToValueAtTime(225, now + 0.45);

        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.35);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.5);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
    }

    // SYNTHESIZE TECH SFX - Radar Scanner Chirp (AOI Entry)
    playScanSound() {
        if (!this.audioCtx) return;
        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.08);

        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // SYNTHESIZE TECH SFX - Research Upgrade Unlocked
    playUpgradeSound() {
        if (!this.audioCtx) return;
        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
        freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
            gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.25);
        });
    }

    // SYNTHESIZE EPIC FANFARE (Star Wars style)
    playFanfareSound() {
        if (!this.audioCtx) return;
        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        // Low heavy rumble base
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sawtooth';
        subOsc.frequency.setValueAtTime(116.54, now); // Bb2
        subGain.gain.setValueAtTime(0.12, now);
        subGain.gain.linearRampToValueAtTime(0.001, now + 4.0);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 4.0);

        // Majestic rising chords (arpeggio Bb major)
        const notes = [
            { freq: 233.08, delay: 0 },    // Bb3
            { freq: 293.66, delay: 0.1 },  // D4
            { freq: 349.23, delay: 0.2 },  // F4
            { freq: 466.16, delay: 0.3 }   // Bb4
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(note.freq, now + note.delay);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(100, now + note.delay);
            filter.frequency.exponentialRampToValueAtTime(3000, now + note.delay + 0.8);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + note.delay + 0.1);
            gain.gain.linearRampToValueAtTime(0.08, now + 2.5);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 4.0);
        });

        // Add high melody line: Bb4 (0.6s) -> F5 (1.2s) -> Eb5 (1.6s) -> D5 (1.7s) -> C5 (1.8s) -> Bb5 (2.0s)
        const melody = [
            { freq: 466.16, time: 0.6, dur: 0.5 }, // Bb4
            { freq: 698.46, time: 1.2, dur: 0.4 }, // F5
            { freq: 622.25, time: 1.6, dur: 0.1 }, // Eb5
            { freq: 587.33, time: 1.7, dur: 0.1 }, // D5
            { freq: 523.25, time: 1.8, dur: 0.1 }, // C5
            { freq: 932.33, time: 2.0, dur: 1.2 }  // Bb5
        ];

        melody.forEach(m => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(m.freq, now + m.time);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.07, now + m.time + 0.02);
            gain.gain.linearRampToValueAtTime(0.07, now + m.time + m.dur - 0.05);
            gain.gain.linearRampToValueAtTime(0.001, now + m.time + m.dur);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + m.time + m.dur);
        });
    }

    // START GAME
    startGame() {
        this.initAudio();
        
        // Reset state variables
        this.score = 0;
        this.perfectCount = 0;
        this.funds = 0;
        this.totalProcessed = 0;
        this.totalCorrect = 0;
        this.yieldRate = 100.0;
        this.stabilityBeacons = 3;
        
        // Reset upgrades
        this.aoiLevel = 0;
        this.cleanroomLevel = 0;
        this.beltLevel = 0;

        // Reset UI indicators
        this.updateStatsUI();
        this.updateUpgradeButtons();
        this.resetBeacons();

        // Clear existing chips
        this.chips.forEach(c => c.element.remove());
        this.chips = [];
        
        // Reset spawner properties
        this.speedMultiplier = 1.0;
        this.spawnInterval = 2800;
        this.lastSpawnTime = performance.now();

        // Logging
        this.clearTerminal();
        this.logToTerminal("[SYSTEM] PRODUCTION RUN COMMENCED.", "text-green");
        this.logToTerminal(`[SYSTEM] cleanroom standard: ISO Class 100.`, "text-dim");

        // Hide overlays
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-over-screen').classList.remove('active');

        // Start loops
        this.isPlaying = true;
        this.gameLoopId = requestAnimationFrame(this.update);
        
        // Event listeners binding
        window.addEventListener('keydown', this.handleKeyDown);

        // Highlight Holographic Readout
        document.getElementById('diag-analysis').textContent = 'STANDBY';
        document.getElementById('diag-analysis').className = 'text-green';
        document.getElementById('diag-defect-rate').textContent = '0.00%';
        this.clearHoloWireframe();
    }

    // STOP GAME
    stopGame(reason = "yield") {
        this.isPlaying = false;
        cancelAnimationFrame(this.gameLoopId);
        window.removeEventListener('keydown', this.handleKeyDown);

        // Prepare game over screen details
        document.getElementById('final-score').textContent = `${this.score} dies`;
        document.getElementById('final-yield').textContent = `${this.yieldRate.toFixed(1)}%`;
        
        const missedDefectsCount = this.totalProcessed - this.totalCorrect;
        document.getElementById('final-misses').textContent = `${missedDefectsCount} pcs`;
        
        document.getElementById('final-upgrades').textContent = `AI Lv${this.aoiLevel} / Cleanroom Lv${this.cleanroomLevel} / Belt Lv${this.beltLevel}`;
        
        const reasonText = document.getElementById('game-over-reason-text');
        if (reason === "yield") {
            reasonText.innerHTML = `生產線因為<strong>綜合良率過低（低於臨界值 60.0%）</strong>，被廠區最高管理階層強制停機進行重大工藝審查。晶圓代工良率必須持續維持在高標，以免損失昂貴的先進矽晶圓基板。`;
        } else {
            reasonText.innerHTML = `生產線因為<strong>系統穩定度歸零（晶圓廠警報完全觸發）</strong>，無塵室安全機制強制鎖定。連續的嚴重漏檢或誤判導致封裝熱壓機損毀，產線停機整頓。`;
        }

        // Show Game Over Overlay
        document.getElementById('game-over-screen').classList.add('active');
        this.playErrorSound();
        this.logToTerminal(`[FATAL] PRODUCTION RUN HALTED. Reason: ${reason === "yield" ? "Low Yield" : "Instability"}`, "text-red");
    }

    // MAIN GAME LOOP (Frame Update)
    update(timestamp) {
        if (!this.isPlaying) return;

        // Dynamic Speed & Spawn Interval scaling based on Score
        // formula: scaling speed smoothly up
        this.speedMultiplier = 1.0 + Math.log10(this.score + 1) * (0.8 - this.beltLevel * 0.18);
        this.spawnInterval = Math.max(1200, 2800 - Math.log10(this.score + 1) * 900 + this.beltLevel * 150);

        // Check Spawning
        const elapsedSinceLastSpawn = timestamp - this.lastSpawnTime;
        if (elapsedSinceLastSpawn >= this.spawnInterval) {
            this.spawnChip();
            this.lastSpawnTime = timestamp;
        }

        // Update Chip Positions
        const beltWidth = this.conveyorBelt.offsetWidth;
        const currentSpeed = this.baseSpeed * this.speedMultiplier;

        for (let i = this.chips.length - 1; i >= 0; i--) {
            const chip = this.chips[i];
            
            if (chip.isSorted) {
                // Remove sorted chips if animation completes (handled dynamically, but fallback cleanup here)
                continue;
            }

            chip.x += currentSpeed;
            chip.element.style.left = `${chip.x}px`;

            // DETECT LASER SCANNER CROSSINGS
            // Scanner Center point is roughly 50% of the belt width
            const scannerLeftLimit = beltWidth * 0.5 - 55;
            const scannerRightLimit = beltWidth * 0.5 + 55;
            
            if (chip.x + 40 >= scannerLeftLimit && chip.x - 40 <= scannerRightLimit) {
                if (!chip.isScanned) {
                    chip.isScanned = true;
                    chip.element.classList.add('scanned-highlight');
                    this.playScanSound();
                    this.updateHolographicScanner(chip);
                }
            } else {
                // If it passes past the scanner
                if (chip.isScanned && chip.x - 40 > scannerRightLimit) {
                    chip.element.classList.remove('scanned-highlight');
                }
            }

            // DETECT WAFER ROLLING OFF CONVEYOR (Auto-processing of Perfect Chips)
            if (chip.x >= beltWidth + 10) {
                // Chip exited the conveyor belt without being explicitly sorted
                this.chips.splice(i, 1);
                chip.element.remove();

                if (chip.type === 'perfect') {
                    // Good chips are allowed to roll off automatically into the packager!
                    this.score++;
                    this.funds += 10;
                    this.totalProcessed++;
                    this.totalCorrect++;
                    this.logToTerminal(`[AUTO] Die #${chip.id} packaged successfully (Perfect yield).`, "text-dim");
                    this.playPassSound();
                    
                    // Small particle glow on successful auto package
                    this.spawnParticles(beltWidth - 20, 60, '#10b981');
                } else {
                    // DEFECTIVE CHIP LOOPS INTO THE PACKAGING PROCESS! (Disaster)
                    this.stabilityBeacons--;
                    this.totalProcessed++;
                    // totalCorrect not incremented since it was missed!
                    this.triggerBeaconAlarm();
                    this.logToTerminal(`[CRITICAL] Defective chip #${chip.id} (${this.getDefectChineseName(chip.type)}) packaged! Advanced Assembly Failure.`, "text-red");
                    this.playErrorSound();
                    
                    // Red explosion particles at end of belt
                    this.spawnParticles(beltWidth - 20, 60, '#ef4444');
                }
                
                this.updateStatsUI();
                
                // Game Over Checks
                this.checkGameOverConditions();
            }
        }

        // Keep updating X-Ray visualizer if a chip is currently scanned
        this.tickHolographicReadout();

        // Loop next frame
        if (this.isPlaying) {
            this.gameLoopId = requestAnimationFrame(this.update);
        }
    }

    // RANDOM CHIP GENERATION (Wafer dicing stream)
    spawnChip() {
        this.chipIdCounter++;
        const id = `LOT-${this.chipIdCounter}`;
        
        // Define defect type based on probabilities
        // Probabilities: Higher scores increase defect weights slightly, but Cleanroom upgrades suppress particles!
        let defectTypes = ['perfect'];
        
        // Weights initialization
        let weightPerfect = 55;
        let weightCrack = 15;
        let weightParticle = 20 - (this.cleanroomLevel * 6); // suppresses particles
        if (weightParticle < 0) weightParticle = 0;
        let weightMisaligned = 15;
        let weightBridge = 15;
        
        // Construct weighted selector pool
        const pool = [];
        for (let i = 0; i < weightPerfect; i++) pool.push('perfect');
        for (let i = 0; i < weightCrack; i++) pool.push('defect-crack');
        for (let i = 0; i < weightParticle; i++) pool.push('defect-particles');
        for (let i = 0; i < weightMisaligned; i++) pool.push('defect-misaligned');
        for (let i = 0; i < weightBridge; i++) pool.push('defect-bridge');
        
        const selectedType = pool[Math.floor(Math.random() * pool.length)];

        // Create DOM element
        const chipEl = document.createElement('div');
        chipEl.className = 'chip';
        chipEl.id = `chip-${id}`;
        chipEl.style.left = `-100px`;

        // Die substrate overlay
        const dieEl = document.createElement('div');
        dieEl.className = 'chip-die';
        chipEl.appendChild(dieEl);

        // Generate specific defect graphics
        if (selectedType === 'perfect') {
            const glow = document.createElement('div');
            glow.className = 'perfect-glow';
            chipEl.appendChild(glow);
        } else {
            chipEl.classList.add(selectedType);

            if (selectedType === 'defect-crack') {
                // SVG cracked line
                const svgCrack = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svgCrack.setAttribute('class', 'defect-crack');
                svgCrack.setAttribute('viewBox', '0 0 80 80');
                
                const crackPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                // Random crack pattern
                const startX = 15 + Math.random() * 15;
                const crackD = `M ${startX} 20 L ${startX + 10} 35 L ${startX - 5} 50 L ${startX + 15} 65`;
                crackPath.setAttribute('d', crackD);
                crackPath.setAttribute('stroke', '#ef4444');
                crackPath.setAttribute('stroke-width', '3');
                crackPath.setAttribute('fill', 'none');
                
                svgCrack.appendChild(crackPath);
                chipEl.appendChild(svgCrack);
            } 
            else if (selectedType === 'defect-particles') {
                const particleWrap = document.createElement('div');
                particleWrap.className = 'defect-particles';
                // Spawn 3-5 yellow particles randomly on die
                const numParticles = 3 + Math.floor(Math.random() * 3);
                for (let p = 0; p < numParticles; p++) {
                    const dot = document.createElement('div');
                    dot.className = 'particle-dot';
                    dot.style.left = `${20 + Math.random() * 40}px`;
                    dot.style.top = `${20 + Math.random() * 40}px`;
                    particleWrap.appendChild(dot);
                }
                chipEl.appendChild(particleWrap);
            }
            else if (selectedType === 'defect-bridge') {
                const bridgeWrap = document.createElement('div');
                bridgeWrap.className = 'defect-bridge';
                
                const solderBridge = document.createElement('div');
                solderBridge.className = 'bridge-solder';
                // Position bridge connection
                solderBridge.style.left = '32px';
                solderBridge.style.top = '62px';
                solderBridge.style.width = '16px';
                solderBridge.style.height = '7px';
                solderBridge.style.borderRadius = '2px';
                
                bridgeWrap.appendChild(solderBridge);
                chipEl.appendChild(bridgeWrap);
            }
        }

        // AI Level 3 direct sight assistance
        if (this.aoiLevel >= 3) {
            chipEl.classList.add('ai-assist-active');
            const aiSight = document.createElement('div');
            aiSight.className = 'ai-target-sight';
            chipEl.appendChild(aiSight);
        }

        // Add to DOM and game collection
        this.conveyorBelt.appendChild(chipEl);

        const newChip = {
            id: id,
            type: selectedType,
            element: chipEl,
            x: -90,
            isScanned: false,
            isSorted: false
        };

        // Click to sort defect chip directly (Casual friendly gameplay)
        chipEl.addEventListener('click', () => {
            if (!newChip.isSorted) {
                // If user clicks directly on the chip, sort it based on its type
                if (newChip.type !== 'perfect') {
                    this.sortChip(newChip, 'reject');
                } else {
                    this.sortChip(newChip, 'pass');
                }
            }
        });

        this.chips.push(newChip);
    }

    // UPDATE DIAGNOSTIC HOLOGRAPHIC TERMINAL SCREEN
    updateHolographicScanner(chip) {
        document.getElementById('diag-id').textContent = chip.id;
        
        const diagAnalysis = document.getElementById('diag-analysis');
        const diagDefect = document.getElementById('diag-defect-rate');
        const holoPath = document.getElementById('holo-defect-path');
        
        // Generate hologram path wireframes
        if (chip.type === 'perfect') {
            diagAnalysis.textContent = 'CLEANROOM A: PASS';
            diagAnalysis.className = 'text-green';
            diagDefect.textContent = '0.00%';
            holoPath.setAttribute('d', ''); // clean
        } 
        else if (chip.type === 'defect-crack') {
            diagAnalysis.textContent = 'SUBSTRATE CRACK';
            diagAnalysis.className = 'text-red pulsing';
            diagDefect.textContent = '94.21%';
            // Draw visual crack overlay on Hologram
            holoPath.setAttribute('d', 'M 50 40 L 70 80 L 40 120 L 90 160');
        } 
        else if (chip.type === 'defect-particles') {
            diagAnalysis.textContent = 'PARTICLE CONTAMINATION';
            diagAnalysis.className = 'text-red pulsing';
            diagDefect.textContent = '78.50%';
            // Draw scatter dots in scan
            holoPath.setAttribute('d', 'M 40 45 A 2 2 0 1 1 39.9 45 M 120 70 A 3 3 0 1 1 119.9 70 M 80 130 A 2 2 0 1 1 79.9 130');
        } 
        else if (chip.type === 'defect-misaligned') {
            diagAnalysis.textContent = 'DIE MISALIGNMENT';
            diagAnalysis.className = 'text-red pulsing';
            diagDefect.textContent = '86.13%';
            // Crooked square path
            holoPath.setAttribute('d', 'M 45 35 L 145 45 L 135 145 L 35 135 Z');
        } 
        else if (chip.type === 'defect-bridge') {
            diagAnalysis.textContent = 'BUMP BRIDGE SHORT';
            diagAnalysis.className = 'text-red pulsing';
            diagDefect.textContent = '99.98%';
            // Heavy short highlight on base
            holoPath.setAttribute('d', 'M 80 145 H 120 V 155 H 80 Z');
        }

        // Highlight scanning UI in blue for Level 1 AI
        if (this.aoiLevel >= 1) {
            chip.element.classList.add('scanned-highlight');
        }
    }

    // Keep Diagnostic interface flashing/ticking
    tickHolographicReadout() {
        // Find the chip that is currently closest to the center of the belt scanning zone
        const beltWidth = this.conveyorBelt.offsetWidth;
        const scannerCenter = beltWidth * 0.5;
        
        let closestChip = null;
        let minDistance = Infinity;

        this.chips.forEach(chip => {
            if (chip.isSorted) return;
            const distance = Math.abs(chip.x + 40 - scannerCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closestChip = chip;
            }
        });

        // If the closest chip is within the scanning area, display its diagnostic data
        if (closestChip && Math.abs(closestChip.x + 40 - scannerCenter) <= 120) {
            // Keep screen updated with currently scanned chip
            if (closestChip.isScanned) {
                document.getElementById('diag-id').textContent = closestChip.id;
            }
        } else {
            // No chip in scan gate, standby
            document.getElementById('diag-id').textContent = 'LOT-00000';
            const diagAnalysis = document.getElementById('diag-analysis');
            diagAnalysis.textContent = 'STANDBY';
            diagAnalysis.className = 'text-cyan';
            document.getElementById('diag-defect-rate').textContent = '0.00%';
            this.clearHoloWireframe();
        }
    }

    clearHoloWireframe() {
        document.getElementById('holo-defect-path').setAttribute('d', '');
    }

    // ACTIVE SORTING PROCESS TRIGGERED BY BUTTON OR KEY
    sortChip(chip, classification) {
        if (!chip || chip.isSorted) return;
        chip.isSorted = true;

        // Perform animation depending on PASS or REJECT
        if (classification === 'pass') {
            chip.element.classList.add('sort-pass');
            this.playPassSound();
            
            // Check if classification is CORRECT
            if (chip.type === 'perfect') {
                this.score++;
                this.funds += 12; // Extra reward for active perfect sorting!
                this.totalCorrect++;
                
                // PERFECT ALIGNMENT BONUS check (if sorted exactly inside AOI gate center)
                const beltWidth = this.conveyorBelt.offsetWidth;
                const scannerCenter = beltWidth * 0.5;
                const distanceToScannerCenter = Math.abs(chip.x + 40 - scannerCenter);
                
                if (distanceToScannerCenter < 35) {
                    this.perfectCount++;
                    this.funds += 8; // Double reward for rhythmic perfect hit!
                    this.logToTerminal(`[ALIGNMENT] Perfect 3D stacking match for Die #${chip.id}! Bonus $8.`, "text-gold");
                    this.spawnParticles(chip.x + 40, 60, '#fcd34d');
                } else {
                    this.logToTerminal(`[SUCCESS] Die #${chip.id} routed to 3D Packaging.`, "text-dim");
                    this.spawnParticles(chip.x + 40, 40, '#10b981');
                }
            } else {
                // False pass! Packaged a defective chip!
                this.stabilityBeacons--;
                this.triggerBeaconAlarm();
                this.logToTerminal(`[CRITICAL ALERT] Defective Die #${chip.id} (${this.getDefectChineseName(chip.type)}) forced into 3D Stack!`, "text-red");
                this.playErrorSound();
                this.spawnParticles(chip.x + 40, 20, '#ef4444');
            }
        } 
        else if (classification === 'reject') {
            chip.element.classList.add('sort-reject');
            this.playRejectSound();

            // Check if classification is CORRECT
            if (chip.type !== 'perfect') {
                this.score++;
                this.funds += 15; // Rewarded well for isolating hazardous defective substrate
                this.totalCorrect++;
                this.logToTerminal(`[ISOLATE] Isolated ${this.getDefectChineseName(chip.type)} on Die #${chip.id}. Scrap collected.`, "text-cyan");
                this.spawnParticles(chip.x + 40, 100, '#06b6d4');
            } else {
                // False alarm! Disintegrated a perfect good silicon die!
                this.stabilityBeacons--;
                this.triggerBeaconAlarm();
                this.logToTerminal(`[FALSE REJECT] Perfect chip #${chip.id} destroyed! Expensive scrap penalty.`, "text-red");
                this.playErrorSound();
                this.spawnParticles(chip.x + 40, 90, '#ef4444');
            }
        }

        // Process queue cleanup after short delay (wait for anims)
        this.totalProcessed++;
        this.updateStatsUI();

        setTimeout(() => {
            const idx = this.chips.indexOf(chip);
            if (idx > -1) {
                this.chips.splice(idx, 1);
            }
            chip.element.remove();
        }, 350);

        // Check for Game Over conditions
        this.checkGameOverConditions();
    }

    // PROCESS KEYBOARD & TOUCH CONTROLS
    handleKeyDown(event) {
        if (!this.isPlaying) return;

        // Determine which chip is the "Target"
        // Target is defined as the unprocessed chip that has progressed furthest (or is closest to the scan/packaging area)
        // Usually, the oldest unprocessed chip in the inspection zone (or anywhere on the belt)
        let activeTarget = null;
        let maxProgressX = -Infinity;

        this.chips.forEach(chip => {
            if (!chip.isSorted && chip.x > maxProgressX) {
                maxProgressX = chip.x;
                activeTarget = chip;
            }
        });

        if (!activeTarget) return;

        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
            event.preventDefault();
            // Animate HTML Button Cap press feel for keyboard users
            const passBtn = document.getElementById('btn-pass');
            passBtn.classList.add('active');
            setTimeout(() => passBtn.classList.remove('active'), 100);

            this.sortChip(activeTarget, 'pass');
        } 
        else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
            event.preventDefault();
            const rejectBtn = document.getElementById('btn-reject');
            rejectBtn.classList.add('active');
            setTimeout(() => rejectBtn.classList.remove('active'), 100);

            this.sortChip(activeTarget, 'reject');
        }
    }

    // DYNAMIC METRICS RECALCULATOR & UI UPDATER
    updateStatsUI() {
        // Yield Rate Calculation: (correct / processed) * 100
        if (this.totalProcessed > 0) {
            this.yieldRate = (this.totalCorrect / this.totalProcessed) * 100;
        } else {
            this.yieldRate = 100.0;
        }

        const yieldValEl = document.getElementById('yield-value');
        const yieldProgress = document.getElementById('yield-progress');
        
        yieldValEl.textContent = this.yieldRate.toFixed(1);
        yieldProgress.style.width = `${this.yieldRate}%`;

        // Style the yield indicator according to threshold standards
        if (this.yieldRate >= 90) {
            yieldValEl.className = 'value text-green';
            yieldProgress.className = 'bar bg-green';
        } else if (this.yieldRate >= 75) {
            yieldValEl.className = 'value text-amber';
            yieldProgress.className = 'bar bg-amber';
        } else {
            yieldValEl.className = 'value text-red';
            yieldProgress.className = 'bar bg-red';
        }

        // Score (Packaged dies)
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('perfect-count-label').textContent = `完美對位: ${this.perfectCount}`;

        // UPH (Unit Per Hour) estimate: speeds up as score rises
        const calculatedUPH = Math.round(1200 * this.speedMultiplier);
        document.getElementById('uph-value').textContent = calculatedUPH.toLocaleString();
        document.getElementById('uph-progress').style.width = `${Math.min(100, (calculatedUPH / 5000) * 100)}%`;
        document.getElementById('speed-multiplier-label').textContent = `傳送帶倍速: ${this.speedMultiplier.toFixed(1)}x`;

        // Budget Funds
        document.getElementById('funds-value').textContent = this.funds;

        // Auto check upgrade button availabilities based on funds
        this.updateUpgradeButtons();
    }

    // CHECK GAME OVER CONDITIONS
    checkGameOverConditions() {
        if (this.stabilityBeacons <= 0) {
            this.stopGame("instability");
        } else if (this.totalProcessed >= 5 && this.yieldRate < 60.0) {
            this.stopGame("yield");
        }
    }

    // BEACONS (LIVES) GRAPHICS MANAGEMENT
    resetBeacons() {
        this.stabilityBeacons = 3;
        for (let i = 1; i <= 3; i++) {
            const b = document.getElementById(`beacon-${i}`);
            b.className = 'beacon active';
        }
    }

    triggerBeaconAlarm() {
        const indexToDeactivate = 3 - this.stabilityBeacons; // 3 lives -> beacon 3 fails first
        const b = document.getElementById(`beacon-${4 - this.stabilityBeacons}`);
        if (b) {
            b.className = 'beacon warning';
        }
    }

    // TECH UPGRADES DECK LOGIC
    buyUpgrade(tech) {
        const currentLevel = tech === 'aoi' ? this.aoiLevel : (tech === 'clean' ? this.cleanroomLevel : this.beltLevel);
        if (currentLevel >= 3) return;

        const cost = this.upgradeCosts[tech][currentLevel];
        if (this.funds >= cost) {
            this.funds -= cost;
            
            if (tech === 'aoi') {
                this.aoiLevel++;
                document.getElementById('upg-aoi-level').textContent = `Lv ${this.aoiLevel} / 3`;
                this.logToTerminal(`[RESEARCH] AI AOI+ Scan Engine upgraded to Level ${this.aoiLevel}!`, "text-cyan");
            } 
            else if (tech === 'clean') {
                this.cleanroomLevel++;
                document.getElementById('upg-clean-level').textContent = `Lv ${this.cleanroomLevel} / 3`;
                const cleanValueText = this.cleanroomLevel === 1 ? "Class 10" : (this.cleanroomLevel === 2 ? "Class 1" : "Class 0 (Absolute Vacuum)");
                document.getElementById('cleanroom-value').textContent = `ISO ${cleanValueText}`;
                this.logToTerminal(`[RESEARCH] Cleanroom filters standardized to Level ${this.aoiLevel}! Particles suppressed.`, "text-cyan");
            } 
            else if (tech === 'belt') {
                this.beltLevel++;
                document.getElementById('upg-belt-level').textContent = `Lv ${this.beltLevel} / 3`;
                this.logToTerminal(`[RESEARCH] High dampener conveyor motor installed. Acceleration reduced.`, "text-cyan");
            }

            this.playUpgradeSound();
            this.updateStatsUI();
        }
    }

    updateUpgradeButtons() {
        const checkUpg = (tech, level) => {
            const btn = document.getElementById(`btn-upg-${tech}`);
            const card = document.getElementById(`upg-${tech}`);
            
            if (level >= 3) {
                btn.disabled = true;
                btn.innerHTML = '已滿級 (MAX)';
                card.style.opacity = '0.7';
                return;
            }

            const cost = this.upgradeCosts[tech][level];
            btn.querySelector('.cost').textContent = `$${cost}`;
            
            if (this.funds >= cost) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        };

        checkUpg('aoi', this.aoiLevel);
        checkUpg('clean', this.cleanroomLevel);
        checkUpg('belt', this.beltLevel);
    }

    // SPARK / PARTICLE EMITTER ENGINE FOR DUST & FLUID IMPACT FEEDBACK
    spawnParticles(x, y, color) {
        const container = document.getElementById('conveyor-container');
        const numParticles = 12 + Math.floor(Math.random() * 8);

        for (let i = 0; i < numParticles; i++) {
            const p = document.createElement('div');
            p.className = 'particle-effect';
            p.style.backgroundColor = color;
            p.style.boxShadow = `0 0 8px ${color}`;
            p.style.left = `${x}px`;
            
            // Conveyor relative offsets
            // Conveyor height starts around y, let's offset
            p.style.top = `${y + 40}px`; 

            container.appendChild(p);

            // Random physical trajectories
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 6;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            let px = x;
            let py = y + 40;
            let opacity = 1.0;

            const pLoop = () => {
                px += vx;
                py += vy;
                opacity -= 0.04;
                
                p.style.left = `${px}px`;
                p.style.top = `${py}px`;
                p.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(pLoop);
                } else {
                    p.remove();
                }
            };

            requestAnimationFrame(pLoop);
        }
    }

    // LOGGER FEED FOR CONSOLE EMULATION
    logToTerminal(text, className = "") {
        const p = document.createElement('p');
        p.className = className;
        p.textContent = text;
        this.terminalBody.appendChild(p);

        // Auto-scroll log
        this.terminalBody.scrollTop = this.terminalBody.scrollHeight;

        // Cap scrolling entries
        if (this.terminalBody.children.length > 25) {
            this.terminalBody.children[0].remove();
        }
    }

    clearTerminal() {
        this.terminalBody.innerHTML = "";
    }

    // UTILITY HELPER
    getDefectChineseName(type) {
        switch (type) {
            case 'defect-crack': return "微裂紋缺陷";
            case 'defect-particles': return "微塵污染";
            case 'defect-misaligned': return "晶粒對位偏差";
            case 'defect-bridge': return "金屬短路凸塊";
            default: return "未知缺陷";
        }
    }
}

// ON WINDOWS LOADED INITIALIZATION
window.addEventListener('load', () => {
    const game = new AdvancedPackagingGame();

    // Star Wars-style Intro Crawl Timing Logic
    let introTimeouts = [];
    const bootScreen = document.getElementById('boot-screen');
    const introScreen = document.getElementById('intro-screen');
    const startScreen = document.getElementById('start-screen');

    document.getElementById('btn-boot-system').addEventListener('click', () => {
        // Initialize audio & play grand fanfare
        game.initAudio();
        game.playFanfareSound();

        // Transition: Boot Screen to Intro Screen
        bootScreen.classList.remove('active');
        introScreen.classList.add('active');

        // Stage 1: Blue text "A long time ago..."
        const farAway = document.getElementById('intro-far-away');
        farAway.classList.add('animate');

        // Stage 2: Giant yellow logo zoom (Trigger at 5.5s after blue text fades)
        const t1 = setTimeout(() => {
            const logo = document.getElementById('intro-logo');
            logo.classList.add('animate');
        }, 5500);

        // Stage 3: Perspective text crawl starts (Trigger at 8.5s)
        const t2 = setTimeout(() => {
            const crawlWrapper = document.getElementById('intro-crawl-container');
            const crawlContent = document.getElementById('intro-crawl-content');
            crawlWrapper.classList.add('animate');
            crawlContent.classList.add('animate');
        }, 8500);

        // Stage 4: Automatically end intro and show Start panel after 55s
        const t3 = setTimeout(() => {
            endIntro();
        }, 58000);

        introTimeouts.push(t1, t2, t3);
    });

    const endIntro = () => {
        // Clear all pending timeouts
        introTimeouts.forEach(t => clearTimeout(t));
        introTimeouts = [];

        // Transition: Intro Screen to Start Menu
        introScreen.classList.remove('active');
        startScreen.classList.add('active');

        // Clean up animation classes to prevent loops or bugs
        document.getElementById('intro-far-away').classList.remove('animate');
        document.getElementById('intro-logo').classList.remove('animate');
        document.getElementById('intro-crawl-container').classList.remove('animate');
        document.getElementById('intro-crawl-content').classList.remove('animate');
    };

    // Skip Intro Button Listener
    document.getElementById('btn-skip-intro').addEventListener('click', () => {
        endIntro();
    });

    // Event hooks for start/restart overlays
    document.getElementById('btn-start-game').addEventListener('click', () => {
        const soundChecked = document.getElementById('sound-enabled').checked;
        game.audioEnabled = soundChecked;
        game.startGame();
    });

    document.getElementById('btn-restart-game').addEventListener('click', () => {
        game.startGame();
    });

    // Upgrades bindings
    document.getElementById('btn-upg-aoi').addEventListener('click', () => game.buyUpgrade('aoi'));
    document.getElementById('btn-upg-clean').addEventListener('click', () => game.buyUpgrade('clean'));
    document.getElementById('btn-upg-belt').addEventListener('click', () => game.buyUpgrade('belt'));

    // Manual tactile action button click hooks
    document.getElementById('btn-pass').addEventListener('click', () => {
        if (!game.isPlaying) return;
        let activeTarget = null;
        let maxProgressX = -Infinity;
        game.chips.forEach(chip => {
            if (!chip.isSorted && chip.x > maxProgressX) {
                maxProgressX = chip.x;
                activeTarget = chip;
            }
        });
        if (activeTarget) game.sortChip(activeTarget, 'pass');
    });

    document.getElementById('btn-reject').addEventListener('click', () => {
        if (!game.isPlaying) return;
        let activeTarget = null;
        let maxProgressX = -Infinity;
        game.chips.forEach(chip => {
            if (!chip.isSorted && chip.x > maxProgressX) {
                maxProgressX = chip.x;
                activeTarget = chip;
            }
        });
        if (activeTarget) game.sortChip(activeTarget, 'reject');
    });

    // Real-time HUD Clock feeder
    setInterval(() => {
        const clockEl = document.getElementById('system-time');
        if (clockEl) {
            const d = new Date();
            clockEl.textContent = d.toTimeString().split(' ')[0];
        }
    }, 1000);
});
