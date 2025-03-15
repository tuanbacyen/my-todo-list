# My Todo List

Ứng dụng Todo List đơn giản giúp quản lý các công việc cần làm hàng ngày, với khả năng đánh giá độ ưu tiên và lưu trữ dữ liệu theo tháng.

## Tính năng

- Thêm công việc mới với tên và độ ưu tiên (từ 1 đến 5 sao)
- Sắp xếp công việc theo độ ưu tiên từ cao đến thấp
- Đánh dấu công việc đã hoàn thành
- Xóa công việc
- Chuyển đổi giữa các ngày khác nhau
- Lưu trữ dữ liệu trong localStorage
- Xuất dữ liệu dưới dạng file JSON

## Cách sử dụng

1. Mở file `index.html` trong trình duyệt web
2. Nhập tên công việc và chọn độ ưu tiên (số sao)
3. Nhấn nút "Thêm công việc" để thêm vào danh sách
4. Sử dụng các nút điều hướng để chuyển đổi giữa các ngày
5. Nhấn nút "Xuất dữ liệu" để tải xuống file JSON chứa tất cả dữ liệu

## Cấu trúc dữ liệu

Dữ liệu được lưu trữ theo cấu trúc JSON như sau:

```json
{
  "YYYY-MM": {
    "DD": [
      {
        "id": 1234567890,
        "name": "Tên công việc",
        "priority": 3,
        "completed": false,
        "createdAt": "2023-05-20T08:30:00.000Z"
      }
    ]
  }
}
```

Trong đó:

- `YYYY-MM`: Năm và tháng (ví dụ: "2023-05")
- `DD`: Ngày trong tháng (ví dụ: "20")
- Mỗi công việc có các thuộc tính: id, tên, độ ưu tiên, trạng thái hoàn thành và thời gian tạo

## Triển khai trên GitHub Pages

Để triển khai ứng dụng này trên GitHub Pages:

1. Đẩy code lên repository GitHub của bạn
2. Vào phần Settings của repository
3. Tìm đến mục Pages
4. Chọn branch main (hoặc master) và thư mục root (/)
5. Nhấn Save để triển khai

Sau khi triển khai, ứng dụng sẽ có sẵn tại địa chỉ: `https://<username>.github.io/<repository-name>/`

## Lưu ý

- Dữ liệu được lưu trong localStorage của trình duyệt, vì vậy sẽ bị mất nếu xóa cache
- Sử dụng tính năng "Xuất dữ liệu" để sao lưu dữ liệu quan trọng
- Để commit dữ liệu lên GitHub, bạn cần tải xuống file JSON và đẩy lên repository thủ công
