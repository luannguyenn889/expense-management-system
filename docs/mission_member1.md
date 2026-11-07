# NHIỆM VỤ CHI TIẾT SPRINT 1 — THÀNH VIÊN 1
## VAI TRÒ: SCRUM MASTER KIÊM DEVELOPER BACKEND

> **Dự án:** Hệ thống Quản lý Chi tiêu Cá nhân  
> **Sprint:** Sprint 1 — Tài khoản và Ví cơ bản (Thời lượng: 2 tuần / 10 ngày làm việc)  
> **Họ và tên:** `[Điền Họ và Tên]`  
> **MSSV:** `[Điền MSSV]`  
> **Nhánh Git phụ trách:** `chore/QNK-setup-backend`, `feature/QNK-user-register-api`  
> **Phân loại nhiệm vụ:** **Developer chuyên trách + Quản trị Scrum**  
> **Story Point (SP) đảm nhiệm:** **3 SP Dev**  
> **Điểm quy đổi Sprint dự kiến:** **3.0 điểm**  

---

## 1. TỔNG QUAN TRÁCH NHIỆM
1. **Quản trị Scrum Master:** Điều phối dự án Agile trên Jira, chủ trì Daily Scrum, review PR và tổng hợp báo cáo môn học.
2. **Setup Base Backend:** Chuẩn hóa `pom.xml`, cấu hình MySQL, xây dựng `ApiResponse<T>`, `GlobalExceptionHandler`.
3. **Phát triển Backend (3 SP Dev):** Hoàn thành **US1: [BE] Đăng ký tài khoản** (băm BCrypt, 4 Unit Test `UserServiceTest` đạt coverage $\ge 80\%$).

---

## 2. CHI TIẾT CÁC ĐẦU VIỆC CẦN THỰC HIỆN

### PHẦN I: NHIỆM VỤ SCRUM MASTER & QUẢN TRỊ DỰ ÁN
* [ ] **Khởi tạo và cấu hình Sprint 1 trên Jira:**
  * Tạo Sprint: `QNK Sprint 1 — Tài khoản và Ví cơ bản`.
  * Nhập mục tiêu Sprint (Sprint Goal): *"Hoàn thiện luồng đăng ký, đăng nhập, tạo ví và xem danh sách ví; đảm bảo các chức năng hoạt động với MySQL, có Unit Test, Test Case, Automation Test và có thể demo."*
  * Tạo 6 User Stories (`US1` $\rightarrow$ `US6`) cho Dev và 2 Task Test (`T1`, `T2`) cho Tester.
* [ ] **Điều phối nghi thức Scrum hàng ngày:**
  * Tổ chức họp **Daily Scrum** (10 - 15 phút): Giám sát tiến độ của TV2, TV3, TV4.
  * Cập nhật bảng Kanban/Scrum trên Jira: Đảm bảo các task di chuyển đúng trạng thái (`To Do` $\rightarrow$ `In Progress` $\rightarrow$ `In Review` $\rightarrow$ `Done`).
  * Tổ chức họp **Mid-sprint Check** (Ngày 7): Đánh giá rủi ro, gỡ vướng blocker.
* [ ] **Quản trị Repository & Kiểm duyệt mã nguồn (Code Review):**
  * Khởi tạo nhánh `develop` từ `main`.
  * Review toàn bộ Pull Request của TV2 (BE) và TV3 (FE); đảm bảo kiểm tra Unit Test Pass trước khi merge.
* [ ] **Tổng hợp Báo cáo Sprint 1:**
  * Thu thập minh chứng: Burndown Chart, Jira Board, kết quả `mvn test`, `npm run test` và file HTML Newman từ TV4.
  * Hoàn thành file Word báo cáo nộp Giảng viên.

