(function() {
	'use strict';

	const statusPulse = document.getElementById('statusPulse');
	const statusIcon = document.getElementById('statusIcon');
	const statusTitle = document.getElementById('statusTitle');
	const statusMessage = document.getElementById('statusMessage');
	const statusDetails = document.getElementById('statusDetails');

	function formatTime(seconds) {
		if (!seconds || seconds <= 0) {
			return 'N/A';
		}

		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}h ${minutes}m ${secs}s`;
		}
		if (minutes > 0) {
			return `${minutes}m ${secs}s`;
		}
		return `${secs}s`;
	}

	function formatDate(dateString) {
		if (!dateString) {
			return 'N/A';
		}

		try {
			const date = new Date(dateString);
			return date.toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				timeZoneName: 'short'
			});
		} catch (error) {
			return dateString;
		}
	}

	function updateStatusDisplay(data) {
		const status = data.status ? data.status.toLowerCase() : 'unknown';
		const isLive = status === 'live';
		const isMaintenance = status === 'maintenance' || status === 'maintaining';

		statusPulse.className = 'status-pulse ' + (isLive ? 'live' : isMaintenance ? 'maintenance' : '');
		statusIcon.className = 'status-icon ' + (isLive ? 'live' : isMaintenance ? 'maintenance' : '');
		statusTitle.className = 'status-title ' + (isLive ? 'live' : isMaintenance ? 'maintenance' : '');

		if (isLive) {
			statusIcon.textContent = '✓';
			statusTitle.textContent = 'All Systems Operational';
			statusMessage.textContent = data.message || 'Server is running smoothly.';
			statusMessage.className = 'status-message';
		} else if (isMaintenance) {
			statusIcon.textContent = '⚙';
			statusTitle.textContent = 'Under Maintenance';
			statusMessage.textContent = data.message || 'We are performing scheduled maintenance.';
			statusMessage.className = 'status-message maintenance';
		} else {
			statusIcon.textContent = '?';
			statusTitle.textContent = 'Status Unknown';
			statusMessage.textContent = data.message || 'Unable to determine server status.';
			statusMessage.className = 'status-message';
		}

		statusDetails.innerHTML = '';

		if (data.countdown !== null && data.countdown !== undefined) {
			const countdownItem = document.createElement('div');
			countdownItem.className = 'detail-item';
			countdownItem.innerHTML = '<span class="detail-label">Countdown:</span><span class="detail-value">' + formatTime(data.countdown) + '</span>';
			statusDetails.appendChild(countdownItem);
		}

		if (data.estimatedCompletion) {
			const completionItem = document.createElement('div');
			completionItem.className = 'detail-item';
			completionItem.innerHTML = '<span class="detail-label">Estimated Completion:</span><span class="detail-value">' + formatDate(data.estimatedCompletion) + '</span>';
			statusDetails.appendChild(completionItem);
		}

		if (data.scheduledMaintenance) {
			const scheduledItem = document.createElement('div');
			scheduledItem.className = 'detail-item';
			scheduledItem.innerHTML = '<span class="detail-label">Scheduled Maintenance:</span><span class="detail-value">' + formatDate(data.scheduledMaintenance) + '</span>';
			statusDetails.appendChild(scheduledItem);
		}
	}

	function fetchStatus() {
		fetch('status.json')
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(function(data) {
				updateStatusDisplay(data);
			})
			.catch(function(error) {
				console.error('Error fetching status:', error);
				statusIcon.textContent = '✗';
				statusTitle.textContent = 'Error Loading Status';
				statusMessage.textContent = 'Unable to fetch server status. Please try again later.';
				statusMessage.className = 'status-message';
			});
	}

	fetchStatus();

	setInterval(fetchStatus, 30000);
})();

