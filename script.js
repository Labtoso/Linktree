const yearLabel = document.getElementById("yearLabel");

if (yearLabel) {
	yearLabel.textContent = String(new Date().getFullYear());
}
