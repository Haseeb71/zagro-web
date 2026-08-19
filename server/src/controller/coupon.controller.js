const couponModel = require("../models/coupon.model");
const categoryModel = require("../models/category.model");
const productModel = require("../models/product.model");

const createCoupon = async (req, res) => {
    try {
        const {
            code,
            heading,
            description,
            discountPercentage,
            validFrom,
            validUntil,
            isActive,
            usageLimit,
            minOrderAmount,
            maxDiscountAmount,
            applicableCategories,
            applicableProducts
        } = req.body;

        // Validation
        if (!code || !heading || !description || !discountPercentage || !validFrom || !validUntil) {
            return res.status(400).json({ message: "Code, heading, description, discount percentage, valid from, and valid until are required" });
        }

        if (discountPercentage < 0 || discountPercentage > 100) {
            return res.status(400).json({ message: "Discount percentage must be between 0 and 100" });
        }

        if (new Date(validFrom) >= new Date(validUntil)) {
            return res.status(400).json({ message: "Valid from date must be before valid until date" });
        }

        // Check if code already exists
        const existingCoupon = await couponModel.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }

        // Validate categories if provided
        if (applicableCategories && applicableCategories.length > 0) {
            const validCategories = await categoryModel.find({ _id: { $in: applicableCategories } });
            if (validCategories.length !== applicableCategories.length) {
                return res.status(400).json({ message: "One or more categories are invalid" });
            }
        }

        // Validate products if provided
        if (applicableProducts && applicableProducts.length > 0) {
            const validProducts = await productModel.find({ _id: { $in: applicableProducts } });
            if (validProducts.length !== applicableProducts.length) {
                return res.status(400).json({ message: "One or more products are invalid" });
            }
        }

        const coupon = await couponModel.create({
            code: code.toUpperCase(),
            heading,
            description,
            discountPercentage,
            validFrom: new Date(validFrom),
            validUntil: new Date(validUntil),
            isActive: isActive !== undefined ? isActive : true,
            usageLimit,
            minOrderAmount: minOrderAmount || 0,
            maxDiscountAmount,
            applicableCategories,
            applicableProducts
        });

        res.status(201).json({ coupon, message: "Coupon created successfully" });
    } catch (error) {
        console.error("Error in createCoupon:", error);
        res.status(500).json({ message: "Error creating coupon: " + error.message });
    }
}

const getCoupons = async (req, res) => {
    try {
        const { page = 1, perPage = 10, isActive, code } = req.query;
        
        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        if (code) {
            query.code = { $regex: code, $options: 'i' };
        }

        const pageNum = parseInt(page);
        const perPageNum = parseInt(perPage);
        const skip = (pageNum - 1) * perPageNum;

        const [coupons, totalCoupons] = await Promise.all([
            couponModel
                .find(query)
                .populate('applicableCategories', 'name slug')
                .populate('applicableProducts', 'name price')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perPageNum),
            couponModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCoupons / perPageNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        res.status(200).json({
            coupons,
            pagination: {
                currentPage: pageNum,
                perPage: perPageNum,
                totalCoupons,
                totalPages,
                hasNextPage,
                hasPrevPage,
                currentCoupons: coupons.length
            },
            message: "Coupons fetched successfully"
        });
    } catch (error) {
        console.error("Error in getCoupons:", error);
        res.status(500).json({ message: "Error fetching coupons: " + error.message });
    }
}

const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid coupon ID format" });
        }

        const coupon = await couponModel
            .findById(id)
            .populate('applicableCategories', 'name slug')
            .populate('applicableProducts', 'name price');

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.status(200).json({ coupon, message: "Coupon fetched successfully" });
    } catch (error) {
        console.error("Error in getCouponById:", error);
        res.status(500).json({ message: "Error fetching coupon: " + error.message });
    }
}

const getCouponByCode = async (req, res) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" });
        }

        const coupon = await couponModel
            .findOne({ code: code.toUpperCase() })
            .populate('applicableCategories', 'name slug')
            .populate('applicableProducts', 'name price');

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        // Check if coupon is valid
        const now = new Date();
        if (!coupon.isActive) {
            return res.status(400).json({ message: "Coupon is not active" });
        }

        if (now < coupon.validFrom) {
            return res.status(400).json({ message: "Coupon is not yet valid" });
        }

        if (now > coupon.validUntil) {
            return res.status(400).json({ message: "Coupon has expired" });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: "Coupon usage limit exceeded" });
        }

        res.status(200).json({ coupon, message: "Coupon is valid" });
    } catch (error) {
        console.error("Error in getCouponByCode:", error);
        res.status(500).json({ message: "Error fetching coupon: " + error.message });
    }
}

