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
7. Nhấn nút "Xuất dữ liệu" để tải xuống file JSON chứa tất cả dữ liệu
8. Nhấn nút "Commit lên GitHub" để lưu dữ liệu trực tiếp lên GitHub

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

## Commit lên GitHub

Để sử dụng tính năng commit lên GitHub:

1. Nhấn nút "Commit lên GitHub"
2. Nhập thông điệp commit
3. Nhấn "Xác nhận" để đẩy dữ liệu lên repository

Lưu ý: Tính năng này yêu cầu bạn có quyền truy cập vào repository GitHub. Token đã được mã hóa nhẹ trong mã nguồn.

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
- Sử dụng tính năng "Xuất dữ liệu" hoặc "Commit lên GitHub" để sao lưu dữ liệu quan trọng
- Token GitHub đã được mã hóa nhẹ, nhưng vẫn nên thay thế bằng token của riêng bạn nếu sử dụng trong môi trường sản xuất
