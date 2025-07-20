#!/usr/bin/env node
/**
 * Simple HTTPS server for the Metrolinx Voice Transit App
 * Serves the app over HTTPS to enable Web Speech API functionality
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 8443;
const HTTP_PORT = 8080;
const CERT_FILE = 'server.crt';
const KEY_FILE = 'server.key';

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

function createSelfSignedCert() {
    if (fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)) {
        console.log(`Using existing certificate files: ${CERT_FILE}, ${KEY_FILE}`);
        return;
    }

    try {
        console.log('Creating self-signed certificate...');
        execSync(`openssl req -x509 -newkey rsa:2048 -keyout ${KEY_FILE} -out ${CERT_FILE} -days 365 -nodes -subj "/C=CA/ST=Ontario/L=Toronto/O=Metrolinx Voice App/CN=localhost"`, {
            stdio: 'inherit'
        });
        console.log(`Created self-signed certificate: ${CERT_FILE}, ${KEY_FILE}`);
    } catch (error) {
        console.error('Failed to create certificate. Please install OpenSSL or create certificates manually.');
        console.error('Alternative: Use the Python server (server.py) which has fallback certificate generation.');
        process.exit(1);
    }
}

function serveFile(req, res) {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }

    // Get file extension and MIME type
    const ext = path.extname(filePath);
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Type', mimeType);

    // Serve file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
        res.writeHead(500);
        res.end('Internal Server Error');
    });
}

function startHTTPSServer() {
    createSelfSignedCert();

    const options = {
        key: fs.readFileSync(KEY_FILE),
        cert: fs.readFileSync(CERT_FILE)
    };

    const server = https.createServer(options, serveFile);

    server.listen(PORT, () => {
        console.log('🚊 Metrolinx Voice Transit App Server');
        console.log(`📡 Serving HTTPS on port ${PORT}`);
        console.log(`🌐 Open: https://localhost:${PORT}`);
        console.log('🎤 Web Speech API enabled with HTTPS');
        console.log('📱 Mobile-friendly PWA ready');
        console.log('\n⚠️  You may see a security warning about the self-signed certificate.');
        console.log('   Click "Advanced" and "Proceed to localhost" to continue.');
        console.log('\n🛑 Press Ctrl+C to stop the server');
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Please stop other servers or use a different port.`);
        } else {
            console.error('Server error:', error);
        }
        process.exit(1);
    });
}

function startHTTPServer() {
    const server = http.createServer(serveFile);

    server.listen(HTTP_PORT, () => {
        console.log('🚊 Metrolinx Voice Transit App Server (HTTP)');
        console.log(`📡 Serving HTTP on port ${HTTP_PORT}`);
        console.log(`🌐 Open: http://localhost:${HTTP_PORT}`);
        console.log('⚠️  Note: Web Speech API may have limited functionality over HTTP');
        console.log('   For full functionality, use HTTPS server instead');
        console.log('\n🛑 Press Ctrl+C to stop the server');
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${HTTP_PORT} is already in use. Please stop other servers or use a different port.`);
        } else {
            console.error('Server error:', error);
        }
        process.exit(1);
    });
}

// Handle command line arguments
const args = process.argv.slice(2);
const useHTTP = args.includes('--http') || args.includes('-h');

if (useHTTP) {
    startHTTPServer();
} else {
    startHTTPSServer();
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server stopped');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Server stopped');
    process.exit(0);
});
