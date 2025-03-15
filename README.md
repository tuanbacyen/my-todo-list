# My Todo List

Ứng dụng Todo List đơn giản được xây dựng bằng HTML, CSS và JavaScript thuần, có tích hợp với GitHub để lưu trữ dữ liệu.

## Tính năng

- Thêm, xóa và đánh dấu hoàn thành công việc
- Đặt độ ưu tiên cho công việc (1-5 sao)
- Xem công việc theo ngày (hôm nay, ngày trước, ngày sau)
- Thống kê công việc đã hoàn thành và chưa hoàn thành
- Biểu đồ tiến độ hoàn thành theo ngày
- Biểu đồ phân bố độ ưu tiên
- Danh sách công việc làm liên tục
- Lưu trữ dữ liệu trên GitHub

## Cấu trúc dự án

```
my-todo-list/
├── index.html
├── styles.css
├── js/
│   ├── app.js       # Module chính của ứng dụng
│   ├── data.js      # Module xử lý dữ liệu
│   ├── ui.js        # Module xử lý giao diện người dùng
│   ├── stats.js     # Module xử lý thống kê
│   ├── charts.js    # Module xử lý biểu đồ
│   └── github.js    # Module tích hợp với GitHub
└── data/            # Thư mục chứa dữ liệu
```

## Cách sử dụng

1. Mở file `index.html` trong trình duyệt
2. Nhập tên công việc và chọn độ ưu tiên
3. Nhấn nút "Thêm công việc" để thêm công việc mới
4. Sử dụng các nút điều hướng để xem công việc của các ngày khác
5. Nhấn nút "Lưu lên GitHub" để lưu dữ liệu lên GitHub

## Tích hợp GitHub

Ứng dụng sử dụng GitHub API để lưu trữ dữ liệu. Dữ liệu được lưu theo tháng trong thư mục `data/` với định dạng `YYYY-MM.json`.

## Yêu cầu

- Trình duyệt hiện đại hỗ trợ JavaScript ES6
- Kết nối internet để sử dụng tính năng lưu trữ trên GitHub

## Tác giả

- tuanbacyen

## Giấy phép

MIT
