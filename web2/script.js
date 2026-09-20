const state = { target: new Date('2024-09-14T19:00:00'), theme: 'dawn' };
const $ = (selector) => document.querySelector(selector);

function pad(value) { return String(Math.max(0, value)).padStart(2, '0'); }

function updateCountdown() {
	const remaining = Math.max(0, state.target - new Date());
	const totalSeconds = Math.floor(remaining / 1000);
	$('#days').textContent = String(Math.floor(totalSeconds / 86400)).padStart(3, '0');
	$('#hours').textContent = pad(Math.floor(totalSeconds / 3600) % 24);
	$('#minutes').textContent = pad(Math.floor(totalSeconds / 60) % 60);
	$('#seconds').textContent = pad(totalSeconds % 60);
}

function formatDate(date) {
	return new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function saveCountdown() {
	const title = $('#titleInput').value.trim() || 'Your next moment';
	const dateValue = $('#dateInput').value;
	const timeValue = $('#timeInput').value || '00:00';
	state.target = new Date(`${dateValue}T${timeValue}`);
	$('#eventTitle').textContent = title;
	$('#eventTypeLabel').textContent = $('#typeInput').value;
	$('#dateLabel').textContent = formatDate(state.target);
	updateCountdown();
	$('#saveButton').innerHTML = 'Saved <span>✓</span>';
	setTimeout(() => { $('#saveButton').innerHTML = 'Save countdown <span>→</span>'; }, 1500);
}

document.querySelectorAll('.theme-option').forEach((button) => button.addEventListener('click', () => {
	state.theme = button.dataset.theme;
	document.body.dataset.theme = state.theme === 'dawn' ? '' : state.theme;
	document.querySelectorAll('.theme-option').forEach((item) => item.classList.toggle('active', item === button));
}));
$('#colorInput').addEventListener('input', (event) => { document.documentElement.style.setProperty('--accent', event.target.value); $('#colorValue').textContent = event.target.value.toUpperCase(); });
$('#saveButton').addEventListener('click', saveCountdown);
$('#editButton').addEventListener('click', () => $('#titleInput').focus());
document.querySelectorAll('[data-quick]').forEach((button) => button.addEventListener('click', () => { $('#typeInput').value = button.dataset.quick.toUpperCase(); $('#titleInput').focus(); }));
$('#shareButton').addEventListener('click', async () => { try { await navigator.clipboard.writeText(window.location.href); } catch { /* Clipboard may be unavailable for local files. */ } $('#toast').classList.add('show'); setTimeout(() => $('#toast').classList.remove('show'), 2200); });
updateCountdown();
setInterval(updateCountdown, 1000);
