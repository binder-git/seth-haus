import http from 'http';
import { createServer } from 'http';
import { request } from 'http';

const PORT = 3001;
const TARGET_PORT = 9999;
const TARGET_HOST = 'localhost';
const ALLOWED_ORIGIN = 'http://localhost:5173';

const server = createServer((clientReq, clientRes) => {
    console.log(`[${new Date().toISOString()}] ${clientReq.method} ${clientReq.url}`);

    // Set CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method'
    };

    // Handle OPTIONS (preflight) requests
    if (clientReq.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        clientRes.writeHead(204, {
            ...corsHeaders,
            'Content-Length': 0
        });
        return clientRes.end();
    }

    // Forward the request to the target server
    const options = {
        hostname: TARGET_HOST,
        port: TARGET_PORT,
        path: clientReq.url.replace(/^\/api/, '/.netlify/functions'),
        method: clientReq.method,
        headers: {
            ...clientReq.headers,
            host: `${TARGET_HOST}:${TARGET_PORT}`
        }
    };

    const proxy = request(options, (targetRes) => {
        console.log(`Response from target: ${targetRes.statusCode}`);
        
        // Forward the response with CORS headers
        clientRes.writeHead(targetRes.statusCode, {
            ...targetRes.headers,
            ...corsHeaders
        });
        
        targetRes.pipe(clientRes, { end: true });
    });

    // Handle errors
    proxy.on('error', (e) => {
        console.error('Proxy error:', e);
        clientRes.writeHead(500, {
            ...corsHeaders,
            'Content-Type': 'application/json'
        });
        clientRes.end(JSON.stringify({
            error: 'Proxy Error',
            message: e.message
        }));
    });

    // Forward the request body if present
    clientReq.pipe(proxy, { end: true });
});

server.listen(PORT, () => {
    console.log(`CORS Proxy Server running at http://localhost:${PORT}`);
    console.log(`Proxying requests to: http://${TARGET_HOST}:${TARGET_PORT}/.netlify/functions`);    
    console.log(`Allowed Origin: ${ALLOWED_ORIGIN}`);
});
