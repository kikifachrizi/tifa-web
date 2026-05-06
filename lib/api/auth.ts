// Auth API - Abstraction layer for authentication operations
// Uses local PostgreSQL database (t_user table) instead of Supabase Auth
// Note: For production, implement proper JWT or session-based auth

import { query } from '@/lib/dbClient';
import type { AuthUser, SignInResult, ApiResult } from '@/lib/types/database';

// Simple in-memory session store (for development only)
// In production, use proper session management (cookies, JWT, etc.)
let currentUser: AuthUser | null = null;

/**
 * Sign in with email/username and password
 * Note: Password verification uses plain text comparison for now
 * In production, use bcrypt or similar for password hashing
 */
export async function signIn(email: string, password: string): Promise<SignInResult> {
    try {
        // Query user from t_user table
        const users = await query<{
            user_id: number;
            username: string;
            email: string | null;
            password_hash: string | null;
            is_active: boolean;
        }>(
            `SELECT user_id, username, email, password_hash, is_active
             FROM t_user
             WHERE (email = $1 OR username = $1) AND is_active = true`,
            [email]
        );

        if (users.length === 0) {
            return { success: false, error: "User not found" };
        }

        const user = users[0];

        // Simple password check (in production, use bcrypt.compare)
        // For now, we'll check if password matches password_hash directly
        // or if password_hash is null (no password set)
        if (user.password_hash && user.password_hash !== password) {
            return { success: false, error: "Invalid password" };
        }

        // Get user role from t_user_role and m_role tables
        const roles = await query<{ role_code: string }>(
            `SELECT r.role_code
             FROM t_user_role ur
             JOIN m_role r ON ur.role_id = r.role_id
             WHERE ur.user_id = $1
             LIMIT 1`,
            [user.user_id]
        );

        const userRole = roles[0]?.role_code?.toLowerCase() ?? 'operator';

        // Validate role
        if (userRole !== 'admin' && userRole !== 'operator') {
            return { success: false, error: "Invalid user role. Please contact administrator." };
        }

        // Store in simple session
        currentUser = {
            id: user.user_id.toString(),
            email: user.email ?? user.username,
            role: userRole as 'admin' | 'operator',
            user_metadata: { role: userRole },
        };

        return {
            success: true,
            user: currentUser,
        };
    } catch (err: unknown) {
        const error = err as Error;
        console.error("SignIn Error:", error);
        return { success: false, error: error.message ?? 'Database error' };
    }
}

// signUp function removed — registration is disabled.
// Only pre-registered admin/operator users in the database can log in.

/**
 * Sign out current user
 */
export async function signOut(): Promise<ApiResult<null>> {
    currentUser = null;
    return {
        data: null,
        error: null,
    };
}

/**
 * Get current authenticated user
 * Note: This uses simple in-memory session for development
 */
export async function getCurrentUser(): Promise<ApiResult<AuthUser | null>> {
    return {
        data: currentUser,
        error: null,
    };
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: { email?: string; password?: string }): Promise<ApiResult<null>> {
    if (!currentUser) {
        return { data: null, error: "Not authenticated" };
    }

    try {
        const updates: string[] = [];
        const params: (string | number)[] = [];
        let paramIndex = 1;

        if (data.email) {
            updates.push(`email = $${paramIndex}`);
            params.push(data.email);
            paramIndex++;
        }

        if (data.password) {
            // In production, hash the password
            updates.push(`password_hash = $${paramIndex}`);
            params.push(data.password);
            paramIndex++;
        }

        if (updates.length === 0) {
            return { data: null, error: null };
        }

        updates.push(`updated_at = NOW()`);
        params.push(parseInt(currentUser.id, 10));

        await query(
            `UPDATE t_user SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`,
            params
        );

        // Update local session if email changed
        if (data.email) {
            currentUser.email = data.email;
        }

        return {
            data: null,
            error: null,
        };
    } catch (err: unknown) {
        const error = err as Error;
        return {
            data: null,
            error: error.message ?? 'Database error',
        };
    }
}
