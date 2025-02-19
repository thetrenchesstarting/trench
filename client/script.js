/* client/script.js */
import * as THREE from 'three';
const socket = io();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const player = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
scene.add(player);
camera.position.z = 5;

const players = {};
const bullets = [];

window.addEventListener('keydown', (event) => {
    if (event.key === 'w') player.position.z -= 0.1;
    if (event.key === 's') player.position.z += 0.1;
    if (event.key === 'a') player.position.x -= 0.1;
    if (event.key === 'd') player.position.x += 0.1;
    socket.emit('move', { x: player.position.x, z: player.position.z });
});

window.addEventListener('click', () => {
    socket.emit('shoot', { x: player.position.x, z: player.position.z });
});

socket.on('updatePlayers', (serverPlayers) => {
    for (const id in serverPlayers) {
        if (!players[id]) {
            const newPlayer = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
            scene.add(newPlayer);
            players[id] = newPlayer;
        }
        players[id].position.x = serverPlayers[id].x;
        players[id].position.z = serverPlayers[id].z;
    }
});

socket.on('spawnBullet', (bulletData) => {
    const bullet = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    bullet.position.set(bulletData.x, 0, bulletData.z);
    scene.add(bullet);
    bullets.push(bullet);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
