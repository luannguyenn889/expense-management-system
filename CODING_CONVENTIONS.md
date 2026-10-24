# CODING CONVENTIONS — HỆ THỐNG QUẢN LÝ CHI TIÊU

Tài liệu quy định toàn bộ tiêu chuẩn lập trình, đặt tên, cấu trúc dự án và quy tắc kiểm thử cho Hệ thống Quản lý Chi tiêu Cá nhân (gồm 6 Epic), áp dụng thống nhất cho CSDL, Backend (Java Spring Boot), Frontend (React/TypeScript), Git, REST API và Kiểm thử phần mềm (Testing).

---

## 1. QUY ƯỚC CƠ SỞ DỮ LIỆU (DATABASE CONVENTIONS)

- **Hệ quản trị CSDL:** MySQL 8.0.16+
- **Charset & Collation:** `utf8mb4` / `utf8mb4_unicode_ci`

| Thành phần | Quy tắc | Ví dụ |
| :--- | :--- | :--- |
| **Tên Database** | `snake_case`, chữ thường | `quan_ly_chi_tieu` |
| **Tên bảng** | `snake_case`, danh từ số nhiều | `users`, `wallets`, `categories`, `transactions`, `budgets` |
| **Khóa chính (PK)** | `{singular_table_name}_id` | `user_id`, `wallet_id`, `category_id`, `transaction_id`, `budget_id` |
| **Khóa ngoại (FK)** | Khớp chính xác tên cột PK được tham chiếu | `user_id`, `wallet_id`, `category_id` |
| **Tên cột thường** | `snake_case`, danh từ/cụm danh từ | `full_name`, `email`, `wallet_name`, `balance`, `amount` |
| **Cột Boolean** | Tiền tố `is_` hoặc `has_` | `is_active` |
| **Cột Thời gian** | `DATETIME` hoặc `TIMESTAMP` | `created_at`, `updated_at`, `transaction_date` |
| **Cột Tiền tệ** | `DECIMAL(15,2)` | `balance`, `amount`, `budget_amount` |
| **Tên Constraint FK** | `fk_{bảng_chứa}_{bảng_tham_chiếu}` | `fk_wallets_users`, `fk_transactions_wallets` |
| **Tên Constraint Unique** | `uq_{tên_bảng}_{tên_cột}` | `uq_users_email` |
| **Tên Constraint Check** | `chk_{tên_bảng}_{mục_đích}` | `chk_wallets_balance`, `chk_categories_type` |
| **Tên Index** | `idx_{tên_bảng}_{các_cột}` | `idx_wallets_user_id`, `idx_transactions_wallet_date` |
| **Giá trị Enum/Loại** | `UPPER_SNAKE_CASE` (chuỗi hằng số) | `INCOME`, `EXPENSE` |

---

## 2. QUY ƯỚC BACKEND (JAVA / SPRING BOOT)

### 2.1. Cấu trúc Package
Mọi package đều viết chữ thường (`lowercase`), không dùng dấu gạch dưới hay hoa:
```
com.expensemanagement.backend
├── controller       # Lớp tiếp nhận HTTP Request & trả về Response
├── dto              # Data Transfer Objects
│   ├── request      # DTO cho dữ liệu gửi lên (Payload)
│   └── response     # DTO cho dữ liệu trả về
├── entity           # JPA/Hibernate Entities ánh xạ CSDL
├── repository       # Spring Data JPA Repositories
├── service          # Interface & Business Logic
│   └── impl         # Service Implementations (nếu tách interface)
├── exception        # Custom Exceptions & Global Exception Handler
├── config           # Cấu hình Security, CORS, Swagger, Database
└── util             # Tiện ích chung (DateUtils, SecurityUtils,...)
```

### 2.2. Quy tắc đặt tên Lớp (Classes & Interfaces)
Dùng `PascalCase`, thể hiện rõ vai trò qua hậu tố:

