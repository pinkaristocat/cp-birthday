// ===== Landing gift click =====
const giftContainer = document.getElementById('giftContainer');
const countdownContainer = document.getElementById('countdownContainer');
const cakeContainer = document.getElementById('cakeContainer');
const finalMessageDiv = document.getElementById('finalMessage');
const messageText = document.getElementById('messageText');

giftContainer.addEventListener('click', () => {
    giftContainer.classList.add('hidden');
    countdownContainer.classList.remove('hidden');
    startCountdown();
});

// ===== Countdown Timer =====
function startCountdown() {
    // Set target to 23 Oct 2025 00:00 CET
    let target = new Date("2025-10-23T00:00:00+02:00"); // adjust year
    const countdown = document.getElementById('countdown');

    const interval = setInterval(() => {
        let now = new Date();
        let diff = target - now;
        if(diff <= 0) {
            clearInterval(interval);
            countdownContainer.classList.add('hidden');
            cakeContainer.classList.remove('hidden');
            initThreeJSCake();
        } else {
            let days = Math.floor(diff / (1000*60*60*24));
            let hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
            let minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
            let seconds = Math.floor((diff % (1000*60)) / 1000);
            countdown.textContent = `${days}:${hours}:${minutes}:${seconds}`;
        }
    }, 1000);
}

// ===== Three.js Cake Scene =====
let scene, camera, renderer, cake, mixer;
function initThreeJSCake() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff0f0);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    renderer = new THREE.WebGLRenderer({canvas: document.getElementById('cakeCanvas'), antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5,10,5);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // Load cake model
    const loader = new THREE.GLTFLoader();
    loader.load('cake.glb', (gltf) => {
        cake = gltf.scene;
        scene.add(cake);
        animate();
        startMicDetection();
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);
    if(cake) cake.rotation.y += 0.01;
    renderer.render(scene, camera);
}

// ===== Microphone Blow Detection =====
function startMicDetection() {
    navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 512;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = dataArray.reduce((a,b) => a+b,0)/dataArray.length;
            if(sum > 30) { // threshold for blowing
                // trigger candle blow
                triggerCandleBlow();
            } else {
                requestAnimationFrame(checkVolume);
            }
        };
        checkVolume();
    }).catch(err => console.log("Mic access denied:", err));
}

// ===== Candle Blow + Confetti + Message =====
function triggerCandleBlow() {
    // remove candle flames (you can animate actual candles)
    // show confetti
    startConfetti();
    // show messages
    setTimeout(()=>{messageText.textContent = "xyz"; finalMessageDiv.classList.remove('hidden');}, 500);
    setTimeout(()=>{messageText.textContent = "I mean the cake 😘";}, 2500);
}

// ===== Heart Confetti =====
function startConfetti() {
    const confettiCount = 100;
    for(let i=0;i<confettiCount;i++){
        const div = document.createElement('div');
        div.className='confetti';
        div.style.left = Math.random()*100+'vw';
        div.style.backgroundColor = ['#FF69B4','#800080','#FF0000'][Math.floor(Math.random()*3)];
        div.style.animationDuration = 2+Math.random()*3+'s';
        document.body.appendChild(div);
        setTimeout(()=>{div.remove()},5000);
    }
}
