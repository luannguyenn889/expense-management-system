package com.expensemanagement.backend.repository;

import com.expensemanagement.backend.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User buildUser(String username, String fullName, String email) {
        return User.builder()
                .username(username)
                .fullName(fullName)
                .email(email)
                .passwordHash("$2a$10$hashedPasswordSampleValue")
                .build();
    }

    @Test
    @DisplayName("CNTT46-37: saveAndFlush User -> Tự động sinh userId và timestamps createdAt, updatedAt")
    void saveUser_shouldAutoPopulateIdAndTimestamps() {
        // 1. Arrange (Given)
        User user = buildUser("vuong_auto", "Trần Minh Vương", "vuong_auto@example.com");

        // 2. Act (When)
        User saved = userRepository.saveAndFlush(user);

        // 3. Assert (Then)
        assertThat(saved.getUserId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getUsername()).isEqualTo("vuong_auto");
    }

    @Test
    @DisplayName("CNTT46-37: existsByUsername khi username tồn tại -> Trả về true")
    void existsByUsername_whenExists_shouldReturnTrue() {
        // 1. Arrange (Given)
        userRepository.saveAndFlush(buildUser("existing_user", "User A", "a@example.com"));

        // 2. Act (When)
        boolean exists = userRepository.existsByUsername("existing_user");

        // 3. Assert (Then)
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("CNTT46-37: existsByUsername khi username không tồn tại -> Trả về false")
    void existsByUsername_whenNotExists_shouldReturnFalse() {
        // 2. Act (When)
        boolean exists = userRepository.existsByUsername("non_existent_user");

        // 3. Assert (Then)
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("CNTT46-37: existsByEmail khi email tồn tại -> Trả về true")
    void existsByEmail_whenExists_shouldReturnTrue() {
        // 1. Arrange (Given)
        userRepository.saveAndFlush(buildUser("user_email", "User B", "exists@example.com"));

        // 2. Act (When)
        boolean exists = userRepository.existsByEmail("exists@example.com");

        // 3. Assert (Then)
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("CNTT46-37: existsByEmail khi email không tồn tại -> Trả về false")
    void existsByEmail_whenNotExists_shouldReturnFalse() {
        // 2. Act (When)
        boolean exists = userRepository.existsByEmail("notfound@example.com");

        // 3. Assert (Then)
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("CNTT46-37: findByEmail khi email tồn tại -> Trả về Optional chứa User")
    void findByEmail_whenExists_shouldReturnUser() {
        // 1. Arrange (Given)
        userRepository.saveAndFlush(buildUser("find_email_user", "Nguyễn Văn C", "findc@example.com"));

        // 2. Act (When)
        Optional<User> found = userRepository.findByEmail("findc@example.com");

        // 3. Assert (Then)
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("find_email_user");
        assertThat(found.get().getFullName()).isEqualTo("Nguyễn Văn C");
    }

    @Test
    @DisplayName("CNTT46-37: findByUsername khi username tồn tại -> Trả về Optional chứa User")
    void findByUsername_whenExists_shouldReturnUser() {
        // 1. Arrange (Given)
        userRepository.saveAndFlush(buildUser("find_username", "Nguyễn Văn D", "findd@example.com"));

        // 2. Act (When)
        Optional<User> found = userRepository.findByUsername("find_username");

        // 3. Assert (Then)
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("findd@example.com");
    }

    @Test
    @DisplayName("CNTT46-37: findByEmailOrUsername khớp theo email -> Trả về đúng User")
    void findByEmailOrUsername_whenMatchingEmail_shouldReturnUser() {
        // 1. Arrange (Given)
        userRepository.saveAndFlush(buildUser("login_user", "Nguyễn Văn E", "logine@example.com"));

        // 2. Act (When)
        Optional<User> found = userRepository.findByEmailOrUsername("logine@example.com", "logine@example.com");

        // 3. Assert (Then)
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("login_user");
    }

    @Test
    @DisplayName("CNTT46-37: findByEmailOrUsername khớp theo username -> Trả về đúng User")
    void findByEmailOrUsername_whenMatchingUsername_shouldReturnUser() {
        // 1. Arrange (Given)
        userRepository.saveAndFlush(buildUser("login_by_name", "Nguyễn Văn F", "loginf@example.com"));

        // 2. Act (When)
        Optional<User> found = userRepository.findByEmailOrUsername("login_by_name", "login_by_name");

        // 3. Assert (Then)
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("loginf@example.com");
    }

    @Test
    @DisplayName("CNTT46-37: Lưu 2 User trùng email -> Vi phạm ràng buộc UNIQUE và ném DataIntegrityViolationException")
    void saveUser_withDuplicateEmail_shouldThrowDataIntegrityViolationException() {
        // 1. Arrange (Given)
        userRepository.saveAndFlush(buildUser("user_one", "User One", "dup@example.com"));

        // 2. Act (When) & 3. Assert (Then)
        assertThatThrownBy(() -> userRepository.saveAndFlush(buildUser("user_two", "User Two", "dup@example.com")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
