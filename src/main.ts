import Stats from 'three/addons/libs/stats.module.js';
import World from './scripts/world.js';

const stats = new Stats();
stats.showPanel(0); // 0 = FPS, 1 = MS (Render time), 2 = MB (Memory allocation)  
document.body.appendChild(stats.dom);

new World();

// GAME LOOP
function animate() {
    requestAnimationFrame(animate);
    stats.begin();

    World.update();

    stats.end();
}
animate();