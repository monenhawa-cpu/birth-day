const canvas = document.getElementById("heartTree");
const ctx = canvas.getContext("2d");

let width;
let height;
let hearts = [];
let branches = [];
let particles = [];

function resize() {
    const rect = canvas.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    const ratio = window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    createTree();
}

window.addEventListener("resize", resize);

function heartPath(ctx, x, y, size, rotation = 0) {
    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();

    ctx.moveTo(0, size * .35);

    ctx.bezierCurveTo(
        -size * .9,
        -size * .2,
        -size * .55,
        -size,
        0,
        -size * .45
    );

    ctx.bezierCurveTo(
        size * .55,
        -size,
        size * .9,
        -size * .2,
        0,
        size * .35
    );

    ctx.closePath();

    ctx.restore();
}

function createTree() {
    hearts = [];
    branches = [];
    particles = [];

    const centerX = width / 2;
    const baseY = height - 70;

    const treeWidth = Math.min(width * .72, 570);
    const treeHeight = Math.min(height * .70, 420);

    const topY = baseY - treeHeight;

    // Tronc
    branches.push({
        x1: centerX,
        y1: baseY,
        x2: centerX - 12,
        y2: baseY - treeHeight * .48,
        progress: 0
    });

    branches.push({
        x1: centerX - 7,
        y1: baseY - treeHeight * .42,
        x2: centerX - treeWidth * .24,
        y2: topY + treeHeight * .32,
        progress: 0
    });

    branches.push({
        x1: centerX + 3,
        y1: baseY - treeHeight * .48,
        x2: centerX + treeWidth * .25,
        y2: topY + treeHeight * .28,
        progress: 0
    });

    // Petites branches
    for (let i = 0; i < 14; i++) {
        const angle = -Math.PI + Math.random() * Math.PI;
        const startX = centerX + (Math.random() - .5) * treeWidth * .45;
        const startY = baseY - treeHeight * (.25 + Math.random() * .35);

        const length = 45 + Math.random() * 100;

        branches.push({
            x1: startX,
            y1: startY,
            x2: startX + Math.cos(angle) * length,
            y2: startY + Math.sin(angle) * length,
            progress: 0
        });
    }

    // Forme du cœur
    const total = Math.floor(treeWidth * treeHeight / 105);

    for (let i = 0; i < total; i++) {

        let x, y;

        while (true) {
            x = (Math.random() * 2 - 1);
            y = (Math.random() * 2 - 1);

            const heartShape =
                Math.pow(x * x + y * y - .48, 3)
                - x * x * Math.pow(y, 3)
                < 0;

            if (heartShape) break;
        }

        const px = centerX + x * treeWidth * .47;
        const py = topY + (y + 1) * treeHeight * .43;

        hearts.push({
            x: px,
            y: py,
            targetX: px,
            targetY: py,
            size: 4 + Math.random() * 7,
            rotation: (Math.random() - .5) * .7,
            delay: Math.random() * 180,
            progress: 0,
            color: [
                "#e60039",
                "#ff1744",
                "#ff3d67",
                "#d50045",
                "#ff7096",
                "#f2184c"
            ][Math.floor(Math.random() * 6)]
        });
    }

    for (let i = 0; i < 90; i++) {
        particles.push({
            x: centerX + (Math.random() - .5) * treeWidth,
            y: topY + Math.random() * treeHeight,
            size: Math.random() * 2 + 1,
            alpha: Math.random(),
            speed: .01 + Math.random() * .03
        });
    }
}

let startTime = performance.now();

function drawTrunk() {
    const centerX = width / 2;
    const baseY = height - 68;

    const trunkHeight = Math.min(height * .30, 145);

    const gradient = ctx.createLinearGradient(
        centerX - 18,
        0,
        centerX + 18,
        0
    );

    gradient.addColorStop(0, "#5b2c13");
    gradient.addColorStop(.5, "#a95b29");
    gradient.addColorStop(1, "#5b2c13");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(centerX - 20, baseY);
    ctx.lineTo(centerX - 13, baseY - trunkHeight);
    ctx.lineTo(centerX + 13, baseY - trunkHeight);
    ctx.lineTo(centerX + 20, baseY);
    ctx.closePath();

    ctx.fill();
}

function drawBranches(time) {
    ctx.lineCap = "round";

    branches.forEach((branch, index) => {

        branch.progress = Math.min(
            1,
            Math.max(0, (time - index * 100) / 1100)
        );

        const p = branch.progress;

        const x =
            branch.x1 +
            (branch.x2 - branch.x1) * p;

        const y =
            branch.y1 +
            (branch.y2 - branch.y1) * p;

        ctx.strokeStyle = "#70401e";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(branch.x1, branch.y1);
        ctx.lineTo(x, y);
        ctx.stroke();
    });
}

function drawHearts(time) {

    hearts.forEach((heart, index) => {

        const delay = heart.delay + 900;

        heart.progress = Math.min(
            1,
            Math.max(0, (time - delay) / 900)
        );

        const p = heart.progress;

        const ease = 1 - Math.pow(1 - p, 3);

        const x = width / 2 +
            (heart.targetX - width / 2) * ease;

        const y = height - 80 +
            (heart.targetY - (height - 80)) * ease;

        const pulse =
            1 +
            Math.sin(time * .004 + index) * .08;

        ctx.save();

        ctx.globalAlpha = p;

        ctx.shadowBlur = 5;
        ctx.shadowColor = heart.color;

        ctx.fillStyle = heart.color;

        heartPath(
            ctx,
            x,
            y,
            heart.size * pulse,
            heart.rotation
        );

        ctx.fill();

        ctx.restore();
    });
}

function drawParticles(time) {

    particles.forEach(p => {

        p.alpha += p.speed;

        if (p.alpha > 1 || p.alpha < 0) {
            p.speed *= -1;
        }

        ctx.globalAlpha = Math.abs(p.alpha) * .35;
        ctx.fillStyle = "#ff6f9f";

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

function animate(now) {

    const elapsed = now - startTime;

    ctx.clearRect(0, 0, width, height);

    drawTrunk();
    drawBranches(elapsed);
    drawParticles(elapsed);
    drawHearts(elapsed);

    requestAnimationFrame(animate);
}

function createFloatingHeart() {

    const heart = document.createElement("div");

    heart.className = "floating-heart";
    heart.innerHTML = ["❤️", "💗", "💕", "💖"][Math.floor(Math.random() * 4)];

    heart.style.left = Math.random() * 100 + "%";
    heart.style.fontSize = (12 + Math.random() * 25) + "px";
    heart.style.animationDuration = (5 + Math.random() * 7) + "s";

    document.querySelector(".hearts-background").appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 13000);
}

setInterval(createFloatingHeart, 350);

const text =
    "Que ton anniversaire soit rempli de bonheur, de sourires et de merveilleux souvenirs. ❤️";

let textIndex = 0;

function typeText() {

    if (textIndex < text.length) {
        document.getElementById("typing").textContent += text[textIndex];
        textIndex++;
        setTimeout(typeText, 45);
    }
}

resize();

setTimeout(typeText, 2200);

requestAnimationFrame(animate);