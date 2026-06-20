const yearLabel = document.getElementById("yearLabel");
const cursorGlow = document.querySelector(".cursor-glow");
const pageShell = document.querySelector(".page-shell");
const root = document.documentElement;

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

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function detectDeviceType(width, ua) {
	const lowerUA = ua.toLowerCase();
	const isIPhone = /iphone/.test(lowerUA);
	const isIPad = /ipad/.test(lowerUA) || (/(macintosh)/.test(lowerUA) && "ontouchend" in document);
	const isAndroid = /android/.test(lowerUA);

	if (isIPhone) {
		return { type: "phone", platform: "iphone" };
	}

	if (isIPad) {
		return { type: "tablet", platform: "ipad" };
	}

	if (isAndroid) {
		if (width <= 900) {
			return { type: "phone", platform: "android" };
		}

		return { type: "tablet", platform: "android-tablet" };
	}

	if (width <= 900) {
		return { type: "phone", platform: "other-mobile" };
	}

	if (width <= 1200) {
		return { type: "tablet", platform: "other-tablet" };
	}

	return { type: "desktop", platform: "desktop" };
}

function applyDeviceProfile() {
	const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
	const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
	const shortSide = Math.min(viewportWidth, viewportHeight);
	const dpr = window.devicePixelRatio || 1;
	const deviceInfo = detectDeviceType(shortSide, navigator.userAgent || "");

	let spaceScale = 1;
	let fontScale = 1;

	if (deviceInfo.type === "phone") {
		spaceScale = clamp(shortSide / 390, 0.88, 1.06);
		fontScale = clamp(shortSide / 390 + (dpr >= 3 ? 0.02 : 0), 0.9, 1.05);
	} else if (deviceInfo.type === "tablet") {
		spaceScale = clamp(shortSide / 820, 0.93, 1.08);
		fontScale = clamp(shortSide / 820, 0.95, 1.06);
	} else {
		spaceScale = clamp(viewportWidth / 1440, 0.95, 1.22);
		fontScale = clamp(viewportWidth / 1480, 0.96, 1.16);
	}

	const topMargin = Math.round(24 * spaceScale);
	const bottomMargin = Math.round(32 * spaceScale);
	const sideGap = deviceInfo.type === "desktop"
		? Math.round(clamp(viewportWidth * 0.03, 22, 52))
		: Math.round(24 * spaceScale);
	const shellMaxWidth = deviceInfo.type === "desktop"
		? Math.round(clamp(viewportWidth * 0.9, 980, 1360))
		: deviceInfo.type === "tablet"
			? 920
			: 560;

	root.dataset.deviceType = deviceInfo.type;
	root.dataset.platform = deviceInfo.platform;
	root.dataset.density = dpr >= 3 ? "high" : dpr >= 2 ? "mid" : "low";

	root.style.setProperty("--device-space-scale", String(spaceScale));
	root.style.setProperty("--device-font-scale", String(fontScale));
	root.style.setProperty("--shell-max-width", `${shellMaxWidth}px`);
	root.style.setProperty("--shell-side-gap", `${sideGap}px`);
	root.style.setProperty("--shell-margin-top", `${topMargin}px`);
	root.style.setProperty("--shell-margin-bottom", `${bottomMargin}px`);
	root.style.setProperty("--ui-scale", "1");
	root.style.setProperty("--viewport-height", `${viewportHeight}px`);

	applyViewportScale();
}

function applyViewportScale() {
	if (!pageShell) {
		return;
	}

	const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
	const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
	const sideGap = parseFloat(getComputedStyle(root).getPropertyValue("--shell-side-gap")) || 24;
	const topMargin = parseFloat(getComputedStyle(root).getPropertyValue("--shell-margin-top")) || 24;
	const bottomMargin = parseFloat(getComputedStyle(root).getPropertyValue("--shell-margin-bottom")) || 32;

	root.style.setProperty("--ui-scale", "1");

	const availableWidth = Math.max(320, viewportWidth - sideGap * 2);
	const availableHeight = Math.max(360, viewportHeight - topMargin - bottomMargin);
	const shellWidth = pageShell.offsetWidth;
	const shellHeight = pageShell.offsetHeight;

	if (!shellWidth || !shellHeight) {
		return;
	}

	const widthScale = availableWidth / shellWidth;
	const heightScale = availableHeight / shellHeight;
	const isDesktop = (root.dataset.deviceType || "desktop") === "desktop";
	const minScale = isDesktop ? 0.62 : 0.78;
	const uiScale = clamp(Math.min(widthScale, heightScale), minScale, 1);

	root.style.setProperty("--ui-scale", String(uiScale));
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
applyDeviceProfile();

const isCoarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
if (!isCoarsePointer) {
	animateCursorGlow();
}

window.addEventListener("pointermove", handlePointerMove);
window.addEventListener("pointerleave", () => {
	if (cursorGlow) {
		cursorGlow.style.opacity = "0";
	}
});

window.addEventListener("resize", applyDeviceProfile);
window.addEventListener("orientationchange", applyDeviceProfile);
if (window.visualViewport) {
	window.visualViewport.addEventListener("resize", applyDeviceProfile);
}

if (typeof ResizeObserver !== "undefined") {
	const fitObserver = new ResizeObserver(() => {
		applyViewportScale();
	});

	if (pageShell) {
		fitObserver.observe(pageShell);
	}

	fitObserver.observe(document.body);
}
