# TÀI LIỆU KIỂM THỬ API TRÊN POSTMAN — DÀNH CHO THÀNH VIÊN 1 (SCRUM MASTER & DEV BE)

> **Mục đích:** Hướng dẫn Thành viên 1 thực hiện kiểm thử thủ công và tự động hóa toàn bộ danh mục API đã xây dựng trong Sprint 1 (Đăng ký, Đăng nhập thường, Đăng nhập Google, Quản lý ví) trên **Postman**, phục vụ nghiệm thu Pull Request, kiểm tra chất lượng trước khi bàn giao cho Tester (TV4) và chuẩn bị kịch bản demo Sprint Review.
>
> **Môi trường Backend:** `http://localhost:8080`  
> **Cơ sở dữ liệu:** MySQL (`quan_ly_chi_tieu`)  
> **Tiêu chuẩn dữ liệu:** Tuân thủ 100% [CODING_CONVENTIONS.md](../CODING_CONVENTIONS.md)

---

## 1. THIẾT LẬP MÔI TRƯỜNG POSTMAN (ENVIRONMENT)

Tạo một Environment mới trên Postman đặt tên là: `Expense-Tracker-Dev` với các biến:

| Variable Name | Initial Value | Current Value | Mô tả |
| :--- | :--- | :--- | :--- |
| `baseUrl` | `http://localhost:8080` | `http://localhost:8080` | Địa chỉ Backend Spring Boot |
| `accessToken` | *(để trống)* | *(tự động cập nhật khi login)* | Bearer Token dùng cho các API bảo vệ |
| `googleClientId` | `569426721711-6ub3hgomi74b201otif6cpe3oq53s5fj.apps.googleusercontent.com` | `569426721711-6ub3hgomi74b201otif6cpe3oq53s5fj.apps.googleusercontent.com` | Google OAuth Client ID |

---

## 2. DANH MỤC CÁC ENDPOINT CẦN KIỂM THỬ

```
📦 SPRINT 1 - POSTMAN COLLECTION
 ├── 📂 0. Health Check
 │    └── 0.1. Kiểm tra trạng thái máy chủ [GET /api/health]
 ├── 📂 1. Epic 1: Quản lý Tài khoản (US1 & US2)
 │    ├── 1.1. Đăng ký tài khoản thành công [POST /api/v1/users/register]
 │    ├── 1.2. Đăng ký thất bại - Trùng Email [POST /api/v1/users/register]
 │    ├── 1.3. Đăng ký thất bại - Dữ liệu không hợp lệ [POST /api/v1/users/register]
 │    ├── 1.4. Đăng nhập thành công (Lấy JWT) [POST /api/v1/auth/login]
 │    ├── 1.5. Đăng nhập thất bại - Sai mật khẩu [POST /api/v1/auth/login]
 │    ├── 1.6. Đăng nhập thất bại - Email không tồn tại [POST /api/v1/auth/login]
 │    ├── 1.7. Đăng nhập Google thành công [POST /api/v1/auth/google]
 │    └── 1.8. Đăng nhập Google thất bại - Token rác [POST /api/v1/auth/google]
 └── 📂 2. Epic 2: Quản lý Ví (US4 & US5)
      ├── 2.1. Tạo ví mới thành công có số dư [POST /api/v1/wallets]
      ├── 2.2. Tạo ví mới không truyền số dư (Mặc định 0.00) [POST /api/v1/wallets]
      ├── 2.3. Tạo ví thất bại - Số dư âm [POST /api/v1/wallets]
      ├── 2.4. Tạo ví thất bại - Chưa đăng nhập (Không Token) [POST /api/v1/wallets]
      ├── 2.5. Xem danh sách ví của tài khoản [GET /api/v1/wallets]
      └── 2.6. Xem danh sách ví thất bại - Token hết hạn/Sai [GET /api/v1/wallets]
```

---

## 3. CHI TIẾT TỪNG REQUEST KIỂM THỬ

### 📂 NHÓM 0: HỆ THỐNG (HEALTH CHECK)

#### Request 0.1: Kiểm tra trạng thái máy chủ
* **Method:** `GET`
* **URL:** `{{baseUrl}}/api/health`
* **Headers:** Không yêu cầu
* **Mã HTTP mong đợi:** `200 OK`
* **Response mẫu:**
  ```json
  {
    "status": "ok"
  }
  ```
