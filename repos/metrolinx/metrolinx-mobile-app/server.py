#!/usr/bin/env python3
"""
Simple HTTPS server for the Metrolinx Voice Transit App
Serves the app over HTTPS to enable Web Speech API functionality
"""

import http.server
import ssl
import socketserver
import os
from pathlib import Path

# Configuration
PORT = 8443
CERT_FILE = "server.crt"
KEY_FILE = "server.key"

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        super().end_headers()
    
    def guess_type(self, path):
        mimetype = super().guess_type(path)
        # Ensure proper MIME types for our files
        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.json'):
            return 'application/json'
        elif path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.html'):
            return 'text/html'
        return mimetype

def create_self_signed_cert():
    """Create a self-signed certificate for local development"""
    if os.path.exists(CERT_FILE) and os.path.exists(KEY_FILE):
        print(f"Using existing certificate files: {CERT_FILE}, {KEY_FILE}")
        return
    
    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        import datetime
        
        # Generate private key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        
        # Create certificate
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, "CA"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Ontario"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, "Toronto"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Metrolinx Voice App"),
            x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
        ])
        
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            private_key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.utcnow()
        ).not_valid_after(
            datetime.datetime.utcnow() + datetime.timedelta(days=365)
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.DNSName("localhost"),
                x509.IPAddress("127.0.0.1"),
            ]),
            critical=False,
        ).sign(private_key, hashes.SHA256())
        
        # Write certificate and key files
        with open(CERT_FILE, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        
        with open(KEY_FILE, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        print(f"Created self-signed certificate: {CERT_FILE}, {KEY_FILE}")
        
    except ImportError:
        print("Warning: cryptography library not available. Using OpenSSL fallback...")
        # Fallback to OpenSSL command
        os.system(f'''
        openssl req -x509 -newkey rsa:2048 -keyout {KEY_FILE} -out {CERT_FILE} -days 365 -nodes -subj "/C=CA/ST=Ontario/L=Toronto/O=Metrolinx Voice App/CN=localhost"
        ''')

def main():
    # Change to the directory containing the HTML files
    os.chdir(Path(__file__).parent)
    
    # Create certificate if needed
    create_self_signed_cert()
    
    # Create HTTPS server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        # Wrap with SSL
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(CERT_FILE, KEY_FILE)
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print(f"🚊 Metrolinx Voice Transit App Server")
        print(f"📡 Serving HTTPS on port {PORT}")
        print(f"🌐 Open: https://localhost:{PORT}")
        print(f"🎤 Web Speech API enabled with HTTPS")
        print(f"📱 Mobile-friendly PWA ready")
        print(f"\n⚠️  You may see a security warning about the self-signed certificate.")
        print(f"   Click 'Advanced' and 'Proceed to localhost' to continue.")
        print(f"\n🛑 Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Server stopped")

if __name__ == "__main__":
    main()
