# NHIỆM VỤ THÀNH VIÊN — SPRINT 1 (MISSION SPRINT 1)
## MÔ HÌNH: 3 DEVELOPER CHUYÊN TRÁCH + 1 TESTER CHUYÊN TRÁCH

> **Dự án:** Hệ thống Quản lý Chi tiêu Cá nhân  
> **Sprint:** Sprint 1 — Tài khoản và Ví cơ bản (Thời lượng: 2 tuần / 10 ngày làm việc)  
> **Quy mô:** Nhóm 4 thành viên  
> **Cơ cấu tổ chức:** Phân định rạch ròi vai trò theo đúng yêu cầu đề bài:
> - **1 Scrum Master kiêm Backend Developer (TV1)**
> - **1 Backend Developer (TV2)**
> - **1 Frontend Developer (TV3)**
> - **1 Quality Assurance / Tester chuyên trách (TV4)**

---

## 1. BẢNG TỔNG QUAN PHÂN CÔNG STORY POINT & ĐIỂM QUY ĐỔI

Theo mẫu báo cáo môn học *[Phát triển PMCN] Báo cáo Sprints.docx*:
- **Developer (TV1, TV2, TV3):** Thực hiện **Code + Unit Test**. Điểm quy đổi = $100\% \times \text{SP hoàn thành}$.
- **Tester (TV4):** Chịu trách nhiệm kiểm thử toàn bộ hệ thống (**Test Case + Automation Test + Bug Tracking + Test Report**). Điểm quy đổi = $50\% \times \text{Tổng SP Test hoàn thành}$.

| STT | Thành viên | Vai trò đảm nhiệm | Story phụ trách trên Jira | SP Dev | SP Test | Điểm quy đổi (nếu xong 100%) |
| :-: | :--- | :--- | :--- | :---: | :---: | :---: |
| **1** | **Thành viên 1** | **Scrum Master kiêm Dev BE** | - Quản trị Jira, điều phối Agile, review PR<br>- Setup nền tảng BE dùng chung<br>- `US1: [BE] Đăng ký tài khoản` | **3** | — | **3.0 điểm** |
| **2** | **Thành viên 2** | **Developer BE** | - Hạ tầng Spring Security & JWT<br>- `US2: [BE] Đăng nhập hệ thống` (3 SP)<br>- `US4: [BE] Tạo ví mới` (3 SP)<br>- `US5: [BE] Xem danh sách ví` (2 SP) | **8** | — | **8.0 điểm** |
| **3** | **Thành viên 3** | **Developer FE (Angular 21)** | - Setup nền tảng Angular 21<br>- `US3: [FE] Giao diện Đăng ký & Đăng nhập` (3 SP)<br>- `US6: [FE] Giao diện Quản lý ví` (3 SP) | **6** | — | **6.0 điểm** |
| **4** | **Thành viên 4** | **Tester chuyên trách (QA)** | - `T1: [TEST] Full flow Đăng ký - Đăng nhập` (9 SP)<br>- `T2: [TEST] Full flow Quản lý ví` (8 SP) | — | **17** | **8.5 điểm**<br>($17 \times 50\%$) |
| | **TỔNG CỘNG** | **4 Thành viên** | **6 User Stories + 2 Test Epics** | **17 SP** | **17 SP** | **25.5** |

> **Cách tính SP Test cho TV4:**
> - Luồng Tài khoản (`T1`): BE đăng ký (3) + BE đăng nhập (3) + FE đăng ký/đăng nhập (3) = **9 SP Test**.
> - Luồng Ví (`T2`): BE tạo ví (3) + BE xem ví (2) + FE quản lý ví (3) = **8 SP Test**.
> - Tổng SP Test = $9 + 8 =$ **17 SP**. Điểm quy đổi Tester = $17 \times 50\% =$ **8.5 điểm**.

---

## 2. NHIỆM VỤ CHI TIẾT CỦA TỪNG THÀNH VIÊN

---

### 2.1. THÀNH VIÊN 1: SCRUM MASTER KIÊM DEVELOPER BACKEND
* **Họ tên / MSSV:** `[Điền Họ và Tên - MSSV]`
* **Vai trò:** Quản trị quy trình Scrum & Phát triển Backend tài khoản.

