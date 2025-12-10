import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String password = "admin";
        String hash = encoder.encode(password);
        System.out.println("Hash: " + hash);
        System.out.println("Matches: " + encoder.matches(password, hash));

        // Test avec le hash existant
        String existingHash = "$2a$10$N9qo8uLOickgx2ZrVzY45.Bb3Ae2VNWO4OmQy/7FvVcGCJhxrTqq2";
        System.out.println("Existing hash matches: " + encoder.matches(password, existingHash));
    }
}