### PHẦN II: THIẾT LẬP NỀN TẢNG KỸ THUẬT DÙNG CHUNG (NGÀY 1)
* [ ] Cập nhật `backend/pom.xml`: Bổ sung `spring-boot-starter-validation`, `spring-boot-starter-security`, thư viện JWT (`jjwt`), và H2 database cho test.
* [ ] Cập nhật `backend/src/main/resources/application.properties`: Trỏ database `quan_ly_chi_tieu`.
* [ ] Tạo lớp chuẩn hóa phản hồi `ApiResponse<T>` (`dto.response`).
* [ ] Tạo bộ xử lý lỗi tập trung `GlobalExceptionHandler.java` và các Custom Exception (`DuplicateResourceException`, `ResourceNotFoundException`, `UnauthorizedException`).

### PHẦN III: PHÁT TRIỂN USER STORY US1 — [BE] ĐĂNG KÝ TÀI KHOẢN (3 SP DEV)
* [ ] Refactor Entity `User` và `UserRepository`: Ánh xạ chuẩn với bảng `users` (`user_id`, `username`, `full_name`, `email`, `password_hash`, `created_at`, `updated_at`).
* [ ] Tạo DTO `UserCreationRequest` (validate `@NotBlank`, `@Size(min=3, max=50)` cho `username`, `@NotBlank`, `@Email`, `@Size(min=8, max=72)`), `UserResponse` (không lộ password hash, có `username`).
* [ ] Xây dựng `UserService.register()`: Chuẩn hóa username và email, kiểm tra trùng lặp $\rightarrow$ ném lỗi 409, băm mật khẩu bằng BCrypt (`PasswordEncoder`) trước khi lưu.
* [ ] Endpoint Controller: `POST /api/v1/users/register`.
* [ ] **Viết 4 Unit Test bắt buộc (`UserServiceTest.java`):**
  1. `register_withValidData_shouldReturnUserResponse()`
  2. `register_withExistingEmail_shouldThrowDuplicateResourceException()`
  3. `register_withValidData_shouldHashPasswordBeforeSave()`
  4. `register_withUppercaseEmail_shouldNormalizeToLowercase()`

---

## 3. LỊCH TRÌNH 10 NGÀY CỦA THÀNH VIÊN 1

| Ngày | Chi tiết công việc thực hiện | Sản phẩm bàn giao |
| :---: | :--- | :--- |
| **Ngày 1** | Chủ trì Sprint Planning, tạo Jira, setup `pom.xml`, cấu hình DB. | Sprint 1 Started; PR setup backend merge. |
| **Ngày 2** | Code `ApiResponse`, `GlobalExceptionHandler`, refactor `User` entity. | Tầng Core backend hoàn tất. |
| **Ngày 3** | Viết DTO, code `UserService.register()` băm BCrypt + 4 Unit Test. | `mvn test` Pass; Mở PR US1. |
| **Ngày 4** | Review PR US2 của TV2; tích hợp MySQL; bàn giao API cho TV4 test. | PR US1 merge; TV4 bắt đầu test đăng ký. |
| **Ngày 5** | Kiểm tra Burndown Chart Jira; review PR US4 của TV2. | Tiến độ tuần 1 đạt $\ge 50\%$. |
| **Ngày 6** | Hỗ trợ TV3 kết nối giao diện Angular với API Đăng ký. | Luồng đăng ký FE-BE thông suốt. |
| **Ngày 7** | Chủ trì họp Mid-sprint Check; review PR US5 của TV2. | Đánh giá tiến độ giữa kỳ. |
| **Ngày 8** | Hỗ trợ giải quyết các blocker kỹ thuật chung của nhóm. | Sạch lỗi blocker trên nhánh `develop`. |
| **Ngày 9** | Kiểm tra code coverage; chuẩn bị kịch bản demo cho buổi Review. | Khung báo cáo Word hoàn thiện. |
| **Ngày 10** | Chủ trì Sprint Review & Retrospective; nộp Báo cáo Sprints. | Sprint 1 Completed trên Jira; Báo cáo Word hoàn chỉnh. |
