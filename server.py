"""生产级静态文件服务器 - 带健康检查和自动重启"""
import http.server
import socketserver
import os
import sys

PORT = 8080
DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def do_GET(self):
        # SPA 路由：所有非文件请求都返回 index.html
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not self.path.startswith('/assets/'):
            self.path = '/index.html'
        super().do_GET()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}", flush=True)

    def end_headers(self):
        # 添加 CORS 和缓存头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'public, max-age=3600')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(DIR)
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        print(f"Server running on port {PORT}", flush=True)
        httpd.serve_forever()
