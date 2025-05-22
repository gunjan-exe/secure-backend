const axios = require('axios');

// Get action from command line: login or register
const action = process.argv[2] || 'login'; // Default to 'login'
const endpoint = `http://localhost:5000/api/auth/${action}`;
const attempts = 10;

// Dummy credentials — adjust for /register or /login
const email = 'testuser@example.com';
const password = 'WrongPassword123'; // For /login
const registrationPayload = {
  email,
  password,
  name: 'CLI Bot' // Add name if your /register route requires it
};

// Utility to wait between requests (optional)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const simulateRequestFlood = async () => {
  console.log(`🚨 Simulating ${attempts} ${action.toUpperCase()} attempts...\n`);

  for (let i = 1; i <= attempts; i++) {
    try {
      const payload = action === 'register' ? registrationPayload : { email, password };

      const res = await axios.post(endpoint, payload);
      console.log(`✅ Attempt ${i}:`, res.data);
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        const message = data.message || data.error || JSON.stringify(data);
        console.log(`❌ Attempt ${i} [${err.response.status}]: ${message}`);
      } else {
        console.error(`💥 Attempt ${i}: Unexpected error`, err.message);
      }
    }

    await sleep(500); // Optional: Add delay to simulate real attack
  }
};

simulateRequestFlood();
