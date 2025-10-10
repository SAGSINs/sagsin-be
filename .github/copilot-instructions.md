## 🎯 Mục tiêu chính

* Xây dựng và duy trì **backend ổn định** cho mô phỏng và giám sát topology mạng SAGSIN.
* Giữ cấu trúc **dịch vụ tách biệt, rõ ràng** (API, gRPC, data store, simulation logic).
* Đảm bảo dự án **chạy ổn định** trong môi trường Docker và local dev.
* Cung cấp **quy tắc kiểm thử và CI** rõ ràng để PR nhỏ gọn, dễ review, dễ merge.

---

## 🏛 Tổng quan kiến trúc

```
				┌────────────────────────────────────────┐
				│               SAGSIN-BE                 │
				│----------------------------------------│
				│ REST / GraphQL / gRPC API               │
				│----------------------------------------│
				│ Simulation & Topology Service           │
				│----------------------------------------│
				│ Data Layer (Mongo / In-memory for tests)│
				│----------------------------------------│
				│ Worker / Scheduler / Heuristics client  │
				└────────────────────────────────────────┘
```

---

## 🧰 Hướng dẫn ngôn ngữ & framework

* **Ngôn ngữ chính:** TypeScript (Node.js) – tuân thủ conventions sẵn có của dự án.
* Sử dụng **NestJS** cho service/controller (module, provider, DTO).
* Dùng **gRPC** cho giao tiếp giữa các service (nơi có định nghĩa `.proto`).
* Giữ số lượng thư viện ngoài ở mức tối thiểu, và **cập nhật `package.json` khi thêm phụ thuộc mới**.

---

## ✅ Quy tắc code & PR dành cho Copilot

* **Tuân thủ style & lint hiện có**. Nếu repo chưa có, dùng Prettier + ESLint mặc định.
* Mỗi PR nên nhỏ, tập trung vào **một feature hoặc bugfix duy nhất**.
* Khi thay đổi **interface công khai** (DTO, gRPC), thêm hướng dẫn migration và cập nhật code sinh tự động.
* Luôn dùng **DTO có type**, validation pipes trong NestJS, và xử lý lỗi rõ ràng.

---

## 🔧 Các thao tác thường gặp

* **Thêm endpoint REST mới:**

  * Tạo DTO, thêm method trong controller, kết nối service, và viết unit test.

* **Thêm / sửa gRPC contract:**

  * Cập nhật file `.proto` trong `src/proto/`, ghi rõ lệnh sinh code, implement server/client tương ứng.

* **Docker hoá service:**

  * Giữ image nhỏ nhất có thể: dùng `node:slim` hoặc `alpine`,
    áp dụng **multi-stage build** để giảm kích thước.