const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid coupon ID format" });
        }

        const coupon = await couponModel.findById(id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        const {
            code,
            heading,
            description,
            discountPercentage,
            validFrom,
            validUntil,
            isActive,
            usageLimit,
            minOrderAmount,
            maxDiscountAmount,
            applicableCategories,
            applicableProducts
        } = req.body;

        // Validation
        if (discountPercentage !== undefined && (discountPercentage < 0 || discountPercentage > 100)) {
            return res.status(400).json({ message: "Discount percentage must be between 0 and 100" });
        }

        if (validFrom && validUntil && new Date(validFrom) >= new Date(validUntil)) {
            return res.status(400).json({ message: "Valid from date must be before valid until date" });
        }

        // Check if code already exists (excluding current coupon)
        if (code && code.toUpperCase() !== coupon.code) {
            const existingCoupon = await couponModel.findOne({ 
                code: code.toUpperCase(),
                _id: { $ne: id }
            });
            if (existingCoupon) {
                return res.status(400).json({ message: "Coupon code already exists" });
            }
        }

        // Validate categories if provided
        if (applicableCategories && applicableCategories.length > 0) {
            const validCategories = await categoryModel.find({ _id: { $in: applicableCategories } });
            if (validCategories.length !== applicableCategories.length) {
                return res.status(400).json({ message: "One or more categories are invalid" });
            }
        }

        // Validate products if provided
        if (applicableProducts && applicableProducts.length > 0) {
            const validProducts = await productModel.find({ _id: { $in: applicableProducts } });
            if (validProducts.length !== applicableProducts.length) {
                return res.status(400).json({ message: "One or more products are invalid" });
            }
        }

        const updatedCoupon = await couponModel.findByIdAndUpdate(
            id,
            {
                code: code ? code.toUpperCase() : coupon.code,
                heading: heading || coupon.heading,
                description: description || coupon.description,
                discountPercentage: discountPercentage !== undefined ? discountPercentage : coupon.discountPercentage,
                validFrom: validFrom ? new Date(validFrom) : coupon.validFrom,
                validUntil: validUntil ? new Date(validUntil) : coupon.validUntil,
                isActive: isActive !== undefined ? isActive : coupon.isActive,
                usageLimit: usageLimit !== undefined ? usageLimit : coupon.usageLimit,
                minOrderAmount: minOrderAmount !== undefined ? minOrderAmount : coupon.minOrderAmount,
                maxDiscountAmount: maxDiscountAmount !== undefined ? maxDiscountAmount : coupon.maxDiscountAmount,
                applicableCategories: applicableCategories !== undefined ? applicableCategories : coupon.applicableCategories,
                applicableProducts: applicableProducts !== undefined ? applicableProducts : coupon.applicableProducts,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('applicableCategories', 'name slug')
         .populate('applicableProducts', 'name price');

        res.status(200).json({ updatedCoupon, message: "Coupon updated successfully" });
    } catch (error) {
        console.error("Error in updateCoupon:", error);
        res.status(500).json({ message: "Error updating coupon: " + error.message });
    }
}

const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid coupon ID format" });
        }

        const coupon = await couponModel.findByIdAndDelete(id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        console.error("Error in deleteCoupon:", error);
        res.status(500).json({ message: "Error deleting coupon: " + error.message });
    }
}

const getActiveCoupons = async (req, res) => {
    try {
        const now = new Date();
        const coupons = await couponModel
            .find({
                isActive: true,
                validFrom: { $lte: now },
                validUntil: { $gte: now },
                $or: [
                    { usageLimit: null },
                    { usageLimit: { $gt: { $expr: "$usedCount" } } }
                ]
            })
            .populate('applicableCategories', 'name slug')
            .populate('applicableProducts', 'name price')
            .sort({ createdAt: -1 });

        res.status(200).json({ coupons, message: "Active coupons fetched successfully" });
    } catch (error) {
        console.error("Error in getActiveCoupons:", error);
        res.status(500).json({ message: "Error fetching active coupons: " + error.message });
    }
}

const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount, productIds, categoryIds } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Coupon code is required" });
        }

        const coupon = await couponModel
            .findOne({ code: code.toUpperCase() })
            .populate('applicableCategories', 'name slug')
            .populate('applicableProducts', 'name price');

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        const now = new Date();
        const validation = {
            isValid: true,
            coupon,
            discountAmount: 0,
            errors: []
        };

        // Check if coupon is active
        if (!coupon.isActive) {
            validation.isValid = false;
            validation.errors.push("Coupon is not active");
        }

        // Check validity dates
        if (now < coupon.validFrom) {
            validation.isValid = false;
            validation.errors.push("Coupon is not yet valid");
        }

        if (now > coupon.validUntil) {
            validation.isValid = false;
            validation.errors.push("Coupon has expired");
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            validation.isValid = false;
            validation.errors.push("Coupon usage limit exceeded");
        }

        // Check minimum order amount
        if (orderAmount && coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            validation.isValid = false;
            validation.errors.push(`Minimum order amount of ${coupon.minOrderAmount} required`);
        }

        // Check applicable categories
        if (coupon.applicableCategories.length > 0 && categoryIds) {
            const applicableCategoryIds = coupon.applicableCategories.map(cat => cat._id.toString());
            const hasMatchingCategory = categoryIds.some(catId => applicableCategoryIds.includes(catId));
            if (!hasMatchingCategory) {
                validation.isValid = false;
                validation.errors.push("Coupon is not applicable to selected categories");
            }
        }

        // Check applicable products
        if (coupon.applicableProducts.length > 0 && productIds) {
            const applicableProductIds = coupon.applicableProducts.map(prod => prod._id.toString());
            const hasMatchingProduct = productIds.some(prodId => applicableProductIds.includes(prodId));
            if (!hasMatchingProduct) {
                validation.isValid = false;
                validation.errors.push("Coupon is not applicable to selected products");
            }
        }

        // Calculate discount amount if valid
        if (validation.isValid && orderAmount) {
            validation.discountAmount = (orderAmount * coupon.discountPercentage) / 100;
            
            // Apply maximum discount limit if set
            if (coupon.maxDiscountAmount && validation.discountAmount > coupon.maxDiscountAmount) {
                validation.discountAmount = coupon.maxDiscountAmount;
            }
        }

        res.status(200).json(validation);
    } catch (error) {
        console.error("Error in validateCoupon:", error);
        res.status(500).json({ message: "Error validating coupon: " + error.message });
    }
}

module.exports = {
    createCoupon,
    getCoupons,
    getCouponById,
    getCouponByCode,
    updateCoupon,
    deleteCoupon,
    getActiveCoupons,
    validateCoupon
};
