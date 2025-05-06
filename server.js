import express from 'express';
import { WebSocketServer, WebSocket } from 'ws'; // Modified import
import http from 'http';
import axios from 'axios';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Configuration
const CANDLE_INTERVAL = 60000;
const SYMBOL = 'USDJPY';

// MetaAPI configuration
const auth_liveData = {
  accountId: "53ddc00e-eccd-4973-9eac-2c84f84de986",
  token:
    "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI0YmZlZDFlYWIzMjIwNmM0MWM3ZjMzZDI4YTMwNjIyYSIsInBlcm1pc3Npb25zIjpbXSwiYWNjZXNzUnVsZXMiOlt7ImlkIjoidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpIiwibWV0aG9kcyI6WyJ0cmFkaW5nLWFjY291bnQtbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibWV0YWFwaS1yZXN0LWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibWV0YWFwaS1ycGMtYXBpIiwibWV0aG9kcyI6WyJtZXRhYXBpLWFwaTp3czpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibWV0YWFwaS1yZWFsLXRpbWUtc3RyZWFtaW5nLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFzdGF0cy1hcGkiLCJtZXRob2RzIjpbIm1ldGFzdGF0cy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoicmlzay1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsicmlzay1tYW5hZ2VtZW50LWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJjb3B5ZmFjdG9yeS1hcGkiLCJtZXRob2RzIjpbImNvcHlmYWN0b3J5LWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtdC1tYW5hZ2VyLWFwaSIsIm1ldGhvZHMiOlsibXQtbWFuYWdlci1hcGk6cmVzdDpkZWFsaW5nOio6KiIsIm10LW1hbmFnZXItYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6ImJpbGxpbmctYXBpIiwibWV0aG9kcyI6WyJiaWxsaW5nLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19XSwiaWdub3JlUmF0ZUxpbWl0cyI6ZmFsc2UsInRva2VuSWQiOiIyMDIxMDIxMyIsImltcGVyc29uYXRlZCI6ZmFsc2UsInJlYWxVc2VySWQiOiI0YmZlZDFlYWIzMjIwNmM0MWM3ZjMzZDI4YTMwNjIyYSIsImlhdCI6MTczODkyNTg5M30.E6RrcDK8axUeelmre0CeSoUPrZCHvivpVXnc74pJjooFt64q2oCrW_uqZ54KoDpC3KGx69avLbDAgX48td9DrNSd7C5w9tDk0wynd2cNZRPinKhCor9ATsQ_ppx40D2o28yc1t4EvQ_VLgFE8En-57w7--zPOdf7HthSY0ECmU9-_ae_9p1AJ437h8Gssoq8-44NhZQpvWGxzaB8Vt5SRCuycLJLqE_L7z9ARnH_Ah3kRskGDMqTCGtsTIT_O-EnSqhaZv-FZTagyjCVbfdq5LAGJkvG8XzeI-kHaHwqDvUF20l_f_Nhv7JNod6diAf_TTZv-61-hUAa4udN9l_jbO-GTYkbIjOyNmijSY8NZO_bQ0Pd74ntNlblkCVnnwGZEYlvWxhnkGZjywDAgAlPwdgoL0VJsI9zkfnqAmJGbscZ2GwA9WXLmx1RQrR2FiVT46dZt6KmpP-GKOS1hFKq5Of1wJ9dN7RgfdrV1FHuXcJV4B8QTVDsUBXqEJqNf3DYf0m11Wgn3ynGOKuA_DkbkGcHy1QBBU5f0MO_gPGlCubd_WK6qGo6bQQODHRsAhKN0weS2GkJbHUnKEMUxkzvAF5_AmRMiDEeI9R1gDto-e9lkkddRZEhgTInsMVsz6EXNhPZ8NYf5gOaIlRVMm2_IzOTkyT3wP0ockFSB1ZnbSg",
};

const api = axios.create({
  baseURL: "https://mt-market-data-client-api-v1.new-york.agiliumtrade.ai",
  headers: {
    "auth-token": auth_liveData.token,
    "Content-Type": "application/json",
    Accept: "application/json",
  }
});

// Server state
let currentCandle = null;
let historicalData = [];
let connectedClients = new Set();

async function initializeHistoricalData() {
  try {
    const response = await api.get(
      `/users/current/accounts/${auth_liveData.accountId}/historical-market-data/symbols/${SYMBOL}/timeframes/1m/candles?limit=1000`
    );
    
    historicalData = response.data.map(c => ({
      time: new Date(c.time).getTime(),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));
    
    console.log(`Loaded ${historicalData.length} historical candles`);
  } catch (error) {
    console.error('Failed to load historical data:', error);
    process.exit(1);
  }
}

wss.on('connection', (ws) => {
  connectedClients.add(ws);
  
  ws.send(JSON.stringify({
    type: 'init',
    data: historicalData,
    currentCandle
  }));

  ws.on('close', () => {
    connectedClients.delete(ws);
  });
});

function connectToMarketData() {
  const traderMadeWs = new WebSocket('wss://marketdata.tradermade.com/feedadv');

  traderMadeWs.onopen = () => {
    traderMadeWs.send(JSON.stringify({
      userKey: "wsCgVhfz2ZyK5qn8qUYQ",
      symbol: SYMBOL
    }));
  };

  traderMadeWs.onmessage = (event) => {
    try {
      const tick = JSON.parse(event.data);
      if (!tick?.bid || !tick?.ask) return;

      const price = (parseFloat(tick.bid) + parseFloat(tick.ask)) / 2;
      const timestamp = Date.now();
      const candleTime = Math.floor(timestamp / CANDLE_INTERVAL) * CANDLE_INTERVAL;

      if (!currentCandle || currentCandle.time !== candleTime) {
        if (currentCandle) {
          historicalData.push({...currentCandle});
          if (historicalData.length > 1000) historicalData.shift();
        }

        currentCandle = {
          time: candleTime,
          open: price,
          high: price,
          low: price,
          close: price
        };
      } else {
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;
      }

      const message = JSON.stringify({
        type: 'update',
        candle: currentCandle,
        price,
        timestamp
      });

      connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Error processing tick:', error);
    }
  };

  traderMadeWs.onclose = () => {
    console.log('Market data connection closed. Reconnecting...');
    setTimeout(connectToMarketData, 5000);
  };
}

async function start() {
  await initializeHistoricalData();
  connectToMarketData();
  
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();