* **Postman Test Script:**
  ```javascript
  pm.test("Status code is 200", function () {
      pm.response.to.have.status(200);
  });
  pm.test("Server health is ok", function () {
      var json = pm.response.json();
      pm.expect(json.status).to.eql("ok");
  });
  ```

---

### 📂 NHÓM 1: QUẢN LÝ TÀI KHOẢN (EPIC 1)

#### Request 1.1: Đăng ký tài khoản thành công (US1)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/users/register`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "fullName": "Nguyen Van A",
    "email": "nguyenvana@gmail.com",
    "password": "Password123@"
  }
  ```
* **Mã HTTP mong đợi:** `201 Created`
* **Response mẫu:**
  ```json
  {
    "code": 201,
    "message": "Đăng ký tài khoản thành công",
    "data": {
      "userId": 1,
      "fullName": "Nguyen Van A",
      "email": "nguyenvana@gmail.com",
      "createdAt": "2026-11-04T22:15:00",
      "updatedAt": "2026-11-04T22:15:00"
    }
  }
  ```
* **Postman Test Script:**
  ```javascript
  pm.test("Status code is 201 Created", function () {
      pm.response.to.have.status(201);
  });
  pm.test("Response wrapper conforms to ApiResponse convention", function () {
      var json = pm.response.json();
      pm.expect(json.code).to.eql(201);
      pm.expect(json.data.email).to.eql("nguyenvana@gmail.com");
      pm.expect(json.data).to.not.have.property("password");
      pm.expect(json.data).to.not.have.property("passwordHash");
  });
  ```

#### Request 1.2: Đăng ký thất bại — Trùng Email (US1)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/users/register`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "fullName": "Nguyen Van A Clone",
    "email": "nguyenvana@gmail.com",
    "password": "Password123@"
  }
  ```
* **Mã HTTP mong đợi:** `409 Conflict`
* **Response mẫu:**
  ```json
  {
    "code": 409,
    "message": "Email đã được sử dụng",
    "data": null
  }
  ```
* **Postman Test Script:**
  ```javascript
  pm.test("Status code is 409 Conflict", function () {
      pm.response.to.have.status(409);
  });
  pm.test("Error message is correct", function () {
      var json = pm.response.json();
      pm.expect(json.message).to.eql("Email đã được sử dụng");
  });
  ```

#### Request 1.3: Đăng ký thất bại — Dữ liệu không hợp lệ (US1)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/users/register`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "fullName": "",
    "email": "sai-dinh-dang-email",
    "password": "123"
  }
  ```
* **Mã HTTP mong đợi:** `400 Bad Request`
* **Response mẫu:**
  ```json
  {
    "code": 400,
    "message": "Họ và tên không được để trống; Email không đúng định dạng; Mật khẩu phải từ 8 đến 72 ký tự",
    "data": null
  }
  ```

---

#### Request 1.4: Đăng nhập thành công — Lấy JWT Token (US2)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/auth/login`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "email": "nguyenvana@gmail.com",
    "password": "Password123@"
  }
  ```
* **Mã HTTP mong đợi:** `200 OK`
* **Response mẫu:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzg5LCJleHAiOjE3OTB9...",
      "tokenType": "Bearer",
      "expiresIn": 86400,
      "user": {
        "userId": 1,
        "fullName": "Nguyen Van A",
        "email": "nguyenvana@gmail.com",
        "createdAt": "2026-11-04T22:15:00",
        "updatedAt": "2026-11-04T22:15:00"
      }
    }
  }
  ```
* **Postman Test Script (Tự động lưu Token vào biến môi trường):**
  ```javascript
  pm.test("Status code is 200 OK", function () {
      pm.response.to.have.status(200);
  });
  pm.test("Token returned and auto-saved to environment", function () {
      var json = pm.response.json();
      pm.expect(json.data.accessToken).to.be.a("string").and.not.empty;
      pm.expect(json.data.tokenType).to.eql("Bearer");
      
      // Tự động gán token cho các request tiếp theo
      pm.environment.set("accessToken", json.data.accessToken);
  });
  ```

#### Request 1.5: Đăng nhập thất bại — Sai Mật khẩu (US2)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/auth/login`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "email": "nguyenvana@gmail.com",
    "password": "SaiMatKhau123@"
  }
  ```
* **Mã HTTP mong đợi:** `401 Unauthorized`
* **Response mẫu (Không được tiết lộ sai mật khẩu hay sai email):**
  ```json
  {
    "code": 401,
    "message": "Email hoặc mật khẩu không chính xác",
    "data": null
  }
  ```

#### Request 1.6: Đăng nhập thất bại — Email không tồn tại (US2)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/auth/login`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "email": "khongtontai@gmail.com",
    "password": "Password123@"
  }
  ```
* **Mã HTTP mong đợi:** `401 Unauthorized`
* **Response mẫu (Thông báo lỗi đồng nhất với 1.5):**
  ```json
  {
    "code": 401,
    "message": "Email hoặc mật khẩu không chính xác",
    "data": null
  }
  ```

---

#### Request 1.7: Đăng nhập bằng Google (Google OAuth Login)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/auth/google`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "idToken": "<chuỗi_google_id_token_lấy_từ_frontend_google_identity>"
  }
  ```
* **Mã HTTP mong đợi khi token hợp lệ:** `200 OK`
* **Response mẫu:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
      "tokenType": "Bearer",
      "expiresIn": 86400,
      "user": {
        "userId": 2,
        "fullName": "Google Account Name",
        "email": "user.google@gmail.com",
        "createdAt": "2026-11-04T22:20:00",
        "updatedAt": "2026-11-04T22:20:00"
      }
    }
  }
  ```

#### Request 1.8: Đăng nhập Google thất bại — Token rác/không hợp lệ
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/auth/google`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "idToken": "fake_google_id_token_12345"
  }
  ```
* **Mã HTTP mong đợi:** `401 Unauthorized`
* **Response mẫu:**
  ```json
  {
    "code": 401,
    "message": "Google ID Token không hợp lệ hoặc đã hết hạn",
    "data": null
  }
  ```

---

### 📂 NHÓM 2: QUẢN LÝ VÍ (EPIC 2)

#### Request 2.1: Tạo ví mới thành công có số dư ban đầu (US4)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/wallets`
* **Headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer {{accessToken}}`
* **Body (raw JSON):**
  ```json
  {
    "walletName": "Ví Chi Tiêu Hàng Ngày",
    "balance": 2500000.00
  }
  ```
* **Mã HTTP mong đợi:** `201 Created`
* **Response mẫu:**
  ```json
  {
    "code": 201,
    "message": "Tạo ví thành công",
    "data": {
      "walletId": 1,
      "userId": 1,
      "walletName": "Ví Chi Tiêu Hàng Ngày",
      "balance": 2500000.00,
      "isActive": true,
      "createdAt": "2026-11-04T22:25:00",
      "updatedAt": "2026-11-04T22:25:00"
    }
  }
  ```
* **Postman Test Script:**
  ```javascript
  pm.test("Status code is 201 Created", function () {
      pm.response.to.have.status(201);
  });
  pm.test("Wallet created with correct balance and owner", function () {
      var json = pm.response.json();
      pm.expect(json.data.walletName).to.eql("Ví Chi Tiêu Hàng Ngày");
      pm.expect(parseFloat(json.data.balance)).to.eql(2500000.00);
      pm.expect(json.data.isActive).to.be.true;
  });
  ```

#### Request 2.2: Tạo ví không truyền số dư — Mặc định 0.00 (US4)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/wallets`
* **Headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer {{accessToken}}`
* **Body (raw JSON):**
  ```json
  {
    "walletName": "Ví Tiết Kiệm Mới"
  }
  ```
* **Mã HTTP mong đợi:** `201 Created`
* **Response mẫu:**
  ```json
  {
    "code": 201,
    "message": "Tạo ví thành công",
    "data": {
      "walletId": 2,
      "userId": 1,
      "walletName": "Ví Tiết Kiệm Mới",
      "balance": 0.00,
      "isActive": true,
      "createdAt": "2026-11-04T22:26:00",
      "updatedAt": "2026-11-04T22:26:00"
    }
  }
  ```
* **Postman Test Script:**
  ```javascript
  pm.test("Balance defaults to 0.00 when omitted", function () {
      var json = pm.response.json();
      pm.expect(parseFloat(json.data.balance)).to.eql(0.00);
  });
  ```

#### Request 2.3: Tạo ví thất bại — Số dư âm (US4)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/wallets`
* **Headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer {{accessToken}}`
* **Body (raw JSON):**
  ```json
  {
    "walletName": "Ví Lỗi",
    "balance": -50000.00
  }
  ```
* **Mã HTTP mong đợi:** `400 Bad Request`
* **Response mẫu:**
  ```json
  {
    "code": 400,
    "message": "Số dư không được âm",
    "data": null
  }
  ```

#### Request 2.4: Tạo ví thất bại — Chưa đăng nhập (Không có Bearer Token) (US4)
* **Method:** `POST`
* **URL:** `{{baseUrl}}/api/v1/wallets`
* **Headers:**
  * `Content-Type: application/json`
  * *(Xóa header Authorization)*
* **Body (raw JSON):**
  ```json
  {
    "walletName": "Ví Hacker"
  }
  ```
* **Mã HTTP mong đợi:** `403 Forbidden`
* **Ý nghĩa:** Chứng minh lớp bảo vệ `SecurityConfig` chặn đứng truy cập trái phép.

---

#### Request 2.5: Xem danh sách ví của tài khoản hiện tại (US5)
* **Method:** `GET`
* **URL:** `{{baseUrl}}/api/v1/wallets`
* **Headers:** `Authorization: Bearer {{accessToken}}`
* **Mã HTTP mong đợi:** `200 OK`
* **Response mẫu:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "walletId": 1,
        "userId": 1,
        "walletName": "Ví Chi Tiêu Hàng Ngày",
        "balance": 2500000.00,
        "isActive": true,
        "createdAt": "2026-11-04T22:25:00",
        "updatedAt": "2026-11-04T22:25:00"
      },
      {
        "walletId": 2,
        "userId": 1,
        "walletName": "Ví Tiết Kiệm Mới",
        "balance": 0.00,
        "isActive": true,
        "createdAt": "2026-11-04T22:26:00",
        "updatedAt": "2026-11-04T22:26:00"
      }
    ]
  }
  ```
* **Postman Test Script:**
  ```javascript
  pm.test("Status code is 200 OK", function () {
      pm.response.to.have.status(200);
  });
  pm.test("Wallets returned as array", function () {
      var json = pm.response.json();
      pm.expect(json.data).to.be.an("array");
      pm.expect(json.data.length).to.be.at.least(1);
      // Kiểm tra tất cả ví đều thuộc về đúng tài khoản đang đăng nhập
      json.data.forEach(function(wallet) {
          pm.expect(wallet.userId).to.eql(1);
      });
  });
  ```

#### Request 2.6: Xem danh sách ví thất bại — Token không hợp lệ
* **Method:** `GET`
* **URL:** `{{baseUrl}}/api/v1/wallets`
* **Headers:** `Authorization: Bearer chuoi_token_gia_mao_123`
* **Mã HTTP mong đợi:** `403 Forbidden`

---

## 4. KỊCH BẢN CHẠY LIÊN HOÀN (COLLECTION RUNNER)

TV1 có thể mở Postman và bấm **Run Collection** theo đúng thứ tự luồng dưới đây để tự động hóa 100% việc nghiệm thu:

1. `GET /api/health` $\rightarrow$ Xác nhận Server Online.
2. `POST /api/v1/users/register` $\rightarrow$ Tạo tài khoản mới.
3. `POST /api/v1/auth/login` $\rightarrow$ Lấy `accessToken` và lưu tự động vào Environment.
4. `POST /api/v1/wallets` (Ví 1) $\rightarrow$ Tạo ví với số dư ban đầu `2,500,000 VND`.
5. `POST /api/v1/wallets` (Ví 2) $\rightarrow$ Tạo ví không truyền số dư (kiểm tra mặc định `0.00 VND`).
6. `POST /api/v1/wallets` (Ví lỗi) $\rightarrow$ Gửi số dư âm `-50,000 VND` (xác nhận lỗi 400).
7. `GET /api/v1/wallets` $\rightarrow$ Lấy danh sách ví (xác nhận hiển thị đủ 2 ví của tài khoản).

> [!TIP]
> **Xuất file báo cáo:** TV1 có thể hướng dẫn TV4 export Collection này thành file `tests/api/sprint1.postman_collection.json` và chạy qua Newman CLI để xuất file `sprint1-report.html` đính kèm vào Báo cáo Sprint 1 nộp Giảng viên.

