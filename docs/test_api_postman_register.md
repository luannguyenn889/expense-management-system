# TÀI LIỆU KIỂM THỬ API LUỒNG ĐĂNG KÝ (REGISTRATION FLOW) BẰNG POSTMAN

> **Mã công việc:** US1 / CNTT46-37 — Triển khai API đăng ký tài khoản  
> **Tập tin Postman Collection:** [`postman/Expense_Management_Registration_Flow.postman_collection.json`](../postman/Expense_Management_Registration_Flow.postman_collection.json)  
> **Tập tin Postman Environment:** [`postman/Expense_Management_Dev.postman_environment.json`](../postman/Expense_Management_Dev.postman_environment.json)  
> **Endpoint chính:** `POST /api/v1/users/register`  
> **Môi trường Backend:** `http://localhost:8080`

---

## 1. CÁCH IMPORT BỘ TEST VÀO POSTMAN

1. Mở ứng dụng **Postman**.
2. Nhấn nút **Import** (ở góc trên bên trái).
3. Kéo thả 2 file sau vào cửa sổ Import:
   - `postman/Expense_Management_Registration_Flow.postman_collection.json`
   - `postman/Expense_Management_Dev.postman_environment.json`
4. Chọn Environment **`Expense-Tracker-Dev`** ở góc trên bên phải của Postman.

---

## 2. DANH SÁCH TEST CASES TRONG BỘ TEST

| STT | Tên Test Case | HTTP Method | URL | Body Tóm Tắt | Kết Quả Mong Đợi (HTTP Code) |
| :--- | :--- | :---: | :--- | :--- | :---: |
| 1 | **Đăng ký thành công (Happy Path)** | `POST` | `{{baseUrl}}/api/v1/users/register` | username/email ngẫu nhiên, mật khẩu khớp | **201 Created** |
| 2 | **Đăng ký thất bại - Trùng Username** | `POST` | `{{baseUrl}}/api/v1/users/register` | `username: "nguyenvana"` | **409 Conflict** |
| 3 | **Đăng ký thất bại - Trùng Email** | `POST` | `{{baseUrl}}/api/v1/users/register` | `email: "nguyenvana@gmail.com"` | **409 Conflict** |
| 4 | **Đăng ký thất bại - Mật khẩu xác nhận không khớp** | `POST` | `{{baseUrl}}/api/v1/users/register` | `password` khác `confirmPassword` | **400 Bad Request** |
| 5 | **Đăng ký thất bại - Bỏ trống toàn bộ các trường** | `POST` | `{{baseUrl}}/api/v1/users/register` | Tất cả trường đều rỗng `""` | **400 Bad Request** |
| 6 | **Đăng ký thất bại - Email sai định dạng** | `POST` | `{{baseUrl}}/api/v1/users/register` | `email: "dinh_dang_email_sai"` | **400 Bad Request** |
| 7 | **Đăng ký thất bại - Username sai quy cách** | `POST` | `{{baseUrl}}/api/v1/users/register` | `username: "u!"` (dưới 3 ký tự, ký tự lạ) | **400 Bad Request** |
| 8 | **Đăng ký thất bại - Mật khẩu quá ngắn** | `POST` | `{{baseUrl}}/api/v1/users/register` | `password: "12345"` (< 8 ký tự) | **400 Bad Request** |

---

## 3. CHI TIẾT REQUEST VÀ SCRIPT KIỂM THỬ TỰ ĐỘNG

### 3.1. Đăng ký thành công (Happy Path)
* **Pre-request Script (Tự động sinh tài khoản ngẫu nhiên để test nhiều lần):**
  ```javascript
  const randomSuffix = Math.floor(Math.random() * 100000);
  pm.variables.set("dynUsername", "user_" + randomSuffix);
  pm.variables.set("dynEmail", "user_" + randomSuffix + "@gmail.com");
  ```
* **Request Body:**
  ```json
  {
    "username": "{{dynUsername}}",
    "fullName": "Nguyễn Văn Đăng Ký",
    "email": "{{dynEmail}}",
    "password": "Password123@",
    "confirmPassword": "Password123@"
  }
  ```
* **Postman Tests (Tự động assert kết quả):**
  ```javascript
  pm.test("Status code is 201 Created", function () {
      pm.response.to.have.status(201);
  });

  pm.test("Kiểm tra chuẩn ApiResponse và dữ liệu User trả về", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData.code).to.eql(201);
      pm.expect(jsonData.message).to.eql("Đăng ký thành công");
      pm.expect(jsonData.data).to.be.an("object");
      pm.expect(jsonData.data.userId).to.be.a("number");
      pm.expect(jsonData.data.username).to.eql(pm.variables.get("dynUsername"));
      pm.expect(jsonData.data.email).to.eql(pm.variables.get("dynEmail"));
      pm.expect(jsonData.data.password).to.be.undefined;
      pm.expect(jsonData.data.passwordHash).to.be.undefined;
  });
  ```

---

## 4. CHẠY TỰ ĐỘNG BẰNG POSTMAN RUNNER (COLLECTION RUNNER)

1. Chuột phải vào Collection **Expense Management - Luồng Đăng Ký (CNTT46-37)** > Chọn **Run collection**.
2. Chọn môi trường **Expense-Tracker-Dev**.
3. Nhấn **Run Expense Management - Luồng Đăng Ký**.
4. Toàn bộ 8 test cases sẽ được thực thi tự động và hiển thị kết quả **PASSED (Green)**.
