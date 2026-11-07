# NHIỆM VỤ CHI TIẾT SPRINT 1 — THÀNH VIÊN 4
## VAI TRÒ: QUALITY ASSURANCE / TESTER CHUYÊN TRÁCH

> **Dự án:** Hệ thống Quản lý Chi tiêu Cá nhân  
> **Sprint:** Sprint 1 — Tài khoản và Ví cơ bản (Thời lượng: 2 tuần / 10 ngày làm việc)  
> **Họ và tên:** `[Điền Họ và Tên]`  
> **MSSV:** `[Điền MSSV]`  
> **Nhánh Git phụ trách:** `test/QNK-api-automation-newman`, `test/QNK-test-cases-docs`  
> **Phân loại nhiệm vụ:** **Tester chuyên trách 100%** (Chịu trách nhiệm toàn diện về chất lượng, Test Case, Automation Test, Bug Tracking và Test Report của cả 3 lập trình viên)  
> **Story Point (SP) đảm nhiệm:** **17 SP Test** (T1: 9 SP + T2: 8 SP)  
> **Điểm quy đổi Sprint dự kiến:** **8.5 điểm** ($17 \times 50\%$)  

---

## 1. TỔNG QUAN TRÁCH NHIỆM
Thành viên 4 là "người gác cổng chất lượng" độc lập của dự án:
1. **Thiết lập Kế hoạch Kiểm thử (Test Plan):** Định nghĩa chiến lược kiểm thử, chuẩn bị môi trường và dữ liệu test độc lập.
2. **Kiểm thử Luồng Tài khoản (T1 — 9 SP Test):** Kiểm thử API Đăng ký (US1 của TV1), API Đăng nhập (US2 của TV2) và Giao diện Đăng ký/Đăng nhập (US3 của TV3).
3. **Kiểm thử Luồng Ví (T2 — 8 SP Test):** Kiểm thử API Tạo ví (US4 của TV2), API Danh sách ví (US5 của TV2) và Giao diện Quản lý ví (US6 của TV3).
4. **Tự động hóa & Báo cáo:** Xây dựng bộ Postman Collection tự động, thiết lập chạy Newman CLI xuất báo cáo HTML và lập tài liệu **Test Report** cuối kỳ.

---

## 2. CHI TIẾT CÁC ĐẦU VIỆC CẦN THỰC HIỆN

### PHẦN I: THIẾT LẬP KẾ HOẠCH & MÔI TRƯỜNG KIỂM THỬ (NGÀY 1 - 2)
* [ ] **Lập tài liệu Test Plan (`tests/test-cases/SPRINT_1_TEST_PLAN.md`):**
  * Định nghĩa phạm vi kiểm thử (In-scope: Đăng ký, Đăng nhập, Tạo ví, Xem danh sách ví; Out-of-scope: Giao dịch, Danh mục, Báo cáo).
  * Tiêu chí nghiệm thu chất lượng: Tỷ lệ Pass $\ge 90\%$, không còn Bug mức độ `Critical` hoặc `Major` chưa đóng.
* [ ] **Chuẩn bị CSDL & Dữ liệu kiểm thử:**
  * Thiết lập CSDL riêng: `quan_ly_chi_tieu_test`.
  * Chuẩn bị các bộ dữ liệu test: Giá trị hợp lệ, chuỗi rỗng, định dạng email sai, giá trị biên (độ dài mật khẩu, tên ví, số dư âm).

---

### PHẦN II: THỰC THI KIỂM THỬ T1 — LUỒNG TÀI KHOẢN (9 SP TEST)
Kiểm thử toàn diện cả Backend lẫn Frontend cho nhóm chức năng Tài khoản:

* [ ] **Bộ Test Cases chức năng (`tests/test-cases/TC_AUTH.md`):**
  * `TC01`: Đăng ký tài khoản với dữ liệu hợp lệ $\rightarrow$ HTTP 201; kiểm tra trực tiếp bảng `users` trong MySQL xem mật khẩu có băm BCrypt (`$2a$...`) hay không. (Manual + Automation)
  * `TC02`: Đăng ký với Email đã tồn tại $\rightarrow$ HTTP 409, thông báo trùng email. (Manual + Automation)
  * `TC03`: Đăng ký với định dạng Email sai (ví dụ `user@`) $\rightarrow$ HTTP 400. (Manual)
  * `TC11`: Đăng ký bỏ trống các trường bắt buộc $\rightarrow$ HTTP 400, thông báo rõ trường lỗi; trên UI có viền đỏ cảnh báo. (Manual)
  * `TC04`: Đăng nhập với thông tin email và mật khẩu chính xác $\rightarrow$ HTTP 200, cấp phát JWT Bearer token hợp lệ; trên UI chuyển sang `/wallets`. (Manual + Automation)
  * `TC05`: Đăng nhập sai mật khẩu $\rightarrow$ HTTP 401, thông báo an toàn *"Email hoặc mật khẩu không đúng"*. (Manual + Automation)
  * `TC12`: Đăng nhập với Email chưa từng đăng ký $\rightarrow$ HTTP 401. (Manual + Automation)
  * `TC13`: Kiểm thử luồng UI liên hoàn Đăng ký $\rightarrow$ Đăng nhập $\rightarrow$ Đăng xuất $\rightarrow$ Chặn quay lại trang ví bằng nút Back của trình duyệt. (Manual)

---

### PHẦN III: THỰC THI KIỂM THỬ T2 — LUỒNG QUẢN LÝ VÍ (8 SP TEST)
Kiểm thử toàn diện tính toàn vẹn số dư và bảo mật của module Ví:

* [ ] **Bộ Test Cases chức năng (`tests/test-cases/TC_WALLET.md`):**
  * `TC06`: Tạo ví với tên hợp lệ và số dư ban đầu $\rightarrow$ HTTP 201; kiểm tra trong CSDL bảng `wallets` lưu đúng `user_id`. (Manual + Automation)
  * `TC07`: Tạo ví với tên để trống hoặc toàn khoảng trắng $\rightarrow$ HTTP 400, thông báo lỗi. (Manual)
  * `TC15`: Tạo ví với số dư ban đầu âm $\rightarrow$ HTTP 400. (Manual)
  * `TC16`: Tạo ví với tên vượt quá 100 ký tự $\rightarrow$ HTTP 400. (Manual)
  * `TC08`: Xem danh sách khi người dùng đã có $\ge 2$ ví $\rightarrow$ HTTP 200, hiển thị đúng thứ tự mới nhất, tổng số dư trên giao diện tính chính xác. (Manual + Automation)
  * `TC09`: Xem danh sách khi người dùng mới chưa tạo ví $\rightarrow$ HTTP 200, `data: []`; trên UI hiển thị thông báo trạng thái rỗng. (Manual)
  * `TC10`: **Bảo mật sở hữu dữ liệu:** Đăng nhập User B, gọi API danh sách ví $\rightarrow$ Đảm bảo User B hoàn toàn không nhìn thấy ví của User A; tạo ví kèm `userId` giả mạo vẫn gán đúng chủ sở hữu. (Manual + Automation)
  * `TC14`: **Bảo mật xác thực:** Gọi các API ví khi không có token hoặc token sai/hết hạn $\rightarrow$ Bắt buộc trả HTTP 401/403. (Manual + Automation)

---

### PHẦN IV: TỰ ĐỘNG HÓA NEWMAN CLI & BÁO CÁO CHẤT LƯỢNG (TEST REPORT)
* [ ] **Xây dựng Postman Collection tự động (`tests/api/sprint1.postman_collection.json`):**
  * Tối thiểu **9 Automation Test Cases** (`TC01`, `TC02`, `TC04`, `TC05`, `TC12`, `TC06`, `TC08`, `TC10`, `TC14`).
  * Sử dụng biến môi trường động `test_{{$timestamp}}@example.com` để collection có thể chạy lặp lại nhiều lần không lỗi.
  * Tự động lưu `accessToken` vào environment và truyền vào các request ví tiếp theo.
* [ ] **Chạy Newman CLI xuất báo cáo HTML:**
  ```powershell
  npx newman run tests/api/sprint1.postman_collection.json -e tests/api/local.postman_environment.json -r cli,htmlextra --reporter-htmlextra-export tests/reports/sprint1-report.html
  ```
* [ ] **Lập tài liệu Test Report tổng kết (`tests/reports/SPRINT_1_TEST_REPORT.md`):**
  * Bảng tổng hợp số lượng Test Case (Tổng số TC: 16, Pass: ..., Fail: ...).
  * Tỷ lệ Pass rate ($\ge 90\%$).
  * Bảng thống kê Bug phát hiện: Mã Bug, Tên Bug, Dev phụ trách sửa, Mức độ (`Critical/Major/Minor`), Trạng thái (`Closed`).
  * Cung cấp file HTML minh chứng cho TV1 đính kèm vào file Word báo cáo nộp Giảng viên.

---

## 3. LỊCH TRÌNH 10 NGÀY CỦA THÀNH VIÊN 4

| Ngày | Chi tiết công việc thực hiện | Sản phẩm bàn giao |
| :---: | :--- | :--- |
| **Ngày 1** | Lập tài liệu **Test Plan** tổng thể; phân tích 16 Test Cases cho T1 và T2. | File `SPRINT_1_TEST_PLAN.md`. |
| **Ngày 2** | Chuẩn bị CSDL test `quan_ly_chi_tieu_test`; dựng khung Postman Collection. | Khung Postman sẵn sàng. |
| **Ngày 3** | Nhận API Đăng ký từ PR của TV1; kiểm thử `TC01`, `TC02`, `TC03`, `TC11`. | Ghi nhận Bug Đăng ký lên Jira. |
| **Ngày 4** | Nhận API Đăng nhập từ PR của TV2; kiểm thử `TC04`, `TC05`, `TC12`. | Viết Automation Script Auth. |
| **Ngày 5** | Nhận API Tạo ví từ PR của TV2; kiểm thử `TC06`, `TC07`, `TC15`, `TC16`. | Viết Automation Script Tạo ví. |
| **Ngày 6** | Nhận API Danh sách ví từ PR của TV2; kiểm thử `TC08`, `TC09`, `TC10`, `TC14`. | Toàn bộ API Backend đã được kiểm thử. |
| **Ngày 7** | Tham gia họp Mid-sprint Check; bắt đầu kiểm thử tích hợp UI trên web của TV3. | Ghi nhận Bug giao diện lên Jira. |
| **Ngày 8** | Chạy lại (Retest) toàn bộ các Bug do TV1, TV2, TV3 vừa sửa xong. | Đóng các Bug đã sửa trên Jira. |
| **Ngày 9** | Chạy Newman CLI tự động xuất báo cáo HTML; lập tài liệu **Test Report**. | File `sprint1-report.html` & Test Report. |
| **Ngày 10** | Tham gia Sprint Review: Báo cáo chất lượng phần mềm, thống kê Bug; họp Retro. | Chốt 17 SP Test sang trạng thái `Done`. |
