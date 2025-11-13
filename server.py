#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class GameHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(__file__), **kwargs)

def start_server():
    try:
        with socketserver.TCPServer(("", PORT), GameHandler) as httpd:
            print(f"🐝 Bee Game Server Started!")
            print(f"🌐 Open your browser and go to: http://localhost:{PORT}")
            print(f"🎮 Click 'Start Game' to begin playing!")
            print(f"⏹️  Press Ctrl+C to stop the server")

            # Auto-open browser
            webbrowser.open(f'http://localhost:{PORT}')

            httpd.serve_forever()

    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped. Thanks for playing!")
    except OSError as e:
        if e.errno == 48:  # Port already in use
            print(f"❌ Port {PORT} is already in use. Try a different port:")
            print(f"   python3 -m http.server {PORT + 1}")
        else:
            print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    start_server()