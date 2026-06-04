const yearLabel = document.getElementById("yearLabel");
const cursorGlow = document.querySelector(".cursor-glow");

const pointerState = {
	currentX: window.innerWidth / 2,
	currentY: window.innerHeight / 2,
	targetX: window.innerWidth / 2,
	targetY: window.innerHeight / 2
};

function updateYear() {
	if (yearLabel) {
		yearLabel.textContent = String(new Date().getFullYear());
	}
}

function animateCursorGlow() {
	pointerState.currentX += (pointerState.targetX - pointerState.currentX) * 0.12;
	pointerState.currentY += (pointerState.targetY - pointerState.currentY) * 0.12;

	if (cursorGlow) {
		cursorGlow.style.transform = `translate3d(${pointerState.currentX - 140}px, ${pointerState.currentY - 140}px, 0)`;
	}

	window.requestAnimationFrame(animateCursorGlow);
}

function handlePointerMove(event) {
	pointerState.targetX = event.clientX;
	pointerState.targetY = event.clientY;

	if (cursorGlow) {
		cursorGlow.style.opacity = "0.9";
	}
}

updateYear();
animateCursorGlow();

window.addEventListener("pointermove", handlePointerMove);
window.addEventListener("pointerleave", () => {
	if (cursorGlow) {
		cursorGlow.style.opacity = "0";
	}
});
