import Stats from 'three/addons/libs/stats.module.js';

import World from './scripts/world.js';

new World();

const stats = new Stats();

// Choose panel mode: 0 = FPS, 1 = MS (Render time), 2 = MB (Memory allocation)
stats.showPanel(0); 

// Append the small widget window to the upper-left of your screen
document.body.appendChild(stats.dom);


// update Loop
function animate() {
    requestAnimationFrame(animate);
    stats.begin();

    World.update();

    stats.end();
}
animate();