#### A. Trách nhiệm Quản lý Scrum Master
1. **Quản trị Jira:**
   * Tạo Sprint 1 trên Jira với Sprint Goal và thời hạn 2 tuần.
   * Tạo 6 User Stories (`US1` $\rightarrow$ `US6`) và 2 Task Test (`T1`, `T2`) kèm Description, Acceptance Criteria và Sub-tasks.
   * Theo dõi tiến độ hằng ngày qua Burndown Chart, giám sát luồng (`To Do` $\rightarrow$ `In Progress` $\rightarrow$ `In Review` $\rightarrow$ `Done`).
2. **Nghi thức Scrum:**
   * Chủ trì họp **Daily Scrum** hằng ngày (15 phút), theo dõi và tháo gỡ các Blocker cho Dev và Tester.
   * Chủ trì **Sprint Planning** (Ngày 1), **Mid-sprint Check** (Ngày 7), **Sprint Review & Retrospective** (Ngày 10).
3. **Quản trị Git & Chất lượng:**
   * Khởi tạo và bảo vệ nhánh `develop`. Duyệt và review toàn bộ Pull Request (PR) theo Coding Conventions.
   * Đảm bảo kiểm tra Unit Test Pass trước khi merge vào `develop`.
   * Tổng hợp báo cáo Sprint nộp môn học theo mẫu Word quy định.

#### B. Trách nhiệm Lập trình Backend (3 SP Dev)
1. **Thiết lập nền tảng dự án (Base Setup):**
   * Cập nhật `backend/pom.xml`: Bổ sung `spring-boot-starter-validation`, `spring-boot-starter-security`, thư viện `jjwt`, và `h2` database cho môi trường test.
   * Cấu hình `application.properties` trỏ đúng CSDL `quan_ly_chi_tieu`.
   * Xây dựng cấu trúc phản hồi chuẩn `ApiResponse<T>`, bộ bắt lỗi tập trung `GlobalExceptionHandler`, các Custom Exception (`DuplicateResourceException`, `ResourceNotFoundException`, `UnauthorizedException`).
2. **Phát triển US1 — [BE] Đăng ký tài khoản (3 SP):**
   * Refactor Entity `User` và `UserRepository` khớp bảng `users` (`user_id`, `full_name`, `email`, `password_hash`, `created_at`, `updated_at`).
   * DTO: `UserCreationRequest` (validate `@NotBlank`, `@Email`, `@Size(min=8, max=72)`), `UserResponse`.
   * Service & Controller: Chuẩn hóa email `.trim().toLowerCase()`, kiểm tra trùng lặp email $\rightarrow$ ném lỗi 409, băm mật khẩu bằng BCrypt (`PasswordEncoder`) trước khi lưu CSDL. Endpoint `POST /api/v1/users/register`.
   * **Viết Unit Test (`UserServiceTest.java`):** Tối thiểu 4 test case đạt coverage $\ge 80\%$:
     - `register_withValidData_shouldReturnUserResponse()`
     - `register_withExistingEmail_shouldThrowDuplicateResourceException()`
     - `register_withValidData_shouldHashPasswordBeforeSave()`
     - `register_withUppercaseEmail_shouldNormalizeToLowercase()`

---

### 2.2. THÀNH VIÊN 2: DEVELOPER BACKEND CHUYÊN TRÁCH
* **Họ tên / MSSV:** `[Điền Họ và Tên - MSSV]`
* **Vai trò:** Phụ trách toàn bộ hệ thống Bảo mật, API Đăng nhập và toàn bộ phân hệ Ví Backend.
* **Tổng khối lượng:** **8 SP Dev**

#### A. Trách nhiệm Hạ tầng Bảo mật & Xác thực JWT
1. **Xây dựng `SecurityConfig.java`:** Stateless, tắt CSRF, phân quyền endpoint công khai (`/register`, `/login`, `/health`), cấu hình CORS cho Angular (`http://localhost:4200`).
2. **Xây dựng `JwtTokenProvider.java` & `JwtAuthenticationFilter.java`:** Tạo token chứa `userId`, trích xuất và xác thực Bearer token từ header.
3. **Xây dựng `SecurityUtils.java`:** Phương thức tĩnh `getCurrentUserId()` lấy danh tính user đang đăng nhập.

