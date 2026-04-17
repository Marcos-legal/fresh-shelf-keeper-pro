import axios from 'axios';
import bcrypt from 'bcryptjs';

/**
 * Checks if a password has been leaked using the Have I Been Pwned API.
 * @param {string} password - The password to check.
 * @returns {Promise<boolean>} - True if the password has been leaked, false otherwise.
 */
export const checkPasswordLeak = async (password: string): Promise<boolean> => {
    const hash = password.toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
    const leaks = response.data.split('\n');

    return leaks.some(line => line.startsWith(suffix));
};

/**
 * Validates password strength.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if the password is strong, false otherwise.
 */
export const validatePasswordStrength = (password: string): boolean => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return strongPasswordRegex.test(password);
};

/**
 * Hashes a password securely.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * Verifies a password against a hashed password.
 * @param {string} password - The plain password.
 * @param {string} hashedPassword - The hashed password.
 * @returns {Promise<boolean>} - True if the password matches, false otherwise.
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};
