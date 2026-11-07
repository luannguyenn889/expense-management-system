# NHIỆM VỤ CHI TIẾT SPRINT 1 — THÀNH VIÊN 3
## VAI TRÒ: DEVELOPER FRONTEND (ANGULAR 21) CHUYÊN TRÁCH

> **Dự án:** Hệ thống Quản lý Chi tiêu Cá nhân  
> **Sprint:** Sprint 1 — Tài khoản và Ví cơ bản (Thời lượng: 2 tuần / 10 ngày làm việc)  
> **Họ và tên:** `[Điền Họ và Tên]`  
> **MSSV:** `[Điền MSSV]`  
> **Nhánh Git phụ trách:** `chore/QNK-setup-frontend`, `feature/QNK-auth-ui`, `feature/QNK-wallet-ui`  
> **Phân loại nhiệm vụ:** **Developer Frontend chuyên trách 100%** (Chịu trách nhiệm toàn bộ giao diện và Spec Test, không làm QA Test Case)  
> **Story Point (SP) đảm nhiệm:** **6 SP Dev** (US3: 3 SP + US6: 3 SP)  
> **Điểm quy đổi Sprint dự kiến:** **6.0 điểm** ($100\% \times 6$)  

---

## 1. TỔNG QUAN TRÁCH NHIỆM
Thành viên 3 là lập trình viên duy nhất phụ trách toàn bộ giao diện Web của dự án trên nền tảng **Angular 21**:
1. **Thiết lập kiến trúc Frontend hiện đại:** Standalone Components, Angular Signals, Reactive Forms, cấu hình HTTP Interceptor gắn token và xử lý lỗi 401, bảo vệ route bằng Functional Guard.
2. **US3: [FE] Giao diện đăng ký và đăng nhập (3 SP):** Form tương tác trực quan, validate client-side, quản lý phiên làm việc.
3. **US6: [FE] Giao diện quản lý ví (3 SP):** Danh sách ví, tự động tính tổng số dư tài sản bằng `computed()`, trạng thái rỗng `@empty`, modal tạo ví mới.

---

## 2. CHI TIẾT CÁC ĐẦU VIỆC CẦN THỰC HIỆN

### PHẦN I: THIẾT LẬP KIẾN TRÚC FRONTEND ANGULAR 21 (NGÀY 1 - 2)
* [ ] Dọn dẹp code mẫu trong `frontend/src/app/app.html`, giữ lại `<router-outlet></router-outlet>` và thanh Header chung (chứa nút Đăng xuất).
* [ ] Thiết lập `src/environments/environment.ts` chứa `apiUrl: 'http://localhost:8080/api/v1'`.
* [ ] Tổ chức thư mục chuẩn theo Coding Conventions:
  * `core/models/`: `api-response.model.ts`, `user.model.ts`, `wallet.model.ts`.
  * `core/services/`: `auth.service.ts`, `wallet.service.ts`.
  * `core/interceptors/`: `auth.interceptor.ts`.
  * `core/guards/`: `auth.guard.ts`.
  * `shared/pipes/`: `currency-vnd.pipe.ts`.
* [ ] Cấu hình `app.config.ts`: `provideHttpClient(withInterceptors([authInterceptor]))`.
* [ ] **`auth.interceptor.ts`:** Tự động gắn Bearer token vào request; bắt lỗi 401 để tự động xóa token và chuyển hướng về `/login`.
* [ ] **`auth.guard.ts`:** Chặn người dùng chưa đăng nhập truy cập vào các trang bảo vệ (như `/wallets`).

---

### PHẦN II: PHÁT TRIỂN US3 — [FE] GIAO DIỆN ĐĂNG KÝ VÀ ĐĂNG NHẬP (3 SP DEV)
* [ ] **Trang `/register` (`features/auth/register`):**
  * Form gồm: Họ tên (`fullName`), Email (`email`), Mật khẩu (`password`), Nhập lại mật khẩu (`confirmPassword`).
  * Sử dụng Reactive Forms (`FormBuilder`, `Validators`). Validate trực quan: Báo lỗi khi để trống, sai định dạng email, mật khẩu < 8 ký tự, lỗi không khớp mật khẩu.
  * Disable nút bấm Submit khi form invalid hoặc đang gửi request. Đăng ký thành công tự động chuyển sang `/login`.
* [ ] **Trang `/login` (`features/auth/login`):**
  * Form gồm: Email, Mật khẩu.
  * Đăng nhập thành công: Lưu token vào `localStorage`, cập nhật Signal `currentUser`, chuyển sang `/wallets`.
  * Đăng nhập thất bại: Hiển thị thông báo lỗi rõ ràng từ `ApiResponse` của Backend.
* [ ] Nút **Đăng xuất** trên thanh điều hướng chung: Xóa token, reset user và đưa về `/login`.
* [ ] **Viết Component Test (Vitest + TestBed):**
  * `register.spec.ts`: Kiểm tra validate form, gọi hàm register khi submit hợp lệ.
  * `login.spec.ts`: Kiểm tra hiển thị thông báo lỗi khi đăng nhập thất bại.
  * `auth.service.spec.ts`: Dùng `HttpTestingController` kiểm tra gọi đúng endpoint.

---

### PHẦN III: PHÁT TRIỂN US6 — [FE] GIAO DIỆN QUẢN LÝ VÍ (3 SP DEV)
* [ ] **Trang `/wallets` (Bảo vệ bởi `authGuard`):**
  * Gọi `wallet.service.ts` lấy danh sách ví của người dùng.
  * Hiển thị danh sách thẻ ví bằng control flow `@for (wallet of wallets(); track wallet.walletId)`.
  * Tính tổng số dư tài sản bằng Signal `computed()`:
    ```typescript
    totalBalance = computed(() => this.wallets().reduce((sum, w) => sum + Number(w.balance), 0));
    ```
  * Custom Pipe `currencyVnd`: Định dạng số tiền kiểu Việt Nam (ví dụ `1.000.000 ₫`).
  * Trạng thái rỗng (`@empty`): Hiển thị thông báo thân thiện khi chưa có ví: *"Bạn chưa có ví nào. Hãy tạo ví đầu tiên!"* kèm nút Tạo ví mới.
* [ ] **Modal/Form Tạo ví (`features/wallet/wallet-create-form`):**
  * Nhập Tên ví (`walletName`), Số dư ban đầu (`initialBalance`).
  * Validate bắt buộc nhập tên ví, số dư không âm.
  * Tạo thành công: Tự động đóng modal, danh sách ví cập nhật ngay lập tức.
* [ ] **Viết Component Test:**
  * `wallet-list.spec.ts`: Kiểm tra render đúng số lượng ví, hiển thị đúng khối empty state.
  * `wallet-create-form.spec.ts`: Kiểm tra chặn submit khi tên ví trống.
  * `currency-vnd.pipe.spec.ts`: Kiểm tra format tiền tệ VND chuẩn.

---

## 3. LỊCH TRÌNH 10 NGÀY CỦA THÀNH VIÊN 3

| Ngày | Chi tiết công việc thực hiện | Sản phẩm bàn giao |
| :---: | :--- | :--- |
| **Ngày 1** | Thống nhất API Contract với BE; tạo cấu trúc thư mục Angular, `environment.ts`. | Cấu trúc Frontend hoàn chỉnh. |
| **Ngày 2** | Viết Models TypeScript, `auth.service.ts`, `auth.interceptor.ts`, `auth.guard.ts`. | Tầng Core frontend sẵn sàng. |
| **Ngày 3** | Implement form Đăng ký & Đăng nhập (Reactive Forms), validate trực quan. | Nhánh `feature/auth-ui` sẵn sàng. |
| **Ngày 4** | Viết component test `register.spec.ts`, `login.spec.ts`; nối API thật của BE. | Mở PR US3; bàn giao cho TV4 test. |
| **Ngày 5** | Tạo `currency-vnd.pipe.ts`, `wallet.service.ts`, dựng giao diện trang `/wallets`. | Nhánh `feature/wallet-ui` sẵn sàng. |
| **Ngày 6** | Code modal tạo ví mới, xử lý Signal `computed()` tính tổng tài sản. | Giao diện quản lý ví hoàn thiện. |
| **Ngày 7** | Tham gia họp Mid-sprint Check; nối giao diện ví với API tạo ví và xem ví của BE. | Luồng ví chạy thông suốt trên Web. |
| **Ngày 8** | Tiếp nhận các ticket Bug UI từ TV4 và thực hiện sửa lỗi (Bug Fix). | Đóng các Bug giao diện trên Jira. |
| **Ngày 9** | Hoàn thiện component test `wallet-list.spec.ts`, `wallet-create-form.spec.ts`. | `ng test` Pass 100%; Mở PR US6. |
| **Ngày 10** | Trình diễn trực tiếp demo toàn bộ giao diện Web trong buổi Sprint Review. | Chốt 6 SP Dev sang trạng thái `Done`. |