#### B. Phát triển các User Stories
1. **US2 — [BE] Đăng nhập hệ thống (3 SP):**
   * DTO: `LoginRequest` (`email`, `password`), `LoginResponse` (`accessToken`, `tokenType`, `expiresIn`, `user`).
   * Logic: So khớp mật khẩu BCrypt (`passwordEncoder.matches()`). Sai email hoặc mật khẩu trả lỗi an toàn `401 Unauthorized`.
   * Endpoint: `POST /api/v1/auth/login`.
   * **Unit Test (`AuthServiceTest.java`):**
     - `login_withValidCredentials_shouldReturnToken()`
     - `login_withWrongPassword_shouldThrowUnauthorizedException()`
     - `login_withNonExistingEmail_shouldThrowUnauthorizedException()`
     - `generateToken_thenGetUserIdFromToken_shouldReturnSameUserId()`
2. **US4 — [BE] Tạo ví mới (3 SP):**
   * Entity `Wallet` & `WalletRepository` khớp bảng `wallets`.
   * DTO: `WalletCreateRequest` (validate tên ví không trống, số dư ban đầu $\ge 0$).
   * Logic: Gán `userId` trích xuất từ JWT token (không tin tưởng client), mặc định `balance = 0.00` nếu không gửi.
   * Endpoint: `POST /api/v1/wallets`.
   * **Unit Test (`WalletServiceTest.java` - Phần tạo ví):**
     - `createWallet_withValidData_shouldReturnCreatedWallet()`
     - `createWallet_withoutInitialBalance_shouldDefaultToZero()`
     - `createWallet_withValidData_shouldAssignCurrentUserId()`
     - `createWallet_whenUserNotExists_shouldThrowResourceNotFoundException()`
3. **US5 — [BE] Xem danh sách ví (2 SP):**
   * Query method: `findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId)`.
   * Logic: Lấy danh sách ví thuộc chính `userId` đó. Nếu chưa có ví $\rightarrow$ trả về mảng rỗng `data: []` (HTTP 200). Đảm bảo bảo mật dữ liệu tuyệt đối (User A không bao giờ thấy ví của User B).
   * Endpoint: `GET /api/v1/wallets`.
   * **Unit Test (`WalletServiceTest.java` - Phần danh sách):**
     - `getWalletsByUser_whenUserHasWallets_shouldReturnList()`
     - `getWalletsByUser_whenNoWallet_shouldReturnEmptyList()`
     - `getWalletsByUser_shouldQueryOnlyCurrentUserId()`

---

### 2.3. THÀNH VIÊN 3: DEVELOPER FRONTEND (ANGULAR 21) CHUYÊN TRÁCH
* **Họ tên / MSSV:** `[Điền Họ và Tên - MSSV]`
* **Vai trò:** Phụ trách toàn bộ giao diện Web, trạng thái Client, tương tác REST API và kiểm thử Component.
* **Tổng khối lượng:** **6 SP Dev**

#### A. Trách nhiệm Hạ tầng Frontend
1. **Thiết lập kiến trúc Angular 21:**
   * Tổ chức thư mục chuẩn `core/`, `features/`, `shared/` theo Coding Conventions.
   * Thiết lập `src/environments/environment.ts` (`apiUrl: 'http://localhost:8080/api/v1'`).
   * Cấu hình `provideHttpClient(withInterceptors([authInterceptor]))` trong `app.config.ts`.
2. **Xây dựng tầng Core:**
   * Models TypeScript: `user.model.ts`, `wallet.model.ts`, `api-response.model.ts`.
   * `auth.service.ts`: Quản lý signal `currentUser`, lưu/xóa token trong `localStorage`.
   * `auth.interceptor.ts`: Tự động gắn Bearer token, bắt lỗi 401 tự động chuyển về `/login`.
   * `auth.guard.ts`: Bảo vệ các route yêu cầu đăng nhập.