| Tầng / Thành phần | Quy tắc đặt tên | Ví dụ |
| :--- | :--- | :--- |
| **Entity** | Danh từ số ít, trùng tên logic bảng | `User`, `Wallet`, `Category`, `Transaction`, `Budget` |
| **Repository** | `{Entity}Repository` | `UserRepository`, `WalletRepository`, `TransactionRepository` |
| **Service Interface** | `{Entity}Service` | `UserService`, `WalletService`, `BudgetService` |
| **Service Impl** | `{Entity}ServiceImpl` | `UserServiceImpl`, `WalletServiceImpl` |
| **Controller** | `{Entity}Controller` | `UserController`, `WalletController`, `TransactionController` |
| **Request DTO** | `{Entity}{Action}Request` | `UserCreationRequest`, `UserUpdateRequest`, `WalletCreateRequest` |
| **Response DTO** | `{Entity}Response` hoặc `{Entity}{Detail}Response` | `UserResponse`, `WalletResponse`, `TransactionResponse` |
| **Exception** | `{Mô_tả}Exception` | `ResourceNotFoundException`, `UnauthorizedException` |
| **Configuration** | `{Mô_tả}Config` | `SecurityConfig`, `CorsConfig` |

### 2.3. Quy tắc đặt tên Biến, Thuộc tính và Hằng số
- **Thuộc tính & Biến cục bộ:** `camelCase`
  - Ví dụ: `userId`, `fullName`, `walletName`, `isActive`, `totalBalance`
- **Hằng số (`static final`):** `UPPER_SNAKE_CASE`
  - Ví dụ: `DEFAULT_PAGE_SIZE`, `MAX_BALANCE_LIMIT`, `JWT_EXPIRATION_MS`
- **Tập hợp (List, Set):** Danh từ số nhiều hoặc có hậu tố `List`, `Set`
  - Ví dụ: `wallets`, `transactionList`, `activeCategories`

### 2.4. Quy tắc đặt tên Phương thức (Methods)
Dùng `camelCase`, bắt đầu bằng động từ thể hiện rõ mục đích hành động:

| Mục đích | Tiền tố | Ví dụ |
| :--- | :--- | :--- |
| Lấy dữ liệu | `get...`, `find...` | `getWalletById(Long id)`, `findUsersByEmail(String email)` |
| Thêm mới | `create...`, `add...`, `save...` | `createWallet(WalletCreateRequest request)` |
| Cập nhật | `update...`, `modify...` | `updateWallet(Long id, WalletUpdateRequest request)` |
| Xóa / Ngừng | `delete...`, `deactivate...` | `deleteTransaction(Long id)`, `deactivateWallet(Long id)` |
| Kiểm tra | `is...`, `has...`, `exists...` | `existsByEmail(String email)`, `isWalletOwnedByUser(...)` |
| Tính toán | `calculate...` | `calculateTotalBalance(List<Wallet> wallets)` |

---

## 3. QUY ƯỚC RESTful API

### 3.1. Định dạng URL & HTTP Methods
- URL dùng chữ thường, phân cách bằng dấu gạch ngang (`kebab-case`), tài nguyên là danh từ số nhiều.
- Tiền tố API: `/api/v1`

