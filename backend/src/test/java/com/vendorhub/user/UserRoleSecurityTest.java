package com.vendorhub.user;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import com.vendorhub.config.JpaAuditingConfig;
import com.vendorhub.user.entity.Role;
import com.vendorhub.user.entity.User;
import com.vendorhub.user.enums.RoleType;
import com.vendorhub.user.repository.RoleRepository;
import com.vendorhub.user.repository.UserRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@Import(JpaAuditingConfig.class)
@ActiveProfiles("test")
class UserRoleSecurityTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Test
    @DisplayName("Should persist user with multiple RBAC roles successfully")
    void shouldPersistUserWithRoles() {
        Role adminRole = roleRepository.saveAndFlush(Role.builder()
                .name(RoleType.ROLE_ADMIN)
                .description("Administrator with full privileges")
                .build());

        Role procurementRole = roleRepository.saveAndFlush(Role.builder()
                .name(RoleType.ROLE_PROCUREMENT_OFFICER)
                .description("Procurement officer managing vendors and contracts")
                .build());

        User user = User.builder()
                .username("ahmed.procurement")
                .email("ahmed@vendorhub.sa")
                .passwordHash("$2a$12$e8Y5t1hK3D...") // BCrypt dummy hash
                .fullName("أحمد بن فهد المنصور")
                .phoneNumber("+966551234567")
                .build();

        user.addRole(adminRole);
        user.addRole(procurementRole);

        User savedUser = userRepository.saveAndFlush(user);

        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getPublicId()).isNotNull();
        assertThat(savedUser.getRoles()).hasSize(2);

        Optional<User> loaded = userRepository.findByUsername("ahmed.procurement");
        assertThat(loaded).isPresent();
        assertThat(loaded.get().getEmail()).isEqualTo("ahmed@vendorhub.sa");
        assertThat(loaded.get().getRoles()).extracting(Role::getName)
                .containsExactlyInAnyOrder(RoleType.ROLE_ADMIN, RoleType.ROLE_PROCUREMENT_OFFICER);
    }

    @Test
    @DisplayName("Should enforce uniqueness constraint on username and email")
    void shouldEnforceUniqueUsernameAndEmail() {
        User user1 = User.builder()
                .username("vendor.rep1")
                .email("rep1@company.sa")
                .passwordHash("secret_hash")
                .fullName("ممثل المورد")
                .build();
        userRepository.saveAndFlush(user1);

        User user2 = User.builder()
                .username("vendor.rep1") // Duplicate username
                .email("another@company.sa")
                .passwordHash("secret_hash")
                .fullName("ممثل آخر")
                .build();

        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.saveAndFlush(user2);
        });
    }
}
