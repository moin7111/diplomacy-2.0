import ws from 'k6/ws';
import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 350 }, // Ramp-up to 350 concurrent users (50 games * 7 players)
    { duration: '1m', target: 350 },  // Hold for 1 minute
    { duration: '10s', target: 0 },   // Ramp down
  ],
};

const BASE_URL = __ENV.API_URL || 'https://diplomacy.tum-s.de';

// Register and Login to get a valid JWT
function getAuthToken(userId) {
  const payload = JSON.stringify({
    email: `loadtest_${userId}@test.com`,
    password: 'Password123!',
    username: `loadtest_${userId}`
  });
  
  const headers = { 'Content-Type': 'application/json' };
  
  // Try register
  http.post(`${BASE_URL}/api/auth/register`, payload, { headers });
  
  // Login
  const res = http.post(`${BASE_URL}/api/auth/login`, payload, { headers });
  
  try {
    return JSON.parse(res.body).accessToken;
  } catch(e) {
    console.error(`Auth failed for user ${userId}: ${res.body}`);
    return null;
  }
}

export default function () {
  const token = getAuthToken(__VU);
  
  if (!token) {
    sleep(1);
    return;
  }

  // Socket.io payload format requires an upgrade to WebSocket
  // Note: Standard Socket.io connection uses specific query params.
  const url = `${BASE_URL.replace('http', 'ws')}/socket.io/?EIO=4&transport=websocket&token=${token}`;

  const res = ws.connect(url, null, function (socket) {
    // Determine a shared game ID based on VU. (7 players per game -> 50 games)
    const gameId = `load_test_game_${Math.floor(__VU / 7)}`;

    socket.on('open', function () {
      // 1. Socket.io requires a "40" to connect to a namespace. We use the /game namespace.
      // But we wait for the server's Socket.io handshake (0{"sid":...})
    });

    socket.on('message', function (msg) {
      if (typeof msg === 'string') {
        // Ping handling (Socket.io sends 2, client responds with 3)
        if (msg === '2') {
          socket.send('3');
        }

        // Connection established (Socket.io sends 0{"sid"...})
        if (msg.startsWith('0')) {
          // Connect to /game namespace
          socket.send('40/game');
        }

        // Namespace connected (Socket.io sends 40{"sid"...})
        if (msg.startsWith('40/game')) {
          // Join the game room
          const joinPayload = `42/game,["join-game",{"gameId":"${gameId}"}]`;
          socket.send(joinPayload);
          
          // Emit submit-orders periodically
          for (let i = 0; i < 10; i++) {
            const submitPayload = `42/game,["submit-orders",{"gameId":"${gameId}","orders":[{"unit":"A PAR","action":"hold"}]}]`;
            const start = Date.now();
            socket.send(submitPayload);
            
            // Sleep a little to simulate human action
            socket.setTimeout(function () {}, 200); 
          }
        }
        
        // Listen to events
        if (msg.startsWith('42/game,["orders-received"')) {
            // Check latency or successful receiving
            check(msg, { 'received orders-received': (m) => m.includes('orders-received') });
        }
      }
    });

    socket.on('error', function (e) {
      if (e.error() != 'websocket: close sent') {
        console.log('An unexpected error occurred: ', e.error());
      }
    });

    socket.setTimeout(function () {
      socket.close();
    }, 45000); // Keep alive for 45 seconds per iteration
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}
