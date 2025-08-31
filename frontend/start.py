#!/usr/bin/env python3
"""
Simple HTTP server to serve the Voice Shopping Assistant frontend
"""
import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# Change to the frontend directory
frontend_dir = Path(__file__).parent
os.chdir(frontend_dir)

PORT = 3000
Handler = http.server.SimpleHTTPRequestHandler

print(f"🚀 Starting Voice Shopping Assistant Frontend...")
print(f"📁 Serving files from: {frontend_dir}")
print(f"🌐 Server will run on: http://localhost:{PORT}")
print(f"🧪 Test page available at: http://localhost:{PORT}/test.html")
print()

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"✅ Server started successfully!")
        print(f"🔗 Main App: http://localhost:{PORT}")
        print(f"🔗 Test Page: http://localhost:{PORT}/test.html")
        print()
        print("📋 Make sure your backend is running on http://127.0.0.1:8000")
        print("⏹️  Press Ctrl+C to stop the server")
        print()
        
        # Optionally open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
            
        httpd.serve_forever()
        
except KeyboardInterrupt:
    print("\n🛑 Server stopped by user")
    sys.exit(0)
except OSError as e:
    if e.errno == 48:  # Address already in use
        print(f"❌ Port {PORT} is already in use!")
        print("Try stopping other servers or use a different port")
    else:
        print(f"❌ Error starting server: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)