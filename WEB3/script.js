(() => {
	const canvas = document.querySelector("#game-canvas");
	const context = canvas.getContext("2d");
	const overlay = document.querySelector("#game-overlay");
	const startButton = document.querySelector("#start-button");
	const overlayKicker = document.querySelector("#overlay-kicker");
	const overlayTitle = document.querySelector("#overlay-title");
	const buttonLabel = document.querySelector("#button-label");
	const overlayHint = document.querySelector("#overlay-hint");
	const scoreValue = document.querySelector("#score-value");
	const bestValue = document.querySelector("#best-value");
	const announcement = document.querySelector("#game-announcement");

	const width = 480;
	const height = 640;
	const groundHeight = 62;
	const gapHeight = 174;
	const plane = { x: 122, y: 300, velocity: 0, rotation: 0 };
	const clouds = [
		{ x: 62, y: 116, scale: 0.8 },
		{ x: 320, y: 174, scale: 1.1 },
		{ x: 226, y: 70, scale: 0.55 },
		{ x: 430, y: 279, scale: 0.72 },
	];

	let gates = [];
	let particles = [];
	let score = 0;
	let best = 0;
	let state = "ready";
	let lastTime = 0;
	let elapsed = 0;
	let groundOffset = 0;

	try {
		best = Number(localStorage.getItem("pocket-pilot-best")) || 0;
	} catch {
		best = 0;
	}
	bestValue.textContent = String(best);

	function resizeCanvas() {
		const bounds = canvas.getBoundingClientRect();
		const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(bounds.width * pixelRatio);
		canvas.height = Math.round(bounds.height * pixelRatio);
		context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
		draw();
	}

	function startGame() {
		score = 0;
		scoreValue.textContent = "0";
		plane.y = 300;
		plane.velocity = 0;
		plane.rotation = 0;
		gates = [makeGate(width + 65), makeGate(width + 315)];
		particles = [];
		state = "playing";
		overlay.classList.add("is-hidden");
		flap();
		announcement.textContent = "Flight started. Click, tap, or press space to fly.";
	}

	function finishGame() {
		if (state !== "playing") return;
		state = "over";
		overlayKicker.textContent = "FLIGHT COMPLETE";
		overlayTitle.innerHTML = `You flew<br>${score} ${score === 1 ? "gate" : "gates"}.`;
		buttonLabel.textContent = "Fly again";
		overlayHint.textContent = "Click, tap, or press space to try again";
		overlay.classList.remove("is-hidden");
		announcement.textContent = `Flight over. You passed ${score} ${score === 1 ? "gate" : "gates"}.`;
	}

	function flap() {
		if (state === "ready" || state === "over") {
			startGame();
			return;
		}
		if (state !== "playing") return;
		plane.velocity = -4.65;
		for (let index = 0; index < 4; index += 1) {
			particles.push({
				x: plane.x - 17,
				y: plane.y + 4 + Math.random() * 8,
				vx: -1.5 - Math.random() * 1.3,
				vy: (Math.random() - 0.5) * 1.4,
				life: 18 + Math.random() * 8,
			});
		}
	}

	function makeGate(x) {
		return {
			x,
			gapY: 178 + Math.random() * 250,
			scored: false,
		};
	}

	function roundedRect(x, y, rectWidth, rectHeight, radius) {
		context.beginPath();
		context.roundRect(x, y, rectWidth, rectHeight, radius);
		context.fill();
	}

	function drawCloud(x, y, scale) {
		context.save();
		context.translate(x, y);
		context.scale(scale, scale);
		context.fillStyle = "rgba(255, 252, 232, 0.64)";
		context.beginPath();
		context.ellipse(0, 6, 34, 10, 0, 0, Math.PI * 2);
		context.ellipse(-14, 2, 14, 12, 0, 0, Math.PI * 2);
		context.ellipse(3, -5, 18, 17, 0, 0, Math.PI * 2);
		context.ellipse(20, 2, 15, 11, 0, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}

	function drawBackground() {
		const sky = context.createLinearGradient(0, 0, 0, height);
		sky.addColorStop(0, "#82c7cc");
		sky.addColorStop(0.72, "#c4e2d2");
		sky.addColorStop(1, "#ebdfa9");
		context.fillStyle = sky;
		context.fillRect(0, 0, width, height);

		context.fillStyle = "rgba(255, 231, 157, 0.7)";
		context.beginPath();
		context.arc(366, 116, 40, 0, Math.PI * 2);
		context.fill();

		clouds.forEach((cloud) => drawCloud(cloud.x, cloud.y, cloud.scale));

		context.fillStyle = "#a4c9a5";
		context.beginPath();
		context.moveTo(0, height - groundHeight - 94);
		context.quadraticCurveTo(112, 410, 230, 490);
		context.quadraticCurveTo(336, 426, width, 480);
		context.lineTo(width, height - groundHeight);
		context.lineTo(0, height - groundHeight);
		context.fill();

		context.fillStyle = "#76a982";
		context.beginPath();
		context.moveTo(0, height - groundHeight - 50);
		context.quadraticCurveTo(144, 480, 269, 530);
		context.quadraticCurveTo(365, 466, width, 516);
		context.lineTo(width, height - groundHeight);
		context.lineTo(0, height - groundHeight);
		context.fill();

		context.fillStyle = "#e7d39a";
		context.fillRect(0, height - groundHeight, width, groundHeight);
		context.fillStyle = "#498574";
		context.fillRect(0, height - groundHeight, width, 8);
		context.fillStyle = "#f4e8bc";
		for (let x = -36 + groundOffset; x < width + 40; x += 42) {
			context.fillRect(x, height - groundHeight + 27, 23, 4);
		}
	}

	function drawGate(gate) {
		const gateWidth = 66;
		const capHeight = 19;
		const topHeight = gate.gapY - gapHeight / 2;
		const bottomY = gate.gapY + gapHeight / 2;
		const bottomHeight = height - groundHeight - bottomY;

		const pipeGradient = context.createLinearGradient(gate.x, 0, gate.x + gateWidth, 0);
		pipeGradient.addColorStop(0, "#287767");
		pipeGradient.addColorStop(0.24, "#62a777");
		pipeGradient.addColorStop(0.76, "#4b956b");
		pipeGradient.addColorStop(1, "#287767");
		context.fillStyle = pipeGradient;
		context.fillRect(gate.x + 6, 0, gateWidth - 12, topHeight);
		context.fillRect(gate.x + 6, bottomY, gateWidth - 12, bottomHeight);
		context.fillStyle = "#347e69";
		roundedRect(gate.x, topHeight - capHeight, gateWidth, capHeight, 4);
		roundedRect(gate.x, bottomY, gateWidth, capHeight, 4);
		context.fillStyle = "rgba(255, 255, 225, 0.23)";
		context.fillRect(gate.x + 14, 0, 4, Math.max(0, topHeight - capHeight));
		context.fillRect(gate.x + 14, bottomY + capHeight, 4, Math.max(0, bottomHeight - capHeight));
	}

	function drawPlane() {
		context.save();
		context.translate(plane.x, plane.y);
		context.rotate(plane.rotation);

		context.fillStyle = "rgba(37, 67, 67, 0.15)";
		context.beginPath();
		context.ellipse(-2, 17, 23, 5, 0, 0, Math.PI * 2);
		context.fill();

		context.fillStyle = "#e56e4e";
		context.beginPath();
		context.moveTo(-20, -2);
		context.lineTo(-8, -11);
		context.lineTo(-1, -7);
		context.lineTo(8, -19);
		context.lineTo(14, -18);
		context.lineTo(11, -5);
		context.lineTo(25, -2);
		context.lineTo(29, 2);
		context.lineTo(11, 5);
		context.lineTo(14, 17);
		context.lineTo(8, 17);
		context.lineTo(-2, 7);
		context.lineTo(-12, 8);
		context.lineTo(-18, 4);
		context.closePath();
		context.fill();

		context.fillStyle = "#fff1cf";
		context.beginPath();
		context.ellipse(0, 0, 20, 6, 0, 0, Math.PI * 2);
		context.fill();

		context.fillStyle = "#1f6d70";
		context.beginPath();
		context.ellipse(7, -2, 6, 3, -0.25, 0, Math.PI * 2);
		context.fill();

		context.fillStyle = "#f3bc5b";
		context.fillRect(-8, -2, 4, 4);
		context.fillRect(-2, -2, 4, 4);
		context.restore();
	}

	function drawParticles() {
		particles.forEach((particle) => {
			context.globalAlpha = Math.max(0, particle.life / 26) * 0.55;
			context.fillStyle = "#fff8dc";
			context.beginPath();
			context.arc(particle.x, particle.y, 2.2, 0, Math.PI * 2);
			context.fill();
		});
		context.globalAlpha = 1;
	}

	function draw() {
		if (!context) return;
		context.clearRect(0, 0, width, height);
		drawBackground();
		gates.forEach(drawGate);
		drawParticles();
		drawPlane();
	}

	function update(delta) {
		const frameScale = Math.min(delta / 16.667, 2.2);
		elapsed += delta;
		clouds.forEach((cloud, index) => {
			cloud.x -= (0.12 + index * 0.025) * frameScale;
			if (cloud.x < -65) cloud.x = width + 60;
		});

		if (state !== "playing") {
			if (state === "ready") {
				plane.y = 300 + Math.sin(elapsed / 310) * 7;
				plane.rotation = Math.sin(elapsed / 330) * 0.035;
			}
			return;
		}

		plane.velocity = Math.min(plane.velocity + 0.24 * frameScale, 5.5);
		plane.y += plane.velocity * frameScale;
		plane.rotation = Math.max(-0.38, Math.min(0.72, plane.velocity * 0.075));
		groundOffset = (groundOffset - 2.8 * frameScale) % 42;

		gates.forEach((gate) => {
			gate.x -= 2.8 * frameScale;
			if (!gate.scored && gate.x + 66 < plane.x) {
				gate.scored = true;
				score += 1;
				scoreValue.textContent = String(score);
				if (score > best) {
					best = score;
					bestValue.textContent = String(best);
					try {
						localStorage.setItem("pocket-pilot-best", String(best));
					} catch {
						// The game remains playable when browser storage is unavailable.
					}
				}
			}
		});

		if (gates.length && gates[0].x < -80) {
			gates.shift();
			gates.push(makeGate(gates[gates.length - 1].x + 250));
		}

		particles = particles.filter((particle) => particle.life > 0);
		particles.forEach((particle) => {
			particle.x += particle.vx * frameScale;
			particle.y += particle.vy * frameScale;
			particle.life -= frameScale;
		});

		if (plane.y < -10 || plane.y > height - groundHeight - 5) {
			finishGame();
			return;
		}

		for (const gate of gates) {
			const overlapsGate = plane.x + 18 > gate.x && plane.x - 18 < gate.x + 66;
			const outsideGap = plane.y - 7 < gate.gapY - gapHeight / 2 || plane.y + 7 > gate.gapY + gapHeight / 2;
			if (overlapsGate && outsideGap) {
				finishGame();
				return;
			}
		}
	}

	function loop(time) {
		const delta = lastTime ? Math.min(time - lastTime, 34) : 16.667;
		lastTime = time;
		update(delta);
		draw();
		requestAnimationFrame(loop);
	}

	startButton.addEventListener("click", (event) => {
		event.stopPropagation();
		startGame();
	});
	overlay.addEventListener("pointerdown", (event) => {
		if (!startButton.contains(event.target)) {
			event.preventDefault();
			flap();
		}
	});
	canvas.addEventListener("pointerdown", (event) => {
		event.preventDefault();
		flap();
	});
	window.addEventListener("keydown", (event) => {
		if (event.code === "Space" || event.code === "ArrowUp") {
			event.preventDefault();
			if (!event.repeat) flap();
		}
	});
	window.addEventListener("resize", resizeCanvas);

	resizeCanvas();
	requestAnimationFrame(loop);
})();
