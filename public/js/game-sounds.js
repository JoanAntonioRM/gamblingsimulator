// game-sounds.js - Complete version with all game sounds
// Simple Web Audio API-based sound system

const GameSounds = {
    audioContext: null,
    enabled: true,
    volume: 0.3,

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = localStorage.getItem('gameSoundsEnabled') !== 'false';
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('gameSoundsEnabled', this.enabled);
        return this.enabled;
    },

    // Generate tones using Web Audio API (no external files needed)
    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    // Game-specific sounds
    crash: {
        rise() {
            GameSounds.playTone(400, 0.05, 'sine');
            setTimeout(() => GameSounds.playTone(500, 0.05, 'sine'), 50);
        },
        cashout() {
            GameSounds.playTone(880, 0.1, 'sine');
            setTimeout(() => GameSounds.playTone(1100, 0.15, 'sine'), 100);
        },
        boom() {
            GameSounds.playTone(100, 0.3, 'sawtooth');
        }
    },

    plinko: {
        peg() {
            GameSounds.playTone(600 + Math.random() * 400, 0.05, 'sine');
        },
        win() {
            GameSounds.playTone(523, 0.1, 'sine');
            setTimeout(() => GameSounds.playTone(659, 0.1, 'sine'), 100);
            setTimeout(() => GameSounds.playTone(784, 0.2, 'sine'), 200);
        },
        loss() {
            GameSounds.playTone(400, 0.15, 'sawtooth');
            setTimeout(() => GameSounds.playTone(300, 0.2, 'sawtooth'), 150);
        }
    },

    dice: {
        roll() {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    GameSounds.playTone(300 + Math.random() * 200, 0.03, 'square');
                }, i * 40);
            }
        },
        win() {
            GameSounds.playTone(659, 0.1, 'sine');
            setTimeout(() => GameSounds.playTone(784, 0.15, 'sine'), 100);
        },
        loss() {
            GameSounds.playTone(330, 0.2, 'sawtooth');
        }
    },

    cases: {
        spin() {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    GameSounds.playTone(400 + i * 50, 0.02, 'square');
                }, i * 500);
            }
        },
        reveal(rarity) {
            const frequencies = {
                blue: 440,
                purple: 523,
                pink: 659,
                red: 784,
                gold: 1047
            };
            const freq = frequencies[rarity] || 440;
            GameSounds.playTone(freq, 0.15, 'sine');
            setTimeout(() => GameSounds.playTone(freq * 1.5, 0.2, 'sine'), 150);
        }
    },

    mines: {
        reveal() {
            GameSounds.playTone(800, 0.08, 'sine');
        },
        gem() {
            GameSounds.playTone(1000, 0.1, 'sine');
            setTimeout(() => GameSounds.playTone(1200, 0.1, 'sine'), 80);
        },
        explosion() {
            GameSounds.playTone(80, 0.3, 'sawtooth');
            setTimeout(() => GameSounds.playTone(60, 0.4, 'sawtooth'), 100);
        }
    },

    blackjack: {
        deal() {
            GameSounds.playTone(400, 0.05, 'square');
        },
        win() {
            GameSounds.playTone(523, 0.1, 'sine');
            setTimeout(() => GameSounds.playTone(659, 0.15, 'sine'), 100);
        },
        bust() {
            GameSounds.playTone(200, 0.3, 'sawtooth');
        }
    },

    // NEW: Roulette sounds
    roulette: {
        spin() {
            // Spinning wheel sound - ascending tones
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    GameSounds.playTone(200 + i * 50, 0.1, 'sine');
                }, i * 100);
            }
        },
        land() {
            // Ball landing sound
            GameSounds.playTone(800, 0.15, 'sine');
            setTimeout(() => GameSounds.playTone(600, 0.2, 'sine'), 100);
        },
        win() {
            // Winning sound
            GameSounds.playTone(523, 0.1, 'sine');
            setTimeout(() => GameSounds.playTone(659, 0.1, 'sine'), 100);
            setTimeout(() => GameSounds.playTone(784, 0.2, 'sine'), 200);
        }
    },

    // NEW: Card packs sounds
    cardpacks: {
        open() {
            // Pack opening sound
            GameSounds.playTone(400, 0.1, 'sine');
            setTimeout(() => GameSounds.playTone(600, 0.15, 'sine'), 100);
        },
        flip() {
            // Card flip sound
            GameSounds.playTone(800, 0.05, 'square');
            setTimeout(() => GameSounds.playTone(900, 0.05, 'square'), 50);
        },
        rare() {
            // Rare card reveal sound
            GameSounds.playTone(1000, 0.15, 'sine');
            setTimeout(() => GameSounds.playTone(1200, 0.15, 'sine'), 100);
            setTimeout(() => GameSounds.playTone(1500, 0.2, 'sine'), 200);
        },
        win() {
            // Profit sound
            GameSounds.playTone(659, 0.1, 'sine');
            setTimeout(() => GameSounds.playTone(784, 0.1, 'sine'), 100);
            setTimeout(() => GameSounds.playTone(1047, 0.2, 'sine'), 200);
        }
    },

    ui: {
        click() {
            GameSounds.playTone(600, 0.03, 'square');
        },
        success() {
            GameSounds.playTone(659, 0.08, 'sine');
            setTimeout(() => GameSounds.playTone(784, 0.12, 'sine'), 80);
        },
        error() {
            GameSounds.playTone(300, 0.15, 'sawtooth');
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    GameSounds.init();
});

// Sound toggle function for menu
function toggleGameSounds() {
    const enabled = GameSounds.toggle();
    document.getElementById('soundToggleText').textContent = `Sound: ${enabled ? 'ON' : 'OFF'}`;
    GameSounds.ui.click();
}