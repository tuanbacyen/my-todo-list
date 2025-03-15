# My Todo List

Ứng dụng Todo List đơn giản giúp quản lý các công việc cần làm hàng ngày, với khả năng đánh giá độ ưu tiên và lưu trữ dữ liệu theo tháng.

## Tính năng

- Thêm công việc mới với tên và độ ưu tiên (từ 1 đến 5 sao)
- Sắp xếp công việc theo độ ưu tiên từ cao đến thấp
- Đánh dấu công việc đã hoàn thành
- Xóa công việc
- Chuyển đổi giữa các ngày khác nhau
- Lưu trữ dữ liệu trong localStorage làm bản sao dự phòng
- Lưu trữ dữ liệu chính trong các file JSON theo tháng
- Thống kê công việc hoàn thành và độ ưu tiên (hôm nay, hôm qua, 7 ngày qua)
- Biểu đồ tiến độ hoàn thành theo ngày và phân bố độ ưu tiên
- Hiển thị danh sách công việc làm liên tục
- Commit dữ liệu trực tiếp lên GitHub

## Cách sử dụng

1. Mở file `index.html` trong trình duyệt web
2. Nhập tên công việc và chọn độ ưu tiên (số sao)
3. Nhấn nút "Thêm công việc" để thêm vào danh sách
4. Sử dụng các nút điều hướng để chuyển đổi giữa các ngày
5. Xem thống kê và biểu đồ để theo dõi tiến độ
6. Kiểm tra danh sách công việc làm liên tục để biết thói quen của bạn
7. Cấu hình GitHub (token, username, repository) để sử dụng tính năng commit
8. Nhấn nút "Commit lên GitHub" để lưu dữ liệu trực tiếp lên GitHub

## Cấu trúc dự án

Dự án được tổ chức theo cấu trúc module để dễ bảo trì và mở rộng:

```
my-todo-list/
├── index.html          # File HTML chính
├── styles.css          # File CSS
├── js/                 # Thư mục chứa các module JavaScript
│   ├── app.js          # Module chính của ứng dụng
│   ├── data.js         # Module xử lý dữ liệu
│   ├── ui.js           # Module xử lý giao diện người dùng
│   ├── stats.js        # Module xử lý thống kê
│   ├── charts.js       # Module xử lý biểu đồ
│   └── github.js       # Module xử lý tích hợp GitHub
├── data/               # Thư mục chứa dữ liệu
│   ├── README.md       # Mô tả cấu trúc dữ liệu
│   └── YYYY-MM.json    # File dữ liệu theo tháng
└── README.md           # File README chính
```

## Cấu trúc dữ liệu

Dữ liệu được lưu trữ theo cấu trúc JSON như sau:

```json
{
  "01": [
    {
      "id": "unique-id-1",
      "name": "Tên công việc",
      "priority": 3,
      "completed": false
    }
  ],
  "02": [
    {
      "id": "unique-id-2",
      "name": "Tên công việc khác",
      "priority": 5,
      "completed": true
    }
  ]
}
```

Trong đó:

- Mỗi file JSON đại diện cho một tháng (tên file: `YYYY-MM.json`)
- Các key cấp 1 là ngày trong tháng (01, 02, ..., 31)
- Mỗi ngày chứa một mảng các công việc
- Mỗi công việc có các thuộc tính: id, tên, độ ưu tiên, trạng thái hoàn thành

## Thống kê và Biểu đồ

Ứng dụng cung cấp các thống kê và biểu đồ sau:

1. **Thống kê**:

   - Số lượng công việc đã hoàn thành và tổng số công việc
   - Tổng độ ưu tiên của các công việc đã hoàn thành
   - Tổng độ ưu tiên của các công việc chưa hoàn thành
   - Thống kê cho hôm nay, hôm qua và 7 ngày qua

2. **Biểu đồ**:

   - Biểu đồ cột hiển thị tiến độ hoàn thành theo ngày (7 ngày gần nhất)
   - Biểu đồ tròn hiển thị phân bố độ ưu tiên của tất cả công việc

3. **Công việc liên tục**:
   - Danh sách các công việc xuất hiện từ 3 lần trở lên
   - Hiển thị tên công việc, tần suất và độ ưu tiên

## Tích hợp GitHub

Để sử dụng tính năng commit lên GitHub:

1. Nhập GitHub Personal Access Token (cần có quyền repo)
2. Nhập tên người dùng GitHub
3. Nhập tên repository
4. Lưu cấu hình
5. Nhấn nút "Commit lên GitHub" để đẩy dữ liệu lên repository

Lưu ý:

- Dữ liệu sẽ được lưu trong thư mục `data/` của repository
- Mỗi tháng sẽ được lưu thành một file JSON riêng biệt
- Commit message được tạo tự động với định dạng "Update todos for YYYY-MM - [Ngày giờ]"

## Triển khai trên GitHub Pages

Để triển khai ứng dụng này trên GitHub Pages:

1. Đẩy code lên repository GitHub của bạn
2. Vào phần Settings của repository
3. Tìm đến mục Pages
4. Chọn branch main (hoặc master) và thư mục root (/)
5. Nhấn Save để triển khai

Sau khi triển khai, ứng dụng sẽ có sẵn tại địa chỉ: `https://<username>.github.io/<repository-name>/`

## Lưu ý

- Dữ liệu được lưu trong localStorage của trình duyệt làm bản sao dự phòng
- Dữ liệu chính được lưu trong các file JSON trong thư mục `data/`
- Token GitHub được lưu trong localStorage, hãy đảm bảo sử dụng trên thiết bị an toàn
- Nên sử dụng tính năng "Commit lên GitHub" thường xuyên để sao lưu dữ liệu
