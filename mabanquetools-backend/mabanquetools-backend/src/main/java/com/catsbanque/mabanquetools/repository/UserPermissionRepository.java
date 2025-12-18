package com.catsbanque.mabanquetools.repository;

import com.catsbanque.mabanquetools.entity.PermissionModule;
import com.catsbanque.mabanquetools.entity.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPermissionRepository extends JpaRepository<UserPermission, String> {

    /**
     * Find all permissions for a specific user
     * Used to load user permissions
     */
    @Query("SELECT up FROM UserPermission up WHERE up.user.id = :userId")
    List<UserPermission> findByUserId(@Param("userId") String userId);

    /**
     * Find a specific permission for a user and module
     * Used to check specific permission level
     */
    @Query("SELECT up FROM UserPermission up WHERE up.user.id = :userId AND up.module = :module")
    Optional<UserPermission> findByUserIdAndModule(@Param("userId") String userId, @Param("module") PermissionModule module);

    /**
     * Delete all permissions for a specific user
     * Used when deleting a user (cascade should handle this, but explicit method for safety)
     */
    void deleteByUserId(String userId);

    /**
     * Check if a permission exists for a user and module
     */
    boolean existsByUserIdAndModule(String userId, PermissionModule module);
}
