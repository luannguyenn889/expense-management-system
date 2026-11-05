package com.expensemanagement.backend.util;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class GoogleAuthVerifier {

    public static final String GOOGLE_CLIENT_ID = "569426721711-6ub3hgomi74b201otif6cpe3oq53s5fj.apps.googleusercontent.com";

    private final GoogleIdTokenVerifier verifier;

    public GoogleAuthVerifier(
            @Value("${google.client-id:" + GOOGLE_CLIENT_ID + "}") String clientId
    ) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
        .setAudience(Collections.singletonList(clientId))
        .build();
    }

    /**
     * Xác thực chuỗi ID Token gửi từ Google Identity Services.
     * @param idTokenString Token nhận được từ Frontend
     * @return GoogleIdToken đối tượng chứa payload người dùng nếu hợp lệ, ngược lại trả về null
     */
    public GoogleIdToken verify(String idTokenString) {
        try {
            return verifier.verify(idTokenString);
        } catch (Exception e) {
            return null;
        }
    }
}

