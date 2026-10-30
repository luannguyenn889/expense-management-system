# NHIỆM VỤ THÀNH VIÊN — SPRINT 1 (MISSION SPRINT 1)
## MÔ HÌNH: PHÂN CÔNG KIỂM THỬ CHÉO (CROSS-TESTING MODEL)

> **Dự án:** Hệ thống Quản lý Chi tiêu Cá nhân  
> **Sprint:** Sprint 1 — Tài khoản và Ví cơ bản  
> **Thời gian:** 2 tuần (10 ngày làm việc)  
> **Quy mô:** Nhóm 4 thành viên  
> **Mô hình triển khai:** **Kiểm thử chéo (Cross-Testing)** — TV1 tập trung điều phối & nền tảng; TV2, TV3, TV4 **vừa tham gia phát triển (Code + Unit Test) vừa tham gia kiểm thử độc lập (Test Case + Automation Test)** theo quy tắc kiểm thử chéo khách quan.

---

## 1. BẢNG TỔNG QUAN PHÂN CÔNG, STORY POINT & ĐIỂM QUY ĐỔI

Theo mẫu báo cáo môn học Phát triển PMCN:
- **Story Code (Developer):** Điểm quy đổi = $100\% \times \text{SP hoàn thành}$. Bắt buộc phải có Unit Test đi kèm.
- **Story Test (Tester):** Điểm quy đổi = $50\% \times \text{SP Test hoàn thành}$. Bắt buộc phải có Test Case (Manual) hoặc Test Script (Automation) và Test Report.
- **Nguyên tắc kiểm thử chéo:** Người viết code **không tự kiểm thử chức năng/hệ thống** cho chính mã nguồn của mình để đảm bảo tính khách quan và phát hiện lỗi tối đa.

| STT | Thành viên | Vai trò chính | Chức năng Code (Dev) | SP Dev | Chức năng Kiểm thử (Test chéo) | SP Test | Tổng điểm quy đổi |
| :-: | :--- | :--- | :--- | :-: | :--- | :-: | :---: |
| **1** | **Thành viên 1** | **Scrum Master kiêm Dev BE** | Nền tảng BE dùng chung + `US1: [BE] Đăng ký tài khoản` | **3** | *(Tập trung quản trị Jira, Daily, Review PR, Báo cáo)* | — | **3.0** |
| **2** | **Thành viên 2** | **Dev BE kiêm Tester** | `US2: [BE] Đăng nhập` (3) + `US4: [BE] Tạo ví` (3) | **6** | `T_FE1: [TEST] Giao diện đăng ký & đăng nhập (US3)` | **3** | $6 + 3 \times 0.5 =$ **7.5** |
| **3** | **Thành viên 3** | **Dev FE kiêm Tester** | `US3: [FE] Giao diện ĐK/ĐN` (3) + `US6: [FE] Giao diện ví` (3) | **6** | `T_BE2: [TEST] API Tạo ví (US4) & Xem danh sách ví (US5)` | **5** | $6 + 5 \times 0.5 =$ **8.5** |
| **4** | **Thành viên 4** | **Dev BE kiêm Tester chính** | `US5: [BE] Xem danh sách ví` | **2** | `T_BE1: [TEST] API Đăng ký (US1), Đăng nhập (US2)` (6)<br>`T_FE2: [TEST] Giao diện Quản lý ví (US6)` (3) | **9** | $2 + 9 \times 0.5 =$ **6.5** |
| | **TỔNG CỘNG** | **4 Thành viên** | **6 User Stories** | **17 SP** | **4 Nhiệm vụ Test chéo** | **17 SP** | **25.5** |

---

## 2. NHIỆM VỤ CHI TIẾT TỪNG THÀNH VIÊN

---

### 2.1. THÀNH VIÊN 1: SCRUM MASTER KIÊM BACKEND DEVELOPER

