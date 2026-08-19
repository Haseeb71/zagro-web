const mongoose = require('mongoose');

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId, false otherwise
 */
const validateObjectId = (id) => {
    if (!id) return false;
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates if a string is a valid email address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid email, false otherwise
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates if a string is a valid phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid phone number, false otherwise
 */
const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
};

/**
 * Validates if a string is a valid date
 * @param {string} date - The date to validate
 * @returns {boolean} - True if valid date, false otherwise
 */
const validateDate = (date) => {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Validates if a number is positive
 * @param {number} number - The number to validate
 * @returns {boolean} - True if positive number, false otherwise
 */
const validatePositiveNumber = (number) => {
    return typeof number === 'number' && number > 0;
};

module.exports = {
    validateObjectId,
    validateEmail,
    validatePhone,
    validateDate,
    validatePositiveNumber
}; 