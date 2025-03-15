# Todo Data

Thư mục này chứa các file dữ liệu của ứng dụng Todo List.

## Cấu trúc dữ liệu

Dữ liệu được lưu trữ theo tháng, mỗi tháng một file JSON riêng biệt với định dạng `YYYY-MM.json`.

Ví dụ:

- `2023-01.json`: Dữ liệu tháng 1 năm 2023
- `2023-02.json`: Dữ liệu tháng 2 năm 2023

## Cấu trúc file JSON

Mỗi file JSON có cấu trúc như sau:

```json
{
  "01": [
    {
      "id": "unique-id-1",
      "name": "Tên công việc 1",
      "priority": 3,
      "completed": false
    },
    {
      "id": "unique-id-2",
      "name": "Tên công việc 2",
      "priority": 5,
      "completed": true
    }
  ],
  "02": [
    {
      "id": "unique-id-3",
      "name": "Tên công việc 3",
      "priority": 2,
      "completed": false
    }
  ]
}
```

Trong đó:

- Các key cấp 1 là ngày trong tháng (01, 02, ..., 31)
- Mỗi ngày chứa một mảng các công việc
- Mỗi công việc có các thuộc tính:
  - `id`: ID duy nhất của công việc
  - `name`: Tên công việc
  - `priority`: Độ ưu tiên (1-5)
  - `completed`: Trạng thái hoàn thành (true/false)

## Lưu ý

- Dữ liệu được tự động lưu vào localStorage làm bản sao dự phòng
- Khi commit lên GitHub, dữ liệu sẽ được lưu vào các file JSON trong thư mục này
