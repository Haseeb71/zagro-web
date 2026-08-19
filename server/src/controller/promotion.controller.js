const promotionModel = require("../models/promotion.model");
const fs = require('fs');
const path = require('path');

const createPromotion = async (req, res) => {
    try {
        const { mainText, subText, isActive, startDate, endDate, priority, link } = req.body;
        
        if (!mainText) {
            return res.status(400).json({ message: "Main text is required" });
        }

        const image = req.file ? req.file.path : null;
        if (!image) {
            return res.status(400).json({ message: "Image is required" });
        }

        const promotion = await promotionModel.create({
            mainText,
            subText,
            image,
            isActive: isActive !== undefined ? isActive : true,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
            priority: priority || 0,
            link
        });

        res.status(201).json({ promotion, message: "Promotion created successfully" });
    } catch (error) {
        console.error("Error in createPromotion:", error);
        res.status(500).json({ message: "Error creating promotion: " + error.message });
    }
}

const getPromotions = async (req, res) => {
    try {
        const { page = 1, perPage = 10, isActive } = req.query;
        
        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const pageNum = parseInt(page);
        const perPageNum = parseInt(perPage);
        const skip = (pageNum - 1) * perPageNum;

        const [promotions, totalPromotions] = await Promise.all([
            promotionModel
                .find(query)
                .sort({ priority: -1, createdAt: -1 })
                .skip(skip)
                .limit(perPageNum),
            promotionModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalPromotions / perPageNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        res.status(200).json({
            promotions,
            pagination: {
                currentPage: pageNum,
                perPage: perPageNum,
                totalPromotions,
                totalPages,
                hasNextPage,
                hasPrevPage,
                currentPromotions: promotions.length
            },
            message: "Promotions fetched successfully"
        });
    } catch (error) {
        console.error("Error in getPromotions:", error);
        res.status(500).json({ message: "Error fetching promotions: " + error.message });
    }
}

const getPromotionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid promotion ID format" });
        }

        const promotion = await promotionModel.findById(id);
        if (!promotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }

        res.status(200).json({ promotion, message: "Promotion fetched successfully" });
    } catch (error) {
        console.error("Error in getPromotionById:", error);
        res.status(500).json({ message: "Error fetching promotion: " + error.message });
    }
}

const updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid promotion ID format" });
        }

        const promotion = await promotionModel.findById(id);
        if (!promotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }

        const { mainText, subText, isActive, startDate, endDate, priority, link, imageToRemove } = req.body;

        let updatedImage = promotion.image;

        // Handle image removal
        if (imageToRemove && fs.existsSync(imageToRemove)) {
            try {
                fs.unlinkSync(imageToRemove);
                console.log(`Successfully deleted file: ${imageToRemove}`);
                updatedImage = null;
            } catch (fileError) {
                console.error(`Error deleting file ${imageToRemove}:`, fileError);
            }
        }

        // Add new image if any
        if (req.file) {
            updatedImage = req.file.path;
        }

        const updatedPromotion = await promotionModel.findByIdAndUpdate(
            id,
            {
                mainText,
                subText,
                image: updatedImage,
                isActive,
                startDate: startDate ? new Date(startDate) : promotion.startDate,
                endDate: endDate ? new Date(endDate) : promotion.endDate,
                priority,
                link,
                updatedAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({ updatedPromotion, message: "Promotion updated successfully" });
    } catch (error) {
        console.error("Error in updatePromotion:", error);
        res.status(500).json({ message: "Error updating promotion: " + error.message });
    }
}

const deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid promotion ID format" });
        }

        const promotion = await promotionModel.findById(id);
        if (!promotion) {
            return res.status(404).json({ message: "Promotion not found" });
        }

        // Delete the image file
        if (promotion.image && fs.existsSync(promotion.image)) {
            try {
                fs.unlinkSync(promotion.image);
                console.log(`Successfully deleted file: ${promotion.image}`);
            } catch (fileError) {
                console.error(`Error deleting file ${promotion.image}:`, fileError);
            }
        }

        await promotionModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Promotion deleted successfully" });
    } catch (error) {
        console.error("Error in deletePromotion:", error);
        res.status(500).json({ message: "Error deleting promotion: " + error.message });
    }
}

const getActivePromotions = async (req, res) => {
    try {
        const now = new Date();
        const promotions = await promotionModel
            .find({
                isActive: true,
                $or: [
                    { endDate: { $exists: false } },
                    { endDate: null },
                    { endDate: { $gt: now } }
                ]
            })
            .sort({ priority: -1, createdAt: -1 });

        res.status(200).json({ promotions, message: "Active promotions fetched successfully" });
    } catch (error) {
        console.error("Error in getActivePromotions:", error);
        res.status(500).json({ message: "Error fetching active promotions: " + error.message });
    }
}

module.exports = {
    createPromotion,
    getPromotions,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    getActivePromotions
};
