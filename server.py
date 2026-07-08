import os
import re
import sys
import http.server
import socketserver

class RangeRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom HTTP Request Handler that supports Range Requests.
    This enables seek/rewind/fast-forward capabilities for media elements (audio/video).
    """
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
            
        ctype = self.guess_type(path)
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None

        range_header = self.headers.get('Range')
        if not range_header:
            return super().send_head()

        # Parse range header (e.g. bytes=1024-2048)
        match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if not match:
            return super().send_head()

        fs = os.fstat(f.fileno())
        file_size = fs.st_size
        start = int(match.group(1))
        end = match.group(2)
        end = int(end) if end else file_size - 1

        if start >= file_size:
            self.send_error(416, "Requested range not satisfiable")
            f.close()
            return None

        self.send_response(206)
        self.send_header('Content-Type', ctype)
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.send_header('Last-Modified', self.date_time_string(fs.st_mtime))
        self.end_headers()
        
        # Seek to start of range
        f.seek(start)
        return f

    def copyfile(self, source, outputfile):
        if not self.headers.get('Range'):
            super().copyfile(source, outputfile)
            return

        range_header = self.headers.get('Range')
        match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if not match:
            super().copyfile(source, outputfile)
            return

        path = self.translate_path(self.path)
        file_size = os.path.getsize(path)
        start = int(match.group(1))
        end = match.group(2)
        end = int(end) if end else file_size - 1
        
        remaining = end - start + 1
        buffer_size = 64 * 1024
        while remaining > 0:
            chunk_size = min(remaining, buffer_size)
            data = source.read(chunk_size)
            if not data:
                break
            outputfile.write(data)
            remaining -= len(data)

if __name__ == '__main__':
    port = 8000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    
    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), RangeRequestHandler) as httpd:
        print(f"Serving with Range Requests support on port {port}...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
