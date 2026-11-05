# NHIỆM VỤ CHI TIẾT SPRINT 1 — THÀNH VIÊN 2
## VAI TRÒ: DEVELOPER BACKEND CHUYÊN TRÁCH

> **Dự án:** Hệ thống Quản lý Chi tiêu Cá nhân  
> **Sprint:** Sprint 1 — Tài khoản và Ví cơ bản (Thời lượng: 2 tuần / 10 ngày làm việc)  
> **Họ và tên:** `[Điền Họ và Tên]`  
> **MSSV:** `[Điền MSSV]`  
> **Nhánh Git phụ trách:** `feature/QNK-auth-login-api`, `feature/QNK-wallet-create-api`, `feature/QNK-wallet-list-api`  
> **Phân loại nhiệm vụ:** **Developer chuyên trách 100%** (Chỉ tập trung Code + Unit Test, không phụ trách Test Case chức năng)  
> **Story Point (SP) đảm nhiệm:** **8 SP Dev** (US2: 3 SP + US4: 3 SP + US5: 2 SP)  
> **Điểm quy đổi Sprint dự kiến:** **8.0 điểm** ($100\% \times 8$)  

---

## 1. TỔNG QUAN TRÁCH NHIỆM
Thành viên 2 là lập trình viên Backend chủ lực của Sprint 1, chịu trách nhiệm xây dựng:
1. **Kiến trúc Security & JWT:** Toàn bộ cơ chế xác thực Spring Security stateless, bộ lọc token, cấp phát JWT và trích xuất danh tính `userId`.
2. **US2: [BE] Đăng nhập hệ thống (3 SP):** So khớp mật khẩu BCrypt, sinh Bearer Token.
3. **US4: [BE] Tạo ví mới (3 SP):** Tạo nguồn tiền, gán quyền sở hữu tự động từ token, chặn số dư âm.
4. **US5: [BE] Xem danh sách ví (2 SP):** Truy vấn danh sách ví theo người dùng, trả rỗng `[]` khi chưa có ví, đảm bảo bảo mật dữ liệu tuyệt đối (Zero Leakage).

---

## 2. CHI TIẾT CÁC ĐẦU VIỆC CẦN THỰC HIỆN

### PHẦN I: XÂY DỰNG KIẾN TRÚC SECURITY & JWT INFRASTRUCTURE (NGÀY 1 - 2)
* [ ] **`SecurityConfig.java` (`config`):**
  * Kích hoạt Spring Security, khởi tạo Bean `PasswordEncoder` (`BCryptPasswordEncoder`).
  * Tắt CSRF, thiết lập `SessionCreationPolicy.STATELESS`.
  * Cấu hình phân quyền: Cho phép truy cập công khai `/api/v1/users/register`, `/api/v1/auth/login`, `/api/health`. Tất cả endpoint còn lại bắt buộc có token.
  * Cấu hình CORS: Cho phép nguồn từ Frontend Angular `http://localhost:4200`.
* [ ] **`JwtTokenProvider.java` (`util`):**
  * Đọc `jwt.secret` và `jwt.expiration` từ cấu hình môi trường.
  * Phương thức `generateToken(Long userId)`: Đưa `userId` vào Subject của token.
  * Phương thức `getUserIdFromToken(String token)`: Trích xuất `userId`.
  * Phương thức `validateToken(String token)`: Kiểm tra tính hợp lệ của token.
* [ ] **`JwtAuthenticationFilter.java` (`config`):**
  * Bắt header `Authorization: Bearer <token>`, trích xuất danh tính và lưu vào `SecurityContextHolder`.
* [ ] **`SecurityUtils.java` (`util`):**
  * Cung cấp hàm `public static Long getCurrentUserId()` để các Service gọi trực tiếp.

---

### PHẦN II: PHÁT TRIỂN US2 — [BE] ĐĂNG NHẬP HỆ THỐNG (3 SP DEV)
* [ ] Tạo DTO `LoginRequest.java` (`email`, `password`) kèm validate `@NotBlank`, `@Email`.
* [ ] Tạo DTO `LoginResponse.java` (`accessToken`, `tokenType`, `expiresIn`, `user`).
* [ ] Xây dựng `AuthService.login()`:
  * So khớp mật khẩu bằng `passwordEncoder.matches(request.getPassword(), user.getPasswordHash())`.
  * Sai mật khẩu hoặc email không tồn tại $\rightarrow$ ném lỗi `UnauthorizedException("Email hoặc mật khẩu không đúng")` (HTTP 401).
  * Thành công $\rightarrow$ sinh JWT Token và trả về `LoginResponse`.
* [ ] Controller `AuthController.java`: Endpoint `POST /api/v1/auth/login`.
* [ ] **Viết 4 Unit Test (`AuthServiceTest.java`):**
  1. `login_withValidCredentials_shouldReturnToken()`
  2. `login_withWrongPassword_shouldThrowUnauthorizedException()`
  3. `login_withNonExistingEmail_shouldThrowUnauthorizedException()`
  4. `generateToken_thenGetUserIdFromToken_shouldReturnSameUserId()`

---

### PHẦN III: PHÁT TRIỂN US4 — [BE] TẠO VÍ MỚI (3 SP DEV)
* [ ] Tạo Entity `Wallet.java` & `WalletRepository.java` khớp bảng `wallets`.
* [ ] Tạo DTO `WalletCreateRequest.java` (validate `@NotBlank`, `@Size(max=100)`, `@DecimalMin("0.00")`), `WalletResponse.java`.
* [ ] Xây dựng `WalletService.createWallet()`:
  * Trích xuất `userId` từ token thông qua `SecurityUtils.getCurrentUserId()`.
  * Thiết lập `isActive = true`, `balance` mặc định `0.00` nếu client không truyền.
* [ ] Controller `WalletController.java`: Endpoint `POST /api/v1/wallets`.
* [ ] **Viết 4 Unit Test (`WalletServiceTest.java` - Phần tạo ví):**
  1. `createWallet_withValidData_shouldReturnCreatedWallet()`
  2. `createWallet_withoutInitialBalance_shouldDefaultToZero()`
  3. `createWallet_withValidData_shouldAssignCurrentUserId()`
  4. `createWallet_whenUserNotExists_shouldThrowResourceNotFoundException()`

---

### PHẦN IV: PHÁT TRIỂN US5 — [BE] XEM DANH SÁCH VÍ (2 SP DEV)
* [ ] Thêm query method trong `WalletRepository`:
  ```java
  List<Wallet> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(Long userId);
  ```
* [ ] Xây dựng `WalletService.getWalletsByUser()`:
  * Lấy `userId` từ token đang đăng nhập.
  * Nếu người dùng chưa có ví nào $\rightarrow$ trả về mảng rỗng `data: []` (HTTP 200).
* [ ] Bổ sung endpoint trong `WalletController`: `GET /api/v1/wallets`.
* [ ] **Viết 3 Unit Test (`WalletServiceTest.java` - Phần danh sách):**
  1. `getWalletsByUser_whenUserHasWallets_shouldReturnList()`
  2. `getWalletsByUser_whenNoWallet_shouldReturnEmptyList()`
  3. `getWalletsByUser_shouldQueryOnlyCurrentUserId()`

---

## 3. LỊCH TRÌNH 10 NGÀY CỦA THÀNH VIÊN 2

| Ngày | Chi tiết công việc thực hiện | Sản phẩm bàn giao |
| :---: | :--- | :--- |
| **Ngày 1** | Tham gia Sprint Planning, thống nhất API Contract; tạo nhánh `feature/auth-login-api`. | Nhánh Git sẵn sàng. |
| **Ngày 2** | Code `SecurityConfig`, `JwtTokenProvider`, `JwtAuthenticationFilter`, `SecurityUtils`. | Hạ tầng Security hoàn thiện. |
| **Ngày 3** | Code logic API Đăng nhập (`AuthService.login()`) + 4 Unit Test. | `mvn test` Pass; Mở PR US2. |
| **Ngày 4** | Bàn giao API Đăng nhập cho TV4 test; tạo `Wallet` entity, DTO tạo ví. | PR US2 merge; Nhánh tạo ví sẵn sàng. |
| **Ngày 5** | Hoàn thành API Tạo ví (`POST /wallets`) + 4 Unit Test $\rightarrow$ Mở PR US4. | PR US4 mở trên Git; Bàn giao cho TV4 test. |
| **Ngày 6** | Bắt đầu code US5 (`WalletService.getWalletsByUser()`), viết query method. | Nhánh `feature/wallet-list-api` sẵn sàng. |
| **Ngày 7** | Tham gia họp Mid-sprint Check; hoàn thành API `GET /wallets` + 3 Unit Test. | Mở PR US5; Bàn giao cho TV3 (FE) và TV4 (Test). |
| **Ngày 8** | Tiếp nhận các ticket Bug Backend từ TV4 (nếu có) và thực hiện Bug Fix. | Đóng các Bug Backend trên Jira. |
| **Ngày 9** | Rà soát toàn bộ 11 Unit Test của mình; đảm bảo độ bao phủ $\ge 80\%$. | `mvn test` Pass 100%. |
| **Ngày 10** | Tham gia Sprint Review demo API qua Postman/Swagger; họp Retrospective. | Chốt 8 SP Dev sang trạng thái `Done`. |