#### B. Phát triển các User Stories
1. **US3 — [FE] Giao diện Đăng ký và Đăng nhập (3 SP):**
   * Component `register`: Reactive Form gồm Họ tên, Email, Mật khẩu, Xác nhận mật khẩu; validate trực quan. Đăng ký thành công tự động chuyển sang `/login`.
   * Component `login`: Reactive Form gồm Email, Mật khẩu. Đăng nhập thành công lưu token và chuyển sang `/wallets`. Hiển thị lỗi rõ ràng khi BE trả 401.
   * Header chung: Nút **Đăng xuất** xóa token và đưa về `/login`.
   * **Component Test (Vitest + TestBed):** `register.spec.ts`, `login.spec.ts`, `auth.service.spec.ts`.
2. **US6 — [FE] Giao diện Quản lý ví (3 SP):**
   * `wallet.service.ts`: Gọi `GET /wallets` và `POST /wallets`.
   * `currency-vnd.pipe.ts`: Format số tiền VND (`1.000.000 ₫`).
   * Component `wallet-list`: Hiển thị danh sách thẻ ví (`@for … track wallet.walletId`), tính tổng số dư bằng Signal `computed()`, trạng thái rỗng bằng `@empty` (*"Bạn chưa có ví nào. Hãy tạo ví đầu tiên!"*).
   * Component `wallet-create-form`: Modal nhập tên ví và số dư, cập nhật danh sách ngay khi tạo thành công.
   * **Component Test:** `wallet-list.spec.ts`, `wallet-create-form.spec.ts`, `currency-vnd.pipe.spec.ts`.

---

### 2.4. THÀNH VIÊN 4: QUALITY ASSURANCE / TESTER CHUYÊN TRÁCH
* **Họ tên / MSSV:** `[Điền Họ và Tên - MSSV]`
* **Vai trò:** Kiểm thử toàn diện chất lượng phần mềm, quản lý lỗi (Bug Tracking), xây dựng kiểm thử tự động (Automation) và lập Báo cáo kiểm thử (Test Report).
* **Tổng khối lượng:** **17 SP Test** (Điểm quy đổi = $17 \times 50\% =$ **8.5 điểm**)

#### A. Thiết lập Kế hoạch & Quản trị Kiểm thử
1. **Lập tài liệu Test Plan (`tests/test-cases/SPRINT_1_TEST_PLAN.md`):** Xác định phạm vi kiểm thử, phương pháp kết hợp Manual + Automation, tiêu chí nghiệm thu (Pass rate $\ge 90\%$, không còn Bug Critical/Major).
2. **Chuẩn bị môi trường & Dữ liệu test:** CSDL sạch `quan_ly_chi_tieu_test`, danh sách tài khoản test mẫu, các bộ giá trị biên.

#### B. Thực hiện 2 Nhiệm vụ Kiểm thử Hệ thống (T1 + T2)
1. **T1 — [TEST] Kiểm thử full flow Đăng ký và Đăng nhập (9 SP Test):**
   * Kiểm thử chức năng và giao diện đăng ký: Dữ liệu hợp lệ, email trùng, email sai định dạng, bỏ trống trường, mật khẩu < 8 ký tự (`TC01`, `TC02`, `TC03`, `TC11`).
   * Kiểm thử chức năng và giao diện đăng nhập: Đăng nhập đúng, sai mật khẩu, tài khoản không tồn tại (`TC04`, `TC05`, `TC12`).
   * Kiểm thử bảo mật: Kiểm tra mật khẩu trong bảng `users` có được băm BCrypt (`$2a$...`) hay không; kiểm tra `authGuard` có chặn người chưa đăng nhập vào `/wallets` không (`TC13`).
2. **T2 — [TEST] Kiểm thử full flow Quản lý ví (8 SP Test):**
   * Kiểm thử tạo ví: Tên hợp lệ, số dư ban đầu, không truyền số dư (mặc định 0), tên ví để trống, số dư âm, tên ví > 100 ký tự (`TC06`, `TC07`, `TC15`, `TC16`).
   * Kiểm thử danh sách ví: Người dùng có ví, người dùng chưa có ví (hiển thị trạng thái rỗng), tính tổng số dư trên giao diện (`TC08`, `TC09`).
   * Kiểm thử bảo mật sở hữu dữ liệu: Gọi API không có token $\rightarrow$ 401; User B không bao giờ nhìn thấy ví của User A (`TC10`, `TC14`).

