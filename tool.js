const http = require('http');
const { exec } = require('child_process');

// 1. Giao diện HTML của Tool được nhúng trực tiếp vào đây
const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Tool Chạy File JavaScript</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 450px; }
        h2 { color: #333; margin-top: 0; text-align: center; }
        label { font-size: 14px; color: #666; }
        input[type="text"] { width: 100%; padding: 12px; margin: 10px 0 20px 0; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 14px; }
        button { background: #007bff; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer; width: 100%; font-size: 16px; font-weight: bold; }
        button:hover { background: #0056b3; }
        #status { margin-top: 15px; font-weight: bold; text-align: center; font-size: 14px; }
    </style>
</head>
<body>

    <div class="card">
        <h2>Tool Chạy File Local</h2>
        <label>Đường dẫn file trên máy (VD: <code>C:\\Windows\\notepad.exe</code>):</label>
        <input type="text" id="filePath" placeholder="Nhập đường dẫn file...">
        
        <button onclick="runFile()">Thực Thi File</button>
        <div id="status"></div>
    </div>

    <script>
        function runFile() {
            const path = document.getElementById('filePath').value.trim();
            const statusDiv = document.getElementById('status');

            if (!path) {
                alert('Vui lòng nhập đường dẫn!');
                return;
            }

            statusDiv.style.color = '#007bff';
            statusDiv.textContent = 'Đang gửi lệnh...';

            fetch('/run?path=' + encodeURIComponent(path))
                .then(res => res.text())
                .then(msg => {
                    statusDiv.style.color = 'green';
                    statusDiv.textContent = msg;
                })
                .catch(err => {
                    statusDiv.style.color = 'red';
                    statusDiv.textContent = 'Lỗi kết nối!';
                });
        }
    </script>

</body>
</html>
`;

// 2. Tạo Server xử lý giao diện và thực thi lệnh chạy file
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Nếu gọi vào trang chủ, trả về giao diện HTML
    if (url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(htmlContent);
    } 
    // Nếu gọi lệnh chạy file
    else if (url.pathname === '/run') {
        const filePath = url.searchParams.get('path');

        if (!filePath) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Thiếu đường dẫn file!');
            return;
        }

        // Lệnh mở file trên Windows (dùng start "")
        const command = `start "" "${filePath}"`;

        exec(command, (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Không thể chạy file: ' + err.message);
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Đã chạy file thành công!');
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
    }
});

// Chạy server ở cổng 3000
server.listen(3000, () => {
    console.log('--------------------------------------------------');
    console.log('🔥 Tool JS đã khởi động thành công!');
    console.log('👉 Hãy mở trình duyệt và truy cập: http://localhost:3000');
    console.log('--------------------------------------------------');
});
