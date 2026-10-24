-- =====================================================
-- PROJECT: QUAN LY CHI TIEU
-- DATABASE: quan_ly_chi_tieu
-- DBMS: MySQL 8.0.16+
-- =====================================================

CREATE DATABASE IF NOT EXISTS quan_ly_chi_tieu
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE quan_ly_chi_tieu;


-- =====================================================
-- 1. USERS - QUAN LY TAI KHOAN
-- EPIC 1
-- =====================================================

CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_email UNIQUE (email)
);


-- =====================================================
-- 2. WALLETS - QUAN LY VI
-- EPIC 2
-- =====================================================

CREATE TABLE wallets (
    wallet_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    wallet_name VARCHAR(100) NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_wallets_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT chk_wallets_balance
        CHECK (balance >= 0),

    INDEX idx_wallets_user_id (user_id)
);


-- =====================================================
-- 3. CATEGORIES - QUAN LY DANH MUC
-- EPIC 3
-- user_id IS NULL: DANH MUC DUNG CHUNG
-- =====================================================

CREATE TABLE categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    category_name VARCHAR(100) NOT NULL,
    category_type VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_categories_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT chk_categories_type
        CHECK (category_type IN ('INCOME', 'EXPENSE')),

    INDEX idx_categories_user_id (user_id),
    INDEX idx_categories_type (category_type)
);


-- =====================================================
-- 4. TRANSACTIONS - QUAN LY GIAO DICH
-- EPIC 4
-- =====================================================

CREATE TABLE transactions (
    transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wallet_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    transaction_type VARCHAR(10) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date DATETIME NOT NULL,
    note VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_transactions_wallets
        FOREIGN KEY (wallet_id)
        REFERENCES wallets(wallet_id),

    CONSTRAINT fk_transactions_categories
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id),

    CONSTRAINT chk_transactions_type
        CHECK (transaction_type IN ('INCOME', 'EXPENSE')),

    CONSTRAINT chk_transactions_amount
        CHECK (amount > 0),

    INDEX idx_transactions_wallet_date
        (wallet_id, transaction_date),

    INDEX idx_transactions_category
        (category_id),

    INDEX idx_transactions_type_date
        (transaction_type, transaction_date)
);


-- =====================================================
-- 5. BUDGETS - QUAN LY NGAN SACH
-- EPIC 6
-- =====================================================

CREATE TABLE budgets (
    budget_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    budget_amount DECIMAL(15,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_budgets_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_budgets_categories
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id),

    CONSTRAINT chk_budgets_amount
        CHECK (budget_amount > 0),

    CONSTRAINT chk_budgets_dates
        CHECK (end_date >= start_date),

    INDEX idx_budgets_user_period
        (user_id, start_date, end_date),

    INDEX idx_budgets_category
        (category_id)
);