#### C. Tự động hóa Newman CLI & Lập Test Report
1. **Xây dựng Postman Collection tự động (`tests/api/sprint1.postman_collection.json`):**
   * Tối thiểu **9 Automation Test Cases** (`TC01`, `TC02`, `TC04`, `TC05`, `TC12`, `TC06`, `TC08`, `TC10`, `TC14`).
   * Sử dụng biến môi trường động `test_{{$timestamp}}@example.com` để collection có thể chạy lặp lại nhiều lần không lỗi.
   * Tự động lưu `accessToken` vào environment và truyền vào các request ví tiếp theo.
2. **Chạy Newman xuất báo cáo HTML:**
   ```bash
   npx newman run tests/api/sprint1.postman_collection.json -e tests/api/local.postman_environment.json -r cli,htmlextra --reporter-htmlextra-export tests/reports/sprint1-report.html
   ```
3. **Quản trị Bug trên Jira & Lập Test Report:**
   * Tạo ticket `Bug` khi phát hiện lỗi, liên kết với Story liên quan; thực hiện **Retest** khi Dev sửa xong.
   * Lập tài liệu **Test Report** tổng kết số TC Pass/Fail, danh sách Bug đã đóng, xuất file HTML minh chứng nộp Giảng viên.

---

## 3. MA TRẬN PHÂN CHIA FILE & MÃ NGUỒN TRÁNH XUNG ĐỘT (GIT)

```
expense-management-system/
├── backend/
│   ├── pom.xml, application.properties            --> [TV1] setup ban đầu
│   └── src/
│       ├── main/java/com/expensemanagement/backend/
│       │   ├── dto/response/ApiResponse.java       --> [TV1]
│       │   ├── exception/ (GlobalException...)     --> [TV1]
│       │   ├── entity/User.java, UserRepository    --> [TV1]
│       │   ├── service/UserService.java            --> [TV1]
│       │   ├── controller/UserController.java      --> [TV1]
│       │   ├── config/ (SecurityConfig, JWT...)    --> [TV2]
│       │   ├── entity/Wallet.java, WalletRepo...   --> [TV2]
│       │   ├── service/AuthService, WalletService  --> [TV2]
│       │   └── controller/AuthController, Wallet...--> [TV2]
│       └── test/                                   --> [TV1, TV2] viết Unit Test tương ứng lớp mình code
├── frontend/src/app/                               --> [TV3] phụ trách 100% mã nguồn Frontend
│   ├── core/ (models, auth.service, interceptor, guard)
│   ├── features/auth/ (register, login)
│   ├── features/wallet/ (wallet-list, wallet-create-form)
│   └── shared/pipes/currency-vnd.pipe.ts
└── tests/                                          --> [TV4] phụ trách 100% tài nguyên Kiểm thử
    ├── test-cases/SPRINT_1_TEST_PLAN.md
    ├── test-cases/SPRINT_1_TEST_CASES.md
    ├── api/sprint1.postman_collection.json
    └── reports/sprint1-report.html
```

---

## 4. LỊCH TRÌNH 10 NGÀY LÀM VIỆC RẠCH RÒI DEV & TEST

