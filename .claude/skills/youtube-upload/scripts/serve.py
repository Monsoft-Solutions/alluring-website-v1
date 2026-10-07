"""Serve a folder to YouTube Studio so the page can fetch() the files.

Claude in Chrome's file_upload tool stops at 10 MB, and a 4K Short is far
bigger. Studio fetches the file from this server instead and hands it to its
own file input through a DataTransfer.

    python3 -I serve.py <folder> [port]     # default port 8765

Chrome asks once to let studio.youtube.com reach the local network; the user
has to click Allow. Stop the server when the batch is done.
"""
import http.server
import os
import sys


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', 'https://studio.youtube.com')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()


os.chdir(sys.argv[1])
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8765
print(f'serving {os.getcwd()} on http://127.0.0.1:{port}', flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