* **Họ tên / MSSV:** `[Điền họ tên & MSSV]`
* **Đảm nhiệm chính:** Quản trị quy trình Scrum, thiết lập hạ tầng Backend dùng chung, phát triển API Đăng ký tài khoản (US1).

#### A. Nhiệm vụ Scrum Master (Điều phối & Quản trị)
1. **Quản trị Jira:**
   - Khởi tạo Sprint 1 trên Jira với Sprint Goal và thời hạn 2 tuần.
   - Tạo đầy đủ 6 User Stories (`US1` → `US6`) và 4 Story Test (`T_FE1`, `T_BE2`, `T_BE1`, `T_FE2`) kèm Description, Acceptance Criteria và Sub-tasks.
   - Theo dõi tiến độ hằng ngày qua Burndown Chart, giám sát luồng (`To Do` → `In Progress` → `In Review` → `Done`).
2. **Nghi thức Scrum:**
   - Chủ trì cuộc họp **Daily Scrum** hằng ngày (15 phút).
   - Chủ trì buổi **Sprint Planning** (Ngày 1), **Mid-sprint Check** (Ngày 7) và **Sprint Review / Retrospective** (Ngày 10).
3. **Quản trị Git & Chất lượng:**
   - Khởi tạo nhánh `develop` từ `main`. Duyệt Pull Request (review code) chuẩn theo [CODING_CONVENTIONS.md](../CODING_CONVENTIONS.md).
   - Đảm bảo kiểm tra Unit Test Pass trước khi merge vào `develop`.
   - Tổng hợp số liệu báo cáo Sprint nộp môn học theo mẫu Word quy định.