| Ngày | TV1 (SM kiêm Dev BE) | TV2 (Dev BE) | TV3 (Dev FE) | TV4 (Tester chuyên trách) |
| :-: | :--- | :--- | :--- | :--- |
| **1** | Sprint Planning, tạo Jira, chốt SP; merge PR setup `pom.xml`, DB | Phác thảo SecurityConfig, JWT; thống nhất API Contract | Dọn dẹp Angular, tạo cấu trúc thư mục, `environment.ts` | Lập tài liệu Test Plan tổng thể; xác định 16 Test Cases |
| **2** | Code `ApiResponse`, Exception, refactor `User` entity | Implement `SecurityConfig`, JWT provider/filter | Xây dựng `auth.service`, interceptor, guard, form đăng ký | Chuẩn bị CSDL test `quan_ly_chi_tieu_test`; dựng khung Postman |
| **3** | Hoàn thành API Đăng ký + `UserServiceTest` $\rightarrow$ Mở PR | Code API Đăng nhập (`AuthService.login()`) + Unit Test | Hoàn thành form đăng nhập, routing; viết component test US3 | Kiểm thử API Đăng ký (US1) ngay khi có PR của TV1; ghi Bug |
| **4** | Review PR của TV2; hỗ trợ tích hợp CSDL | Tạo `Wallet` entity, API Tạo ví + Unit Test US4 $\rightarrow$ Mở PR | Dựng giao diện danh sách ví, form tạo ví (mock data) | Kiểm thử API Đăng nhập (US2); viết Automation Script Auth |
| **5** | Kiểm tra Burndown Jira; rà soát chuẩn convention | Hoàn thành API Danh sách ví (`GET /wallets`) + Unit Test US5 | Hoàn thành màn hình danh sách ví, form tạo ví; viết test US6 | Kiểm thử API Tạo ví (US4); viết Automation Script tạo ví |
| **6** | Hỗ trợ TV3 tích hợp BE; review PR US5 | Hỗ trợ xử lý lỗi tích hợp; tối ưu hóa truy vấn CSDL | Nối giao diện Đăng ký & Đăng nhập với API thật | Kiểm thử API Danh sách ví (US5); kiểm tra bảo mật sở hữu dữ liệu |
| **7** | **Mid-sprint Check**: Đánh giá tiến độ; kiểm tra dữ liệu MySQL | Hỗ trợ FE xử lý CORS / token hết hạn | Nối giao diện ví với API tạo ví và danh sách ví thật | Chạy kiểm thử End-to-End trên giao diện Web (UI Testing); ghi Bug |
| **8** | Hỗ trợ sửa các lỗi phát sinh chung | Sửa các lỗi Backend (Bug Fix) do TV4 phát hiện | Sửa các lỗi Giao diện (Bug Fix) do TV4 phát hiện | Retest các Bug đã sửa; hoàn thiện Postman Collection nhóm |
| **9** | Kiểm tra code coverage; chuẩn bị kịch bản demo | Rà soát Unit Test; đảm bảo `mvn test` Pass 100% | Rà soát component test; đảm bảo `ng test` Pass 100% | Chạy Newman CLI xuất báo cáo HTML; lập tài liệu Test Report |
| **10** | **Sprint Review & Retrospective**: Điều phối demo, cập nhật Jira, tổng hợp báo cáo môn học | Demo chức năng Backend qua Swagger/Postman | Demo chức năng Frontend trên trình duyệt Web | Báo cáo kết quả kiểm thử, tỷ lệ Pass/Fail, thống kê Bug |

---

## 5. BẢNG MẪU BÁO CÁO SPRINTS NỘP GIẢNG VIÊN (KHI HOÀN THÀNH 100%)

| STT | Họ tên / MSSV | Vai trò | Nhiệm vụ thực hiện | Phân loại | SP | Tiến độ | Số Test thực tế | Điểm quy đổi | Xếp hạng |
| :-: | :--- | :--- | :--- | :---: | :-: | :-: | :---: | :-: | :-: |
| **1** | `[Họ tên TV1]` | SM kiêm Dev BE | Quản trị Sprint + `[BE] Đăng ký tài khoản` | Dev | 3 | 100% | 4 Unit Test | **3.0** | Tốt |
| **2** | `[Họ tên TV2]` | Developer BE | `[BE] Đăng nhập` + `[BE] Tạo ví` + `[BE] Xem ví` | Dev | 8 | 100% | 11 Unit Test | **8.0** | Xuất sắc |
| **3** | `[Họ tên TV3]` | Developer FE | `[FE] Giao diện ĐK/ĐN` + `[FE] Giao diện ví` | Dev | 6 | 100% | 7 Spec Test | **6.0** | Tốt |
| **4** | `[Họ tên TV4]` | Tester chuyên trách | `[TEST] Full flow Đăng ký - Đăng nhập` | Test | 9 | 100% | M: 8, A: 5 | 4.5 | Xuất sắc |
| | | | `[TEST] Full flow Quản lý ví` | Test | 8 | 100% | M: 8, A: 4 | 4.0 | |
| | | | **Tổng TV4** | | **17** | **100%** | **M: 16, A: 9** | **8.5** | |
