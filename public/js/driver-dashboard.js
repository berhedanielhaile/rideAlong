/* eslint-disable */

export class DriverDashboard {
  constructor(driverId) {
    this.driverId = driverId;
    this.pollingInterval = null;
    this.pollingDelay = 10000; // 10 seconds
  }

  async fetchRequests() {
    try {
      const response = await fetch(`/api/v1/user/${this.driverId}/requests`);
      const data = await response.json();

      if (data.status === 'success' && data.data.requests.length > 0) {
        this.showNewRequest(data.data.requests[0]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }

  showNewRequest(request) {
    // Stop polling when showing a request
    this.stopPolling();

    // Show the request UI
    this.renderRequestUI(request);
  }

  renderRequestUI(request) {
    // Update DOM with request details
    document.getElementById('request-details').innerHTML = `
      <div class="request-card">
        <h3>New Ride Request</h3>
        <p>Pickup: ${request.pickup.adress}</p>
        <p>Dropoff: ${request.dropoff.adress}</p>
        <p>Distance: ${request.metrics.distance_km} km</p>
        <p>Fare: ${request.payment.fare_breakdown.total_fare} ETB</p>
        <button onclick="acceptRequest('${request._id}')">Accept</button>
        <button onclick="declineRequest('${request._id}')">Decline</button>
      </div>
    `;
  }

  startPolling() {
    // Initial fetch
    this.fetchRequests();

    // Set up interval
    this.pollingInterval = setInterval(() => {
      this.fetchRequests();
    }, this.pollingDelay);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}
