# KẾ HOẠCH TỔNG THỂ 3 SPRINTS (PROJECT ROADMAP — 3 SPRINTS)
## HỆ THỐNG QUẢN LÝ CHI TIÊU CÁ NHÂN (6 EPICS)

> **Môn học:** Phát triển Phần mềm Chuyên nghiệp (PMCN)  
> **Quy mô:** Nhóm 4 thành viên (1 Scrum Master kiêm Dev BE, 2 Dev BE, 1 Dev FE)  
> **Mô hình làm việc:** Agile/Scrum kết hợp **Kiểm thử chéo (Cross-Testing)** — tất cả thành viên đều có đóng góp về Code (có Unit Test) và Kiểm thử (có Test Case / Automation Test).  
> **Thời gian:** 3 Sprints (Mỗi Sprint 2 tuần / 10 ngày làm việc).

---

## 1. MA TRẬN PHÂN CHIA 6 EPICS VÀO 3 SPRINTS

```
        SPRINT 1                         SPRINT 2                         SPRINT 3
 ┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
 │  NỀN TẢNG & NGUỒN   │   ───>   │  NGHIỆP VỤ CỐT LÕI  │   ───>   │  NÂNG CAO & BÁO CÁO │
 │  Tài khoản & Ví     │          │  Danh mục & Giao dịch│          │  Ngân sách, Báo cáo │
 └─────────────────────┘          └─────────────────────┘          └─────────────────────┘
     Epic 1 & Epic 2                  Epic 3 & Epic 4                  Epic 5 & Epic 6
```

| Sprint | Chủ đề chính | Epics đảm nhiệm | Bảng CSDL | Mục tiêu bàn giao (Sprint Goal) |
| :---: | :--- | :--- | :--- | :--- |
| **SPRINT 1** | **Nền tảng & Nguồn tiền** | **Epic 1:** Quản lý Tài khoản<br>**Epic 2:** Quản lý Ví cơ bản | `users`<br>`wallets` | Người dùng đăng ký tài khoản, đăng nhập bảo mật bằng JWT, tạo và xem danh sách ví, tính tổng số dư tài sản. |
| **SPRINT 2** | **Nghiệp vụ cốt lõi** | **Epic 3:** Quản lý Danh mục<br>**Epic 4:** Ghi chép Giao dịch | `categories`<br>`transactions` | Tạo danh mục Thu/Chi, tạo giao dịch chi tiêu/thu nhập tự động cộng/trừ số dư ví theo giao dịch ACID (`@Transactional`), xem lịch sử giao dịch. |
| **SPRINT 3** | **Quản trị & Phân tích** | **Epic 6:** Quản lý Ngân sách<br>**Epic 5:** Báo cáo & Thống kê | `budgets`<br>Tổng hợp số liệu | Thiết lập hạn mức chi tiêu theo danh mục, cảnh báo vượt ngân sách, vẽ biểu đồ tròn/cột phân tích dòng tiền, xuất báo cáo Excel/PDF. |

---

## 2. LỘ TRÌNH CHI TIẾT TỪNG SPRINT

### SPRINT 1: TÀI KHOẢN & VÍ CƠ BẢN
* **Khối lượng dự kiến:** 17 SP Dev + 17 SP Test = 25.5 điểm quy đổi.
* **Backend:** Kiến trúc JWT + Security, API Đăng ký (`POST /users/register`), API Đăng nhập (`POST /auth/login`), API Tạo ví (`POST /wallets`), API Danh sách ví (`GET /wallets`).
* **Frontend (Angular 21):** Kiến trúc `core/features/shared`, `authInterceptor`, `authGuard`, Màn hình Đăng ký, Đăng nhập, Trang danh sách ví & Modal tạo ví.
* **Testing:** Postman Collection API Đăng ký, Đăng nhập, Ví + Automation Newman CLI, Unit Test đạt $\ge 80\%$ tầng Service.

### SPRINT 2: DANH MỤC & QUẢN LÝ GIAO DỊCH
* **Khối lượng dự kiến:** 18 SP Dev + 18 SP Test = 27.0 điểm quy đổi.
* **Backend:**
  * Quản lý Danh mục: API lấy danh mục mặc định (`user_id IS NULL`) + danh mục riêng của người dùng, API tạo danh mục cá nhân (`POST /categories`).
  * Quản lý Giao dịch: API tạo giao dịch Thu / Chi (`POST /transactions`) $\rightarrow$ Tự động kiểm tra số dư ví, trừ tiền khi Chi, cộng tiền khi Thu; API lấy danh sách lịch sử giao dịch (`GET /transactions`) có lọc theo ngày, theo ví.
* **Frontend:**
  * Màn hình quản lý Danh mục Thu/Chi (biểu tượng, màu sắc).
  * Màn hình tạo Giao dịch nhanh: Chọn ví chi tiền, chọn danh mục, nhập số tiền, ngày giao dịch.
  * Màn hình lịch sử giao dịch: Danh sách giao dịch phân tách theo ngày, hiển thị màu xanh (Thu) và đỏ (Chi).
* **Testing:** Kiểm thử toàn vẹn giao dịch (Transaction Integrity): Số dư ví có trừ đúng số tiền giao dịch không? Chặn giao dịch chi vượt quá số dư nếu ví không cho phép số dư âm. Kế thừa bộ test Sprint 1.

### SPRINT 3: HẠN MỨC NGÂN SÁCH & BÁO CÁO THỐNG KÊ
* **Khối lượng dự kiến:** 18 SP Dev + 18 SP Test = 27.0 điểm quy đổi.
* **Backend:**
  * Quản lý Ngân sách: API thiết lập hạn mức chi tiêu theo danh mục (`POST /budgets`), API tính toán tiến độ sử dụng ngân sách (% đã tiêu trong tháng).
  * Báo cáo & Thống kê: API tổng hợp dòng tiền (`GET /reports/summary`), phân tích tỷ trọng chi tiêu theo danh mục, so sánh Thu vs Chi.
  * API xuất báo cáo Excel (`.xlsx`) và PDF (sử dụng Apache POI / iText).
* **Frontend:**
  * Màn hình Hạn mức ngân sách: Thanh tiến độ (Progress bar) đổi màu (Xanh: an toàn $\rightarrow$ Vàng: cảnh báo $80\%$ $\rightarrow$ Đỏ: vượt ngân sách).
  * Dashboard Báo cáo trực quan: Biểu đồ tròn (Pie chart) chi tiêu theo danh mục, biểu đồ cột (Bar chart) dòng tiền theo tháng.
  * Chức năng tải file báo cáo tài chính Excel / PDF.
* **Testing:** Chạy toàn bộ bộ test tích hợp Regression Test từ Sprint 1 $\rightarrow$ Sprint 3, nghiệm thu toàn bộ 6 Epics của hệ thống.

---

## 3. PHÂN CÔNG VAI TRÒ XUYÊN SUỐT 3 SPRINTS (3 DEV + 1 TESTER CHUYÊN TRÁCH)

| Thành viên | Vai trò chuyên trách | Trách nhiệm Sprint 1 | Trách nhiệm Sprint 2 | Trách nhiệm Sprint 3 |
| :--- | :--- | :--- | :--- | :--- |
| **TV1** | **Scrum Master kiêm Dev BE** | - Quản trị Scrum, Jira<br>- Setup Base Backend, Database<br>- Code `US1: Đăng ký tài khoản` (3 SP)<br>- Unit Test `UserServiceTest` | - Quản trị Scrum, Jira<br>- Code API Quản lý Danh mục Thu/Chi<br>- Unit Test Danh mục | - Quản trị Scrum, Jira<br>- Code API Thống kê Báo cáo & Xuất file Excel/PDF<br>- Unit Test Báo cáo |
| **TV2** | **Dev BE chuyên trách** | - Hạ tầng Spring Security & JWT<br>- Code `US2: Đăng nhập` (3 SP)<br>- Code `US4: Tạo ví mới` (3 SP)<br>- Code `US5: Xem danh sách ví` (2 SP)<br>- Unit Test `AuthServiceTest`, `WalletServiceTest` | - Code API Tạo Giao dịch Thu/Chi (Xử lý trừ/cộng tiền ví, transaction atomicity)<br>- API Lọc & Tìm kiếm Lịch sử Giao dịch<br>- Unit Test Giao dịch | - Code API Thiết lập & Quản lý Ngân sách<br>- Logic cảnh báo vượt hạn mức chi tiêu<br>- API Tóm tắt Dashboard tổng quan<br>- Unit Test Ngân sách |
| **TV3** | **Dev FE chuyên trách** | - Khởi tạo Base Angular 21 (Standalone, Signals, Tailwind)<br>- Code `US3: Giao diện Đăng ký / Đăng nhập` (3 SP)<br>- Code `US6: Giao diện Quản lý ví` (3 SP)<br>- Component Test Angular Vitest | - Code Giao diện Quản lý Danh mục<br>- Code Giao diện Tạo Giao dịch & Lịch sử Thu/Chi<br>- Tích hợp API Giao dịch với Backend<br>- Component Test Angular | - Code Giao diện Thiết lập & Tiến độ Ngân sách<br>- Code Dashboard Biểu đồ trực quan (Chart.js / ApexCharts)<br>- Nút xuất/tải file báo cáo Excel/PDF<br>- Component Test Angular |
| **TV4** | **Tester / QA chuyên trách** | - Lập Test Plan tổng thể Sprint 1<br>- Thiết kế 16 Test Cases manual (Auth + Ví)<br>- Xây dựng Newman/Postman Collection kiểm thử tự động API<br>- Thực hiện UI/E2E Testing, ghi log Bug, xuất Test Report<br>- **Test toàn diện 17 SP chức năng** (Quy đổi: 8.5 điểm) | - Lập Test Plan & Thiết kế Test Cases Sprint 2 (Danh mục + Giao dịch)<br>- Mở rộng Automation Test Postman cho luồng Giao dịch & CSDL<br>- Kiểm thử luồng tính toán số dư ví<br>- Ghi log Bug, xuất Test Report Sprint 2 | - Lập Test Plan & Thiết kế Test Cases Sprint 3 (Ngân sách + Thống kê)<br>- Automation Test Postman cho Ngân sách & Báo cáo<br>- **Chạy trọn bộ Regression Test toàn hệ thống cả 3 Sprints**<br>- Lập Báo cáo Nghiệm thu Chất lượng Tổng thể (Final QA Report) |

---

## 4. CHIẾN LƯỢC ĐẠT ĐIỂM TỐI ĐA TRONG MÔN HỌC

1. **Tuân thủ đúng mô hình phân định trách nhiệm rõ ràng (3 Dev + 1 Tester):**
   * **Developer (TV1, TV2, TV3)**: Chịu trách nhiệm 100% về chất lượng code, kiến trúc hệ thống và viết đầy đủ **Unit Test** đạt độ bao phủ (coverage) cao trước khi mở PR.
   * **Tester (TV4)**: Chịu trách nhiệm độc lập về đảm bảo chất lượng (QA/QC), thiết kế kịch bản kiểm thử (Test Case), kiểm thử tự động API (Postman / Newman), kiểm thử giao diện (UI/E2E), quản lý vòng đời lỗi (Bug Lifecycle trên Jira/GitHub Issues) và xuất biên bản nghiệm thu (Test Execution Report).
   * Điểm đánh giá bám sát đúng barem môn học: Dev nhận điểm SP tính năng hoàn thành kèm Unit Test; Tester nhận điểm tương ứng với khối lượng kiểm thử toàn diện hệ thống.
2. **Không nợ kỹ thuật (Technical Debt):**
   * Sau mỗi Sprint, các lỗi (Bug) mức độ Critical/Major do TV4 phát hiện phải được Dev sửa và TV4 re-test đóng hoàn toàn trước khi bước sang Sprint tiếp theo.
3. **Kế thừa và Tự động hóa kiểm thử liên tục:**
   * Postman Collection của TV4 ở Sprint 1 được lưu lại trong Git (`tests/api/sprint1.postman_collection.json`), đến Sprint 2 chỉ cần bổ sung các request của Giao dịch, Sprint 3 bổ sung Ngân sách. Khi chấm đồ án cuối kỳ, chỉ cần chạy 1 lệnh Newman CLI là toàn bộ hệ thống từ Sprint 1 đến Sprint 3 được kiểm thử tự động toàn diện trong vòng vài giây trước hội đồng chấm thi.