| HTTP Method | Endpoint URI | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/v1/users/register` | Đăng ký tài khoản người dùng mới |
| `POST` | `/api/v1/auth/login` | Đăng nhập hệ thống |
| `GET` | `/api/v1/wallets` | Lấy danh sách ví của người dùng hiện tại |
| `POST` | `/api/v1/wallets` | Tạo ví mới |
| `GET` | `/api/v1/wallets/{id}` | Lấy chi tiết thông tin ví |
| `PUT` | `/api/v1/wallets/{id}` | Cập nhật ví (tên, thông tin) |
| `PATCH` | `/api/v1/wallets/{id}/deactivate` | Ngừng sử dụng ví |
| `GET` | `/api/v1/categories` | Lấy danh sách danh mục chi tiêu/thu nhập |
| `GET` | `/api/v1/transactions` | Lấy danh sách giao dịch (hỗ trợ lọc/phân trang) |
| `POST` | `/api/v1/transactions` | Tạo giao dịch mới (cập nhật số dư ví) |
| `GET` | `/api/v1/budgets` | Lấy danh sách ngân sách |
| `GET` | `/api/v1/reports/summary` | Lấy thống kê, báo cáo tài chính (Epic 5) |

### 3.2. Chuẩn cấu trúc Response JSON
Mọi phản hồi API đều đóng gói chung vào đối tượng `ApiResponse<T>`:
```json
{
  "code": 200,
  "message": "Success",
  "data": { ... }
}
```
Khi có lỗi:
```json
{
  "code": 400,
  "message": "Tên ví không được để trống",
  "data": null
}
```

---

## 4. QUY ƯỚC FRONTEND (REACT / TYPESCRIPT)

- **Component & Tệp Component:** `PascalCase`
  - Ví dụ: `WalletList.tsx`, `TransactionModal.tsx`, `DashboardCard.tsx`
- **Hook tùy chỉnh:** `camelCase`, tiền tố `use`
  - Ví dụ: `useWallets.ts`, `useAuth.ts`, `useTransactions.ts`
- **Service API & Helper:** `camelCase`
  - Ví dụ: `walletService.ts`, `formatCurrency.ts`, `dateFormatter.ts`
- **Interface & Type:** `PascalCase`
  - Ví dụ: `Wallet`, `Transaction`, `User`, `BudgetReport`
- **CSS Module / Styling:** `PascalCase.module.css` hoặc `kebab-case.css`

---

## 5. QUY TẮC VỀ KIỂM THỬ (TESTING CONVENTIONS)

Quy định chuẩn mực kiểm thử cho cả Backend và Frontend, đảm bảo chất lượng phần mềm, độ tin cậy và tự động hóa trong quy trình phát triển.

### 5.1. Phân loại và Công cụ Kiểm thử
- **Backend (Spring Boot):**
  - **Framework chính:** JUnit 5 (Jupiter), AssertJ, Mockito.
  - **Unit Test:** Kiểm thử độc lập từng tầng logic (Service, Helper, Utility) sử dụng Mockito để mock phụ thuộc.
  - **Integration Test:** Kiểm thử tích hợp luồng Controller -> Service -> DB bằng `@SpringBootTest`, `@AutoConfigureMockMvc`, hoặc `@DataJpaTest` (với H2 Database / Testcontainers).
- **Frontend (React / TypeScript):**
  - **Công cụ:** Jest / Vitest + React Testing Library.
  - Kiểm thử render Component, tương tác người dùng (click, input) và mock API calls.

### 5.2. Cấu trúc thư mục Test
Thư mục test phải phản chiếu chính xác cấu trúc gói của mã nguồn chính (`src/main` -> `src/test`):
```
backend/src/test/java/com/expensemanagement/backend
├── controller
│   └── WalletControllerTest.java
├── service
│   ├── UserServiceTest.java
│   └── WalletServiceTest.java
├── repository
│   └── WalletRepositoryTest.java
└── integration
    └── WalletIntegrationTest.java
```

### 5.3. Quy tắc đặt tên Lớp Test
Tên lớp test phải kết thúc bằng hậu tố `Test` (đối với Unit Test) hoặc `IntegrationTest` / `IT` (đối với Integration Test):
- Unit Test: `{TargetClass}Test` (ví dụ: `UserServiceTest`, `WalletServiceTest`).
- Integration Test: `{TargetModule}IntegrationTest` hoặc `{TargetClass}IT` (ví dụ: `WalletIntegrationTest`).
- Frontend Component Test: `{ComponentName}.test.tsx` (ví dụ: `WalletList.test.tsx`).

### 5.4. Quy tắc đặt tên Phương thức Test
Bắt buộc áp dụng cấu trúc 3 phần rõ ràng:
`{phươngThứcCầnTest}_{điềuKiệnĐầuVào}_{kếtQuảMongĐợi}`
hoặc dùng `@DisplayName` bằng tiếng Việt/tiếng Anh mô tả ngữ cảnh kiểm thử.

**Ví dụ:**
- `createWallet_withValidData_shouldReturnCreatedWallet()`
- `createWallet_withBlankName_shouldThrowValidationException()`
- `getWalletById_whenWalletNotExists_shouldThrowResourceNotFoundException()`
- `deactivateWallet_whenUserNotOwner_shouldThrowUnauthorizedException()`
- `calculateTotalBalance_withMultipleWallets_shouldReturnAccurateSum()`

### 5.5. Cấu trúc một hàm Test (Mô hình AAA / BDD)
Mọi hàm kiểm thử đều phải chia rõ 3 phần thông qua comment hoặc cấu trúc:
1. **Arrange (Given):** Chuẩn bị dữ liệu đầu vào, thiết lập các mock object (`when(...).thenReturn(...)`).
2. **Act (When):** Thực thi phương thức hoặc hành vi cần kiểm thử.
3. **Assert (Then):** Kiểm tra kết quả trả về (`assertThat(...)`), xác minh ngoại lệ ném ra và số lần gọi hàm mock (`verify(...)`).

```java
@Test
@DisplayName("Tạo ví thành công khi thông tin hợp lệ")
void createWallet_withValidData_shouldReturnCreatedWallet() {
    // 1. Arrange (Given)
    Long userId = 1L;
    WalletCreateRequest request = new WalletCreateRequest("Ví Tiết Kiệm", new BigDecimal("1000000.00"));
    Wallet savedWallet = Wallet.builder()
            .walletId(10L)
            .userId(userId)
            .walletName("Ví Tiết Kiệm")
            .balance(new BigDecimal("1000000.00"))
            .isActive(true)
            .build();

    when(walletRepository.save(any(Wallet.class))).thenReturn(savedWallet);

    // 2. Act (When)
    WalletResponse response = walletService.createWallet(userId, request);

    // 3. Assert (Then)
    assertThat(response).isNotNull();
    assertThat(response.getWalletId()).isEqualTo(10L);
    assertThat(response.getWalletName()).isEqualTo("Ví Tiết Kiệm");
    assertThat(response.getBalance()).isEqualByComparingTo("1000000.00");
    verify(walletRepository, times(1)).save(any(Wallet.class));
}
```

### 5.6. Tiêu chí và Độ bao phủ (Coverage Criteria)
- **Độ bao phủ tối thiểu (Code Coverage):**
  - Tầng Service (Business Logic): Tối thiểu **80% Line & Branch Coverage**.
  - Tầng Controller (Validation & Status Code): Tối thiểu **70% Coverage**.
  - Tầng Repository (Custom Query): Phải có Integration Test kiểm tra logic query.
- **Quy tắc biên & ngoại lệ:**
  - Bắt buộc kiểm thử các trường hợp biên: số dư = 0, số tiền âm, chuỗi rỗng, độ dài chuỗi tối đa.
  - Bắt buộc kiểm thử các trường hợp ném ngoại lệ (`assertThrows`): không tìm thấy dữ liệu, không có quyền truy cập, dữ liệu trùng lặp.
- **Tính độc lập:** Các test case phải độc lập hoàn toàn, không phụ thuộc vào thứ tự chạy hoặc trạng thái của test case trước đó. Không dùng dữ liệu thật trên Production để kiểm thử.

---

## 6. QUY ƯỚC GIT & QUẢN LÝ MÃ NGUỒN

### 6.1. Tên Nhánh (Branch Naming)
`{loại}/{mã-task-jira}-{mô-tả-ngắn}`
- `feature/QNK-15-coding-conventions`
- `feature/QNK-18-wallet-management-api`
- `bugfix/QNK-22-fix-balance-calculation`
- `hotfix/fix-login-token-expiration`

### 6.2. Định dạng Commit Message (Conventional Commits)
`{loại}({phạm-vi}): {mô tả ngắn bằng tiếng Việt hoặc tiếng Anh}`
- `feat(wallet): thêm API tạo mới và cập nhật ví`
- `fix(transaction): sửa lỗi không trừ tiền ví khi tạo giao dịch chi tiêu`
- `test(wallet): bổ sung unit test cho WalletService và WalletController`
- `docs(conventions): cập nhật quy tắc kiểm thử phần mềm`
- `refactor(user): chuẩn hóa tên Controller theo convention`
- Các loại commit: `feat`, `fix`, `test`, `docs`, `style`, `refactor`, `chore`.
