# Expense Management Backend

Spring Boot REST API for the expense management system.

## Requirements

- Java 21 or newer
- Maven 3.6.3 or newer

## Run

Create a local `.env` file based on `.env.example` and set your database and Gemini credentials there.
The `.env` file is ignored by Git. Spring Boot imports it when the app is launched from this directory.

From this directory, run:

```bash
mvn spring-boot:run
```

The server starts on `http://localhost:8080`. Check it with:

```text
GET http://localhost:8080/api/health
```

Expected response:

```json
{"status":"ok"}
```
