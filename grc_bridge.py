
import zmq, struct, json, time, threading
from http.server import HTTPServer, BaseHTTPRequestHandler

latest = {"spectrum": [0]*160}

def zmq_listener():
    ctx = zmq.Context()
    sock = ctx.socket(zmq.SUB)
    sock.connect("tcp://127.0.0.1:5555")
    sock.setsockopt_string(zmq.SUBSCRIBE, "")
    while True:
        msg = sock.recv()
        n = len(msg) // 4
        vals = struct.unpack(f"{n}f", msg)
        latest["spectrum"] = list(vals)

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(latest).encode())
    def log_message(self, *a): pass

threading.Thread(target=zmq_listener, daemon=True).start()
HTTPServer(("localhost", 8765), Handler).serve_forever()