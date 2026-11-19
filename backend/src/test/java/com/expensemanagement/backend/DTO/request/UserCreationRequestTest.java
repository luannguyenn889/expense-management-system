package com.expensemanagement.backend.DTO.request;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class UserCreationRequestTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private UserCreationRequest validRequest() {
        return UserCreationRequest.builder()
                .username("tran_minh.vuong1")
                .fullName("Trần Minh Vương")
                .email("vuong@example.com")
                .password("Password123@")
                .confirmPassword("Password123@")
                .build();
    }

    @Test
    @DisplayName("CNTT46-37: Dữ liệu hợp lệ với họ tên tiếng Việt có dấu -> Không có lỗi validation")
    void validate_withValidVietnameseRequest_shouldHaveNoViolations() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("CNTT46-37: Username bỏ trống / chỉ chứa khoảng trắng -> Vi phạm @NotBlank")
    void validate_withBlankUsername_shouldFailNotBlank() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setUsername("   ");

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Tên đăng nhập không được để trống");
    }

    @Test
    @DisplayName("CNTT46-37: Username ngắn hơn 3 ký tự (2 ký tự) -> Vi phạm @Size")
    void validate_withUsernameTooShort_shouldFailSize() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setUsername("ab");

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Tên đăng nhập phải từ 3 đến 50 ký tự");
    }

    @Test
    @DisplayName("CNTT46-37: Username đúng biên tối thiểu 3 ký tự -> Hợp lệ")
    void validate_withUsernameExactMinLength3_shouldPass() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setUsername("abc");

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("CNTT46-37: Username đúng biên tối đa 50 ký tự -> Hợp lệ")
    void validate_withUsernameExactMaxLength50_shouldPass() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setUsername("a".repeat(50));

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("CNTT46-37: Username vượt quá 50 ký tự (51 ký tự) -> Vi phạm @Size")
    void validate_withUsernameExceeding50Chars_shouldFailSize() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setUsername("a".repeat(51));

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Tên đăng nhập phải từ 3 đến 50 ký tự");
    }

    @Test
    @DisplayName("CNTT46-37: Username chứa ký tự đặc biệt hoặc khoảng trắng -> Vi phạm @Pattern")
    void validate_withUsernameContainingSpecialChars_shouldFailPattern() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setUsername("user name!@#");

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới và dấu chấm");
    }

    @Test
    @DisplayName("CNTT46-37: Họ và tên bỏ trống -> Vi phạm @NotBlank")
    void validate_withBlankFullName_shouldFailNotBlank() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setFullName("   ");

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Họ và tên không được để trống");
    }

    @Test
    @DisplayName("CNTT46-37: Họ và tên vượt quá 100 ký tự -> Vi phạm @Size")
    void validate_withFullNameExceeding100Chars_shouldFailSize() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setFullName("A".repeat(101));

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Họ và tên tối đa 100 ký tự");
    }

    @Test
    @DisplayName("CNTT46-37: Họ và tên chứa chữ số hoặc ký tự đặc biệt -> Vi phạm @Pattern")
    void validate_withFullNameContainingDigitsOrSpecialChars_shouldFailPattern() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setFullName("Nguyễn Văn 123@");

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Họ và tên chỉ được chứa chữ cái và khoảng trắng, không chứa số hoặc ký tự đặc biệt");
    }

    @Test
    @DisplayName("CNTT46-37: Email bỏ trống -> Vi phạm @NotBlank")
    void validate_withBlankEmail_shouldFailNotBlank() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setEmail("");

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Email không được để trống");
    }

    @Test
    @DisplayName("CNTT46-37: Email sai định dạng (thiếu @ hoặc tên miền) -> Vi phạm @Email")
    void validate_withInvalidEmailFormat_shouldFailEmail() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setEmail("email-khong-hop-le");

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Email không đúng định dạng");
    }

    @Test
    @DisplayName("CNTT46-37: Email vượt quá 255 ký tự -> Vi phạm @Size")
    void validate_withEmailExceeding255Chars_shouldFailSize() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setEmail("a".repeat(247) + "@test.com");

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Email tối đa 255 ký tự");
    }

    @Test
    @DisplayName("CNTT46-37: Mật khẩu bỏ trống -> Vi phạm @NotBlank")
    void validate_withBlankPassword_shouldFailNotBlank() {
        // 1. Arrange (Given)
        UserCreationRequest request = validRequest();
        request.setPassword("   ");

        // 2. Act (When)
        Set<ConstraintViolation<UserCreationRequest>> violations = validator.validate(request);

        // 3. Assert (Then)
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Mật khẩu không được để trống");
    }

    @Test
    @DisplayName("CNTT46-37: Mật khẩu ngắn hơn 8 ký tự hoặc vượt quá 72 ký tự -> Vi phạm @Size")
    void validate_withPasswordOutOfRange_shouldFailSize() {
        // 1. Arrange (Given)
        UserCreationRequest tooShort = validRequest();
        tooShort.setPassword("1234567");

        UserCreationRequest tooLong = validRequest();
        tooLong.setPassword("P".repeat(73));

        UserCreationRequest exactMin = validRequest();
        exactMin.setPassword("12345678");

        UserCreationRequest exactMax = validRequest();
        exactMax.setPassword("P".repeat(72));

        // 2. Act (When) & 3. Assert (Then)
        assertThat(validator.validate(tooShort))
                .extracting(ConstraintViolation::getMessage)
                .contains("Mật khẩu phải từ 8 đến 72 ký tự");
        assertThat(validator.validate(tooLong))
                .extracting(ConstraintViolation::getMessage)
                .contains("Mật khẩu phải từ 8 đến 72 ký tự");
        assertThat(validator.validate(exactMin)).isEmpty();
        assertThat(validator.validate(exactMax)).isEmpty();
    }
}
