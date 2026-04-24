# 🎰 Galton Board Simulator

An interactive simulation of the **Galton Board** built with HTML5 Canvas and vanilla JavaScript. It demonstrates the binomial distribution and the Gaussian (bell) curve in a highly visual and interactive way. 📈

---

## ✨ Features

- ⚙️ **Realistic Physics:** Elastic bounces and falling mechanics controlled by gravity and friction.
- 🎱 **Multi-drop:** Choose to drop 1, 5, 10, 50, or 100 balls at once!
- ⚖️ **Adjusted Difficulty:** Most of the central buckets grant no points (simulating player attrition), while the outermost buckets offer high rewards.
- 🧩 **Fully Modular:** Code separated into HTML, CSS, and JS for easy maintenance.

---

## 🚀 Installation and Usage

1. **Clone** the repository to your local machine.
2. **Open** the `index.html` file in any modern web browser. *(No local server is required!)*
3. **Choose** the number of balls you want to drop from the dropdown menu.
4. **Click** the `Drop` button to let the balls fall through the peg pyramid.
5. **Keep an eye** on the **Current Balls** counter. If it reaches `0`, the game is over. ☠️

---

## 🎮 How to Play

Probability dictates that the vast majority of balls will land near the center. In this game, the central buckets have an **x0 multiplier**, meaning you will lose any ball that lands there. 

Your goal is to get lucky and have balls bounce towards the edges 🍀 (which hold the **x2**, **x5**, and **x10** multipliers) to recover and increase your total ball count!

---

## 🛠️ Modifying the Game

All the main logic and variables can be found in `script.js` inside the `GAME_CONFIG` object. 
You can easily tweak the following to create your own experience:

- `initialBalls`: Starting balls for the player.
- `pegRows`: Number of peg rows in the pyramid.
- `bounceDamping` and `gravity`: Bounce and falling physics.
- Multipliers in the `drawBuckets()` and `finalizeBall()` functions.

---

## 👨‍💻 Author

**Haddy187**