#### B. Nhiệm vụ Kỹ thuật Backend (US1 + Nền tảng dùng chung — 3 SP)
1. **Thiết lập nền tảng dự án (Thực hiện ngay Ngày 1):**
   - Cập nhật file `backend/pom.xml`: Bổ sung `spring-boot-starter-validation`, `spring-boot-starter-security`, thư viện JWT (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`), và H2 database cho môi trường Test.
   - Cập nhật `backend/src/main/resources/application.properties`: Trỏ đúng Database name `quan_ly_chi_tieu`, đổi `hibernate.ddl-auto=validate`.
   - Cập nhật file `backend/.env.example` chuẩn.
2. **Xây dựng tầng Core / Utility dùng chung:**
   - Xây dựng lớp chuẩn hóa phản hồi `ApiResponse<T>` (`code`, `message`, `data`).
   - Xây dựng bộ xử lý ngoại lệ tập trung `GlobalExceptionHandler` (`@RestControllerAdvice`).
   - Tạo các Custom Exception: `ResourceNotFoundException`, `DuplicateResourceException`, `UnauthorizedException`.
3. **Thực thi US1 — [BE] Đăng ký tài khoản (3 SP):**
   - Refactor Entity `User` và `UserRepository`: Ánh xạ chuẩn theo bảng `users` (`user_id`, `full_name`, `email`, `password_hash`, `created_at`, `updated_at`).
   - Gỡ bỏ các endpoint CRUD user cũ không an toàn (`GET /users`, `DELETE /users/{id}`).
   - Viết DTO: `UserCreationRequest` (validate `@NotBlank`, `@Email`, `@Size(min=8, max=72)`), `UserResponse`.
   - Viết Service & Controller: `UserService.register()` thực hiện chuẩn hóa email chữ thường, kiểm tra trùng lặp, băm mật khẩu bằng BCrypt (`PasswordEncoder`) trước khi lưu; xây dựng endpoint `POST /api/v1/users/register`.
   - **Viết Unit Test (JUnit 5 + Mockito + AssertJ):** Tạo `UserServiceTest` với độ bao phủ ≥ 80%:
     - `register_withValidData_shouldReturnUserResponse()`
     - `register_withExistingEmail_shouldThrowDuplicateResourceException()`
     - `register_withValidData_shouldHashPasswordBeforeSave()`
     - `register_withUppercaseEmail_shouldNormalizeToLowercase()`

---

### 2.2. THÀNH VIÊN 2: BACKEND DEVELOPER KIÊM TESTER

* **Họ tên / MSSV:** `[Điền họ tên & MSSV]`
* **Đảm nhiệm chính:** Xây dựng hệ thống Security/JWT, phát triển API Đăng nhập (US2) + Tạo ví (US4); kiêm kiểm thử chéo giao diện Đăng ký & Đăng nhập (US3).

#### A. Nhiệm vụ Phát triển Backend (6 SP Dev)
1. **US2 — [BE] Đăng nhập hệ thống (3 SP):**
   - Xây dựng `SecurityConfig`: Stateless, tắt CSRF, phân quyền endpoint công khai, cấu hình CORS cho Angular (`http://localhost:4200`).
   - Khởi tạo Bean `PasswordEncoder` (BCrypt).
   - Xây dựng `JwtTokenProvider` (tạo/giải mã token chứa `userId`) và `JwtAuthenticationFilter`.
   - Xây dựng tiện ích `SecurityUtils.getCurrentUserId()`.
   - Viết DTO `LoginRequest`, `LoginResponse`, `AuthService.login()` (so khớp mật khẩu BCrypt, trả JWT token), endpoint `POST /api/v1/auth/login`.
   - **Unit Test US2:** `login_withValidCredentials_shouldReturnToken()`, `login_withWrongPassword_shouldThrowUnauthorizedException()`, `login_withNonExistingEmail_shouldThrowUnauthorizedException()`, `generateToken_thenGetUserIdFromToken_shouldReturnSameUserId()`.
2. **US4 — [BE] Tạo ví mới (3 SP):**
   - Tạo Entity `Wallet` và `WalletRepository` khớp bảng `wallets`.
   - Tạo DTO `WalletCreateRequest` (validate `@NotBlank`, `@Size(max=100)`, `@DecimalMin(0.00)`), `WalletResponse`.
   - Viết `WalletService.createWallet()`: Luôn gán `userId` trích xuất từ JWT token, số dư mặc định 0.00 nếu không truyền, endpoint `POST /api/v1/wallets`.
   - **Unit Test US4:** `createWallet_withValidData_shouldReturnCreatedWallet()`, `createWallet_withoutInitialBalance_shouldDefaultToZero()`, `createWallet_withValidData_shouldAssignCurrentUserId()`, `createWallet_whenUserNotExists_shouldThrowResourceNotFoundException()`.

#### B. Nhiệm vụ Kiểm thử chéo (3 SP Test)
* **Task: `T_FE1 — [TEST] Kiểm thử Giao diện Đăng ký & Đăng nhập (US3 của TV3)`**
  1. Viết bộ **Test Case thủ công (UI/UX)** cho màn hình Đăng ký và Đăng nhập:
     - Kiểm tra validate client-side: để trống trường, email sai định dạng, mật khẩu < 8 ký tự, xác nhận mật khẩu không khớp.
     - Kiểm tra trạng thái disable của nút submit khi form invalid hoặc đang gửi request.
     - Kiểm tra hiển thị thông báo lỗi khi Backend trả 400, 401, 409.
     - Kiểm tra hành vi chuyển trang (Đăng ký thành công $\rightarrow$ chuyển sang `/login`; Đăng nhập thành công $\rightarrow$ lưu token và chuyển sang `/wallets`).
     - Kiểm tra `authGuard`: Chưa đăng nhập truy cập trực tiếp `/wallets` phải bị chặn và chuyển về `/login`.
  2. Ghi nhận Bug trên Jira, phối hợp với TV3 để sửa lỗi và retest.

---

### 2.3. THÀNH VIÊN 3: FRONTEND DEVELOPER KIÊM TESTER

* **Họ tên / MSSV:** `[Điền họ tên & MSSV]`
* **Đảm nhiệm chính:** Xây dựng toàn bộ giao diện Web Angular 21 (US3, US6); kiêm kiểm thử chéo API Tạo ví và Xem danh sách ví (US4, US5).

#### A. Nhiệm vụ Phát triển Frontend Angular (6 SP Dev)
1. **Khởi tạo & Cấu trúc nền tảng (Ngày 1 - 2):**
   - Dọn trang mẫu CLI trong `app.html`; tổ chức thư mục `core/`, `features/`, `shared/` theo [CODING_CONVENTIONS.md](../CODING_CONVENTIONS.md).
   - Thiết lập `src/environments/environment.ts` (`apiUrl: 'http://localhost:8080/api/v1'`).
   - Cấu hình `app.config.ts`: `provideHttpClient(withInterceptors([authInterceptor]))`.
   - Viết `core/models/`, `auth.service.ts` (quản lý signal `currentUser`, token), `auth.interceptor.ts`, `auth.guard.ts`.
2. **US3 — [FE] Giao diện Đăng ký và Đăng nhập (3 SP):**
   - Component `features/auth/register`: Reactive Form gồm Họ tên, Email, Mật khẩu, Xác nhận mật khẩu; validate trực quan.
   - Component `features/auth/login`: Reactive Form gồm Email, Mật khẩu.
   - **Component Test (Vitest + TestBed):** `register.spec.ts`, `login.spec.ts`, `auth.service.spec.ts` (HttpTestingController).
3. **US6 — [FE] Giao diện Quản lý ví (3 SP):**
   - Service `core/services/wallet.service.ts`: `getWallets()`, `createWallet()`.
   - Pipe `shared/pipes/currency-vnd.pipe.ts`: Định dạng tiền Việt Nam (`1.000.000 ₫`).
   - Component `features/wallet/wallet-list`: Hiển thị danh sách ví (`@for … track wallet.walletId`), tổng số dư bằng `computed()`, trạng thái rỗng bằng `@empty`. Nút **Đăng xuất** xóa token và đưa về `/login`.
   - Component `features/wallet/wallet-create-form`: Form/modal nhập tên ví và số dư ban đầu, cập nhật danh sách ngay khi tạo thành công.
   - **Component Test:** `wallet-list.spec.ts`, `wallet-create-form.spec.ts`, `currency-vnd.pipe.spec.ts`.

#### B. Nhiệm vụ Kiểm thử chéo (5 SP Test)
* **Task: `T_BE2 — [TEST] Kiểm thử API Tạo ví (US4 của TV2) & Xem ví (US5 của TV4)`**
  1. Viết **Test Case và kịch bản Postman** kiểm thử chức năng API Ví:
     - Tạo ví thành công với tên hợp lệ và số dư ban đầu.
     - Tạo ví khi không truyền số dư ban đầu (mặc định 0.00).
     - Tạo ví thất bại khi tên ví trống / toàn khoảng trắng / vượt 100 ký tự (HTTP 400).
     - Tạo ví thất bại khi số dư âm (HTTP 400).
     - Lấy danh sách ví khi đã có ví (đúng thứ tự mới nhất, số dư chính xác).
     - Lấy danh sách ví khi chưa có ví (trả `data: []`).
     - **Bảo mật sở hữu:** Gọi API không có Bearer token $\rightarrow$ HTTP 401; kiểm tra User B không bao giờ thấy ví của User A.
  2. Xây dựng Postman Collection tự động hóa cho các kịch bản trên, tạo Bug trên Jira cho TV2 và TV4 nếu có lỗi.

---

### 2.4. THÀNH VIÊN 4: BACKEND DEVELOPER KIÊM TESTER CHÍNH

* **Họ tên / MSSV:** `[Điền họ tên & MSSV]`
* **Đảm nhiệm chính:** Phát triển API Xem danh sách ví (US5); kiêm Tester chính chịu trách nhiệm quản lý kế hoạch kiểm thử tổng thể, kiểm thử API Auth (US1, US2), kiểm thử giao diện Quản lý ví (US6), điều phối Automation Newman và lập Test Report.

#### A. Nhiệm vụ Phát triển Backend (2 SP Dev)
1. **US5 — [BE] Xem danh sách ví (2 SP):**
   - Thêm phương thức truy vấn trong `WalletRepository`: `findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId)`.
   - Viết `WalletService.getWalletsByUser()`: Lấy `userId` từ token, truy vấn ra danh sách ví của người dùng đang đăng nhập. Trả về mảng rỗng `[]` nếu người dùng chưa có ví.
   - Viết endpoint `GET /api/v1/wallets` (bắt buộc kèm JWT token).
   - **Viết Unit Test US5:**
     - `getWalletsByUser_whenUserHasWallets_shouldReturnList()`
     - `getWalletsByUser_whenNoWallet_shouldReturnEmptyList()`
     - `getWalletsByUser_shouldQueryOnlyCurrentUserId()`

#### B. Nhiệm vụ Kiểm thử chéo & Quản lý chất lượng (9 SP Test)
1. **Quản lý kế hoạch kiểm thử chung:**
   - Lập tài liệu **Test Plan** tổng thể cho Sprint 1 ngay từ Ngày 1.
   - Chuẩn bị CSDL kiểm thử sạch (`quan_ly_chi_tieu_test`) và dữ liệu test mẫu.
2. **Kiểm thử API Tài khoản (T_BE1 — 6 SP Test: US1 của TV1 + US2 của TV2):**
   - Viết Test Case và xây dựng Postman Automation Test cho:
     - `POST /api/v1/users/register`: Dữ liệu chuẩn, email trùng lặp, email sai định dạng, bỏ trống trường, mật khẩu < 8 ký tự.
     - `POST /api/v1/auth/login`: Đăng nhập đúng, sai mật khẩu, email chưa đăng ký.
     - Xác minh mật khẩu trong bảng `users` được băm BCrypt (`$2a$...`).
     - Tạo biến môi trường lưu động token cho các request tiếp theo (`test_{{$timestamp}}@example.com`).
3. **Kiểm thử Giao diện Quản lý ví (T_FE2 — 3 SP Test: US6 của TV3):**
   - Kiểm thử Manual luồng UI trang `/wallets`:
     - Hiển thị danh sách ví, định dạng tiền tệ VND (`1.000.000 ₫`).
     - Tính tổng số dư các ví trên UI có chính xác với dữ liệu thực tế hay không.
     - Kiểm tra trạng thái rỗng (`@empty`) khi tài khoản mới tạo chưa có ví.
     - Kiểm tra form/modal tạo ví: Báo lỗi khi tên trống, đóng modal và danh sách cập nhật ngay sau khi tạo thành công.
     - Kiểm tra nút Đăng xuất (xóa token, chặn quay lại trang ví bằng nút Back của trình duyệt).
4. **Tự động hóa Newman CLI & Lập Test Report cuối Sprint:**
   - Hợp nhất Postman Collection của nhóm vào `tests/api/sprint1.postman_collection.json`.
   - Thiết lập chạy tự động bằng Newman xuất báo cáo HTML:
     ```bash
     npx newman run tests/api/sprint1.postman_collection.json -e tests/api/local.postman_environment.json -r cli,htmlextra --reporter-htmlextra-export tests/reports/sprint1-report.html
     ```
   - Lập tài liệu **Test Report** tổng kết số TC Pass/Fail, số Bug phát hiện theo mức độ (`Critical`, `Major`, `Minor`), số Bug đã retest và kết quả bàn giao.

---

## 3. MA TRẬN PHÂN CHIA FILE & THƯ MỤC TRÁNH XUNG ĐỘT (GIT CONFLICT)

```
expense-management-system/
├── backend/
│   ├── pom.xml, application.properties            --> [TV1] setup ban đầu (merge ngày 1)
│   └── src/
│       ├── main/java/com/expensemanagement/backend/
│       │   ├── dto/response/ApiResponse.java       --> [TV1]
│       │   ├── exception/ (GlobalException...)     --> [TV1]
│       │   ├── entity/User.java, UserRepository    --> [TV1]
│       │   ├── service/UserService.java            --> [TV1]
│       │   ├── controller/UserController.java      --> [TV1]
│       │   ├── config/ (SecurityConfig, JWT...)    --> [TV2]
│       │   ├── entity/Wallet.java, WalletRepo...   --> [TV2]
│       │   ├── service/AuthService.java            --> [TV2]
│       │   ├── controller/AuthController.java      --> [TV2]
│       │   ├── service/WalletService.java          --> [TV2 code createWallet, TV4 code getWalletsByUser]
│       │   └── controller/WalletController.java    --> [TV2 code POST, TV4 code GET]
│       └── test/                                   --> [TV1, TV2, TV4] viết Unit Test cho method mình code
├── frontend/src/app/                               --> [TV3] phụ trách toàn bộ mã nguồn Frontend
│   ├── core/ (models, auth.service, interceptor, guard)
│   ├── features/auth/ (register, login)
│   ├── features/wallet/ (wallet-list, wallet-create-form)
│   └── shared/pipes/currency-vnd.pipe.ts
└── tests/                                          --> [TV2, TV3, TV4] lưu trữ tài nguyên kiểm thử
    ├── test-cases/                                 --> [TV2, TV3, TV4] tài liệu Test Case
    ├── api/sprint1.postman_collection.json         --> [TV3, TV4] Postman scripts
    └── reports/sprint1-report.html                 --> [TV4] báo cáo Newman HTML
```

---

## 4. LỊCH TRÌNH 10 NGÀY LÀM VIỆC THEO MÔ HÌNH KIỂM THỬ CHÉO

| Ngày | TV1 (SM kiêm Dev BE) | TV2 (Dev BE kiêm Tester) | TV3 (Dev FE kiêm Tester) | TV4 (Dev BE kiêm Tester chính) |
| :-: | :--- | :--- | :--- | :--- |
| **1** | Sprint Planning, tạo Jira, chốt SP; merge PR setup `pom.xml`, DB | Phác thảo SecurityConfig, JWT; thống nhất API Contract | Dọn dẹp Angular, tạo cấu trúc thư mục, `environment.ts` | Lập khung Test Plan Sprint 1; nghiên cứu logic `WalletRepository` |
| **2** | `ApiResponse`, `GlobalExceptionHandler`, refactor `User` entity | Implement `SecurityConfig`, JWT provider/filter, `AuthService` | Xây dựng `auth.service`, interceptor, guard, form đăng ký | Viết Test Case cho API Đăng ký & Đăng nhập (`T_BE1`) |
| **3** | Hoàn thành API Đăng ký + `UserServiceTest` $\rightarrow$ Mở PR | Hoàn thành API Đăng nhập + `AuthServiceTest` $\rightarrow$ Mở PR | Hoàn thành form đăng nhập, routing; viết test US3 | Kiểm thử API Đăng ký (US1) ngay khi có PR của TV1; ghi Bug |
| **4** | Review PR của TV2 & TV4; hỗ trợ tích hợp CSDL | Tạo `Wallet` entity, API Tạo ví + Unit Test US4 $\rightarrow$ Mở PR | Thiết kế màn hình danh sách ví, form tạo ví (mock data) | Kiểm thử API Đăng nhập (US2); bắt đầu code US5 (`getWalletsByUser`) |
| **5** | Kiểm tra Burndown Jira; rà soát chuẩn convention | Chuẩn bị Test Case cho Giao diện ĐK/ĐN (`T_FE1`) | Hoàn thành màn hình danh sách ví, form tạo ví; viết test US6 | Hoàn thành US5 + `WalletServiceTest` $\rightarrow$ Mở PR; viết Test Case UI ví |
| **6** | Hỗ trợ TV3 & TV4 tích hợp; review PR US5 | Bắt đầu kiểm thử UI Đăng ký & Đăng nhập của TV3 (`T_FE1`) | Nối giao diện Đăng ký & Đăng nhập với API thật | Bắt đầu viết kịch bản Postman kiểm thử US4 & US5 |
| **7** | **Mid-sprint Check**: Đánh giá tiến độ; kiểm tra dữ liệu MySQL | Tiếp tục test UI Đăng ký/Đăng nhập, ghi Bug cho TV3 | Bắt đầu kiểm thử chéo API Tạo ví (US4) và Xem ví (US5) | Kiểm thử chéo UI Quản lý ví của TV3 (`T_FE2`); ghi Bug |
| **8** | Hỗ trợ nhóm gỡ vướng blocker kỹ thuật | Sửa các lỗi Backend US2/US4 (nếu có); retest UI auth | Nối giao diện ví với API thật; sửa lỗi UI theo feedback TV2 | Hợp nhất Postman Collection, chạy tự động bằng Newman |
| **9** | Kiểm tra code coverage; chuẩn bị kịch bản demo | Hoàn thiện Unit Test US2, US4; chốt kết quả test `T_FE1` | Sửa các lỗi UI ví theo feedback TV4; hoàn thiện test US6 | Retest toàn bộ Bug; xuất báo cáo Newman HTML; chốt Test Report |
| **10** | **Sprint Review & Retrospective**: Điều phối demo, cập nhật Jira, tổng hợp báo cáo môn học | Demo chức năng Backend Đăng nhập & Tạo ví | Demo chức năng Frontend trên trình duyệt | Báo cáo kết quả kiểm thử, tỷ lệ Pass/Fail, thống kê Bug |

---

## 5. BẢNG MẪU BÁO CÁO SPRINTS NỘP GIẢNG VIÊN (KHI HOÀN THÀNH 100%)

Khi kết thúc Sprint, bảng tổng hợp thành tích của 4 thành viên sẽ được điền vào file Word báo cáo như sau:

| STT | Họ tên / MSSV | Vai trò | Nhiệm vụ thực hiện | Phân loại | SP | Tiến độ | Số Test thực tế | Điểm quy đổi | Xếp hạng |
| :-: | :--- | :--- | :--- | :---: | :-: | :-: | :---: | :-: | :-: |
| **1** | `[Họ tên TV1]` | SM kiêm Dev BE | Quản trị Sprint + `[BE] Đăng ký tài khoản` | Dev | 3 | 100% | 4 Unit Test | **3.0** | Tốt |
| **2** | `[Họ tên TV2]` | Dev BE kiêm Tester | `[BE] Đăng nhập hệ thống` + `[BE] Tạo ví mới` | Dev | 6 | 100% | 8 Unit Test | 6.0 | Xuất sắc |
| | | | `[TEST] Giao diện Đăng ký & Đăng nhập` | Test | 3 | 100% | M: 5, A: 0 | 1.5 | |
| | | | **Tổng TV2** | | | | | **7.5** | |
| **3** | `[Họ tên TV3]` | Dev FE kiêm Tester | `[FE] Giao diện ĐK/ĐN` + `[FE] Giao diện ví` | Dev | 6 | 100% | 7 Spec Test | 6.0 | Xuất sắc |
| | | | `[TEST] API Tạo ví & Xem danh sách ví` | Test | 5 | 100% | M: 4, A: 4 | 2.5 | |
| | | | **Tổng TV3** | | | | | **8.5** | |
| **4** | `[Họ tên TV4]` | Dev BE kiêm Tester chính | `[BE] Xem danh sách ví` | Dev | 2 | 100% | 3 Unit Test | 2.0 | Xuất sắc |
| | | | `[TEST] API Đăng ký & Đăng nhập` | Test | 6 | 100% | M: 6, A: 5 | 3.0 | |
| | | | `[TEST] Giao diện Quản lý ví` | Test | 3 | 100% | M: 5, A: 0 | 1.5 | |
| | | | **Tổng TV4** | | | | | **6.5** | |
