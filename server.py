#!/usr/bin/env python3
"""
Simple HTTP server with proper MIME type support for CSS files
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CSSHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Set proper MIME types
        if self.path.endswith('.css'):
            self.send_header('Content-Type', 'text/css; charset=utf-8')
        elif self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
        elif self.path.endswith('.html'):
            self.send_header('Content-Type', 'text/html; charset=utf-8')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging to show what's being served
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == '__main__':
    port = 8080
    print(f"Starting HTTP server on port {port}...")
    print(f"Open http://localhost:{port} in your browser")
    print(f"Press Ctrl+C to stop the server")
    
    server = HTTPServer(('0.0.0.0', port), CSSHTTPRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)
