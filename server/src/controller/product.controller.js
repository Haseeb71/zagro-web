const productModel = require("../models/product.model");
const categoryModel = require("../models/category.model");
const subCategoryModel = require("../models/subCategory.model");
const slugify = require("slugify");
const fs = require('fs');
const path = require('path');
const { resolvePricing, applyPricingFields } = require("../utils/pricing");
const {
    applyProductTypeDefaults,
    normalizeSizes,
    normalizeSizeQuantities,
    parseMaybeJson,
} = require("../utils/inventory");
const { refreshProductTypeCache } = require("../constants/productTypes");
const { mergeProductImages, removeStoredImages } = require("../utils/images");

const createProduct = async (req, res) => {
    try {
        const {
            name, price, originalPrice, description, category, brand, quantity,
            colorQuantities, colorImages, sizeColorQuantities, sizes, sizeQuantities,
            productType, isActive, isFeatured, isNew, isBestSeller, isTrending,
            isSpecial, isDiscounted, discountPercentage,
        } = req.body;
        console.log("req.body == ", req.body);
        console.log("req.files == ", req.files);
        
        const images = mergeProductImages(req);
        
        // Handle color-specific images
        const colorImagesFromFiles = {};
        if (req.files) {
            req.files.forEach(file => {
                if (file.fieldname.startsWith('colorImages_')) {
                    const color = file.fieldname.replace('colorImages_', '');
                    if (!colorImagesFromFiles[color]) {
                        colorImagesFromFiles[color] = [];
                    }
                    colorImagesFromFiles[color].push(file.path);
                }
            });
        }
        
        let parsedColorImages = parseMaybeJson(colorImages) || {};
        let parsedSizeColorQuantities = parseMaybeJson(sizeColorQuantities);
        let parsedColorQuantities = parseMaybeJson(colorQuantities) || colorQuantities || {};
        if (typeof parsedColorQuantities !== 'object' || parsedColorQuantities == null) {
            parsedColorQuantities = {};
        }
        await refreshProductTypeCache();
        const typeDefaults = applyProductTypeDefaults(
            productType,
            sizes,
            sizeQuantities,
            quantity
        );
        
        // Merge uploaded color images with existing color images
        const finalColorImages = { ...(typeof parsedColorImages === 'object' ? parsedColorImages : {}) };
        Object.keys(colorImagesFromFiles).forEach(color => {
            if (finalColorImages[color]) {
                finalColorImages[color] = [...finalColorImages[color], ...colorImagesFromFiles[color]];
            } else {
                finalColorImages[color] = colorImagesFromFiles[color];
            }
        });
        
        const pricing = applyPricingFields(price, originalPrice, isDiscounted, discountPercentage);

        const product = await productModel.create({ 
            name, 
            price: pricing.price,
            originalPrice: pricing.originalPrice,
            description, 
            images, 
            category,
            brand: brand || null,
            productType: typeDefaults.productType,
            quantity: typeDefaults.quantity, 
            colorQuantities: parsedColorQuantities, 
            colorImages: finalColorImages,
            sizeColorQuantities: parsedSizeColorQuantities,
            sizes: typeDefaults.sizes,
            sizeQuantities: typeDefaults.sizeQuantities,
            isActive, 
            isFeatured, 
            isNew, 
            isBestSeller, 
            isTrending, 
            isSpecial, 
            isDiscounted: pricing.isDiscounted, 
            discountPercentage: pricing.discountPercentage,
        });
        res.status(201).json({ product, message: "Product created successfully" });
    } catch (error) {
        console.error("Error in createProduct:", error);
        res.status(500).json({ message: "Error creating product: " + error.message });
    }
}

const getProducts = async (req, res) => {
    try {
        const { page: pageParam, perPage: perPageParam, type, search, category, brand } = req.body;
        // Convert to numbers and set defaults
        const page = parseInt(pageParam) || 1;
        const perPage = parseInt(perPageParam) || 10;

        const query = {};
        if (type === 'featured') {
            query.isFeatured = true;
        } else if (type === 'new') {
            // For 'new' products, we can either check isNew field or recent products
            // Let's check both isNew field and recent products (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            query.$or = [
                { isNew: true },
                { createdAt: { $gte: thirtyDaysAgo } }
            ];
        } else if (type === 'bestseller') {
            query.isBestSeller = true;
        } else if (type === 'trending') {
            query.isTrending = true;
        } else if (type === 'special') {
            query.isSpecial = true;
        } else if (type === 'discounted') {
            query.isDiscounted = true;
        }

        if (search) {
            if (query.$or) {
                // If we already have $or conditions, we need to combine them with search
                query.$and = [
                    { $or: query.$or },
                    { name: { $regex: search, $options: "i" } }
                ];
                delete query.$or;
            } else {
                query.name = { $regex: search, $options: "i" };
            }
        }

        if (category) {
            query.category = category;
        }
        if (brand) {
            query.brand = brand;
        }
        console.log("query == ", query);

        const [products, totalProducts] = await Promise.all([
            productModel.find(query).skip((page - 1) * perPage).limit(perPage).populate("category").populate("brand").sort({ createdAt: -1 }),
            productModel.countDocuments(query)  // Count filtered products, not all products
        ]);
        res.status(200).json({ products, message: "Products fetched successfully", pagination: { page, perPage, total: totalProducts, totalPages: Math.ceil(totalProducts / perPage), currentProducts: products.length } });
    } catch (error) {
        console.error("Error in getProducts:", error);
        res.status(500).json({ message: "Error fetching products: " + error.message });
    }
}

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate if id is a valid ObjectId
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const product = await productModel.findById(id).populate("category").populate("brand");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const pricing = resolvePricing(product);
        const payload = product.toObject();
        Object.assign(payload, pricing);
        payload.requiresSize = require("../constants/productTypes").productRequiresSize(payload);
        res.status(200).json({ product: payload, message: "Product fetched successfully" });
    } catch (error) {
        console.error("Error in getProductById:", error);
        res.status(500).json({ message: "Error fetching product: " + error.message });
    }
}

const getSimilarProducts = async (req, res) => {
    try {
        const { categoryId } = req.params;
        console.log("categoryId == ", categoryId);

        // Validate if categoryId is a valid ObjectId
        if (!categoryId || !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid category ID format" });
        }

        // Convert string to ObjectId
        const mongoose = require('mongoose');
        const objectId = new mongoose.Types.ObjectId(categoryId);

        // First, check if there are products in this category
        const productCount = await productModel.countDocuments({ category: objectId });
        console.log("Products count in category:", productCount);
        
        if (productCount === 0) {
            return res.status(404).json({ message: "No products found for this category" });
        }

        console.log("Found products in category, proceeding with aggregation");

        // Get 6 random products from the specified category
        const products = await productModel.aggregate([
            { $match: { category: objectId } },
            { $sample: { size: 6 } },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" }
        ]);

        console.log("Products found:", products.length);

        res.status(200).json({
            products,
            message: "Random products from category fetched successfully"
        });
    } catch (error) {
        console.error("Error in getSimilarProducts:", error);
        res.status(500).json({ message: "Error fetching similar products: " + error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate if id is a valid ObjectId
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const { name, price, originalPrice, description, category, brand, quantity, colorQuantities, colorImages, sizeColorQuantities, sizes, sizeQuantities, productType, isActive, isFeatured, isNew, isBestSeller, isTrending, isSpecial, isDiscounted, discountPercentage, imagesToRemove } = req.body;

        let updatedImages = [...product.images];

        if (imagesToRemove && Array.isArray(imagesToRemove)) {
            await removeStoredImages(imagesToRemove);
            updatedImages = updatedImages.filter(image => !imagesToRemove.includes(image));
            console.log("Updated images after removal:", updatedImages);
        } else if (imagesToRemove) {
            console.log("imagesToRemove is not an array:", typeof imagesToRemove, imagesToRemove);

            try {
                const parsedImagesToRemove = typeof imagesToRemove === 'string' ? JSON.parse(imagesToRemove) : [imagesToRemove];
                console.log("Parsed images to remove:", parsedImagesToRemove);

                if (Array.isArray(parsedImagesToRemove)) {
                    await removeStoredImages(parsedImagesToRemove);
                    updatedImages = updatedImages.filter(image => !parsedImagesToRemove.includes(image));
                }
            } catch (parseError) {
                console.error("Error parsing imagesToRemove:", parseError);
            }
        }

        const newImageUrls = mergeProductImages(req);
        if (newImageUrls.length > 0) {
            updatedImages = [...updatedImages, ...newImageUrls];
        }
        
        // Handle color-specific images
        const colorImagesFromFiles = {};
        if (req.files) {
            req.files.forEach(file => {
                if (file.fieldname.startsWith('colorImages_')) {
                    const color = file.fieldname.replace('colorImages_', '');
                    if (!colorImagesFromFiles[color]) {
                        colorImagesFromFiles[color] = [];
                    }
                    colorImagesFromFiles[color].push(file.path);
                }
            });
        }

        // Parse colorImages, sizeColorQuantities, and sizes if they are strings
        // Initialize with existing values if not provided to preserve them
        let parsedColorImages = colorImages !== undefined ? colorImages : product.colorImages || {};
        let parsedSizeColorQuantities = sizeColorQuantities !== undefined ? sizeColorQuantities : product.sizeColorQuantities || {};
        let parsedSizes = sizes !== undefined ? sizes : product.sizes || [];
        
        if (typeof parsedColorImages === 'string') {
            try {
                parsedColorImages = JSON.parse(parsedColorImages);
            } catch (e) {
                console.error("Error parsing colorImages:", e);
                parsedColorImages = product.colorImages || {};
            }
        }
        
        if (typeof parsedSizeColorQuantities === 'string') {
            try {
                parsedSizeColorQuantities = JSON.parse(parsedSizeColorQuantities);
            } catch (e) {
                console.error("Error parsing sizeColorQuantities:", e);
                parsedSizeColorQuantities = product.sizeColorQuantities || {};
            }
        }
        
        if (typeof parsedSizes === 'string') {
            try {
                parsedSizes = JSON.parse(parsedSizes);
            } catch (e) {
                console.error("Error parsing sizes:", e);
                parsedSizes = product.sizes || [];
            }
        }
        
        // Process color images: handle both old format (array) and new format (object with images/imagesToRemove)
        // Start with existing color images to preserve them
        const finalColorImages = {};
        
        // First, normalize existing color images to array format
        const existingColorImages = product.colorImages || {};
        Object.keys(existingColorImages).forEach(color => {
            // Handle both array format and object format
            if (Array.isArray(existingColorImages[color])) {
                finalColorImages[color] = [...existingColorImages[color]];
            } else if (existingColorImages[color] && typeof existingColorImages[color] === 'object' && existingColorImages[color].images) {
                finalColorImages[color] = [...(existingColorImages[color].images || [])];
            } else {
                finalColorImages[color] = [];
            }
        });
        
        // Process parsed color images (from request body)
        if (parsedColorImages && typeof parsedColorImages === 'object') {
            Object.keys(parsedColorImages).forEach(color => {
                const colorData = parsedColorImages[color];
                
                // Handle new format: {images: [], imagesToRemove: []}
                if (colorData && typeof colorData === 'object' && !Array.isArray(colorData)) {
                    // Initialize color if it doesn't exist
                    if (!finalColorImages[color]) {
                        finalColorImages[color] = [];
                    }
                    
                    // Remove images specified in imagesToRemove
                    if (colorData.imagesToRemove && Array.isArray(colorData.imagesToRemove)) {
                        colorData.imagesToRemove.forEach(imagePath => {
                            try {
                                // Remove from array
                                finalColorImages[color] = finalColorImages[color].filter(img => img !== imagePath);
                                
                                // Delete file from filesystem
                                if (fs.existsSync(imagePath)) {
                                    fs.unlinkSync(imagePath);
                                    console.log(`Successfully deleted color image file: ${imagePath}`);
                                } else {
                                    console.log(`Color image file not found: ${imagePath}`);
                                }
                            } catch (fileError) {
                                console.error(`Error deleting color image file ${imagePath}:`, fileError);
                            }
                        });
                    }
                    
                    // Add new images if provided
                    if (colorData.images && Array.isArray(colorData.images)) {
                        finalColorImages[color] = [...finalColorImages[color], ...colorData.images];
                    }
                } 
                // Handle old format: array of images
                else if (Array.isArray(colorData)) {
                    finalColorImages[color] = [...colorData];
                }
            });
        }
        
        // Merge uploaded color images from files
        Object.keys(colorImagesFromFiles).forEach(color => {
            if (finalColorImages[color]) {
                finalColorImages[color] = [...finalColorImages[color], ...colorImagesFromFiles[color]];
            } else {
                finalColorImages[color] = [...colorImagesFromFiles[color]];
            }
        });

        // Build update object with only provided fields
        const updateData = {};
        
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (brand !== undefined) updateData.brand = brand || null;
        if (quantity !== undefined) updateData.quantity = quantity;
        if (colorQuantities !== undefined) {
            const parsedCQ = parseMaybeJson(colorQuantities);
            updateData.colorQuantities =
                parsedCQ && typeof parsedCQ === 'object' ? parsedCQ : colorQuantities;
        }
        if (sizeColorQuantities !== undefined) updateData.sizeColorQuantities = parsedSizeColorQuantities;
        if (sizes !== undefined) updateData.sizes = parsedSizes;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
        if (isNew !== undefined) updateData.isNew = isNew;
        if (isBestSeller !== undefined) updateData.isBestSeller = isBestSeller;
        if (isTrending !== undefined) updateData.isTrending = isTrending;
        if (isSpecial !== undefined) updateData.isSpecial = isSpecial;

        if (price !== undefined || originalPrice !== undefined || isDiscounted !== undefined || discountPercentage !== undefined) {
            const pricing = applyPricingFields(
                price !== undefined ? price : product.price,
                originalPrice !== undefined ? originalPrice : product.originalPrice,
                isDiscounted !== undefined ? isDiscounted : product.isDiscounted,
                discountPercentage !== undefined ? discountPercentage : product.discountPercentage
            );
            updateData.price = pricing.price;
            updateData.originalPrice = pricing.originalPrice;
            updateData.isDiscounted = pricing.isDiscounted;
            updateData.discountPercentage = pricing.discountPercentage;
        }

        if (
            productType !== undefined ||
            sizes !== undefined ||
            sizeQuantities !== undefined ||
            quantity !== undefined
        ) {
            await refreshProductTypeCache();
            const typeDefaults = applyProductTypeDefaults(
                productType !== undefined ? productType : product.productType,
                sizes !== undefined ? sizes : product.sizes,
                sizeQuantities !== undefined ? sizeQuantities : product.sizeQuantities,
                quantity !== undefined ? quantity : product.quantity
            );
            updateData.productType = typeDefaults.productType;
            updateData.sizes = typeDefaults.sizes;
            updateData.sizeQuantities = typeDefaults.sizeQuantities || {};
            updateData.quantity = typeDefaults.quantity;
        }
        
        // Always update images if they were modified (removed or added)
        updateData.images = updatedImages;
        
        // Always update colorImages to preserve existing ones or apply new ones
        updateData.colorImages = finalColorImages;

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json({ updatedProduct, message: "Product updated successfully" });
    } catch (error) {
        console.error("Error in updateProduct:", error);
        res.status(500).json({ message: "Error updating product: " + error.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const product = await productModel.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ product, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ message: "Error deleting product: " + error.message });
    }
}

const getProductsByCategory = async (req, res) => {
    try {
        const { category, page, perPage } = req.params;

        // Validate if category is a valid ObjectId
        if (!category || !category.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid category ID format" });
        }

        const products = await productModel.find({ category }).populate("category").skip((page - 1) * perPage).limit(perPage);

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found for this category" });
        }

        res.status(200).json({ products, message: "Products fetched successfully" });
    } catch (error) {
        console.error("Error in getProductsByCategory:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getProductsByType = async (req, res) => {
    try {
        const { page, perPage, isFeatured, isNew, isBestSeller, isTrending, isSpecial, isDiscounted } = req.body;
        const products = await productModel.find({ isFeatured, isNew, isBestSeller, isTrending, isSpecial, isDiscounted }).skip((page - 1) * perPage).limit(perPage);
        if (!products) {
            return res.status(404).json({ message: "Products not found" });
        }
        res.status(200).json({ products, message: "Products fetched successfully" });
    } catch (error) {
        console.error("Error in getProductsByType:", error);
        res.status(500).json({ message: "Error fetching products: " + error.message });
    }
}

const getAllTypesProducts = async (req, res) => {
    try {
        console.log("getting all ----")
        const { page = 1, perPage = 10 } = req.body;
        
        // Get all products with pagination
        const products = await productModel.find()
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 });

        // Transform products to match frontend format
        const transformedProducts = products.map(product => {
            // Determine badge based on product flags
            let badge = null;
            if (product.isNew) badge = "New";
            else if (product.isBestSeller) badge = "Bestseller";
            else if (product.isTrending) badge = "Trending";
            else if (product.isSpecial) badge = "Special";
            else if (product.isDiscounted) badge = "Sale";

            // Sale price + original (struck) pricing
            const pricing = resolvePricing(product);

            return {
                id: product._id,
                name: product.name,
                price: pricing.price,
                originalPrice: pricing.originalPrice,
                discount: pricing.discount,
                image: product.images && product.images.length > 0 ? product.images[0] : null,
                images: product.images || [],
                badge: badge,
                category: product.category ? product.category.name : null,
                rating: 4.5, 
                sold: "1k+",
                colors: product.colorQuantities ? Object.keys(product.colorQuantities) : [],
                colorImages: product.colorImages || {},
                colorQuantities: product.colorQuantities || {},
                sizeColorQuantities: product.sizeColorQuantities || {},
                sizes: product.sizes || [],
                description: product.description,
                quantity: product.quantity,
                isActive: product.isActive,
                isFeatured: product.isFeatured,
                isNew: product.isNew,
                isBestSeller: product.isBestSeller,
                isTrending: product.isTrending,
                isSpecial: product.isSpecial,
                isDiscounted: pricing.isDiscounted,
                discountPercentage: pricing.discountPercentage
            };
        });

        // Group products by type
        const groupedProducts = {
            featured: transformedProducts.filter(product => product.isFeatured),
            new: transformedProducts.filter(product => product.isNew),
            bestseller: transformedProducts.filter(product => product.isBestSeller),
            trending: transformedProducts.filter(product => product.isTrending),
            special: transformedProducts.filter(product => product.isSpecial),
            discounted: transformedProducts.filter(product => product.isDiscounted),
            all: transformedProducts
        };

        // Convert to array of arrays with type as key
        const productsByType = Object.entries(groupedProducts).map(([type, products]) => ({
            type,
            products
        }));

        // Get total count for pagination
        const totalProducts = await productModel.countDocuments();
        const totalPages = Math.ceil(totalProducts / perPage);

        res.status(200).json({ 
            productsByType,
            message: "Products fetched successfully",
            pagination: {
                page: parseInt(page),
                perPage: parseInt(perPage),
                total: totalProducts,
                totalPages: totalPages,
                currentProducts: transformedProducts.length
            }
        });
    } catch (error) {
        console.error("Error in getAllTypesProducts:", error);
        res.status(500).json({ message: "Error fetching products: " + error.message });
    }
}


/***
 * Category Section 
 */

const createCategory = async (req, res) => {
    try {
        const { name, description, productType } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        const slugifyName = slugify(name, { lower: true });
        const category = await categoryModel.findOne({ slug: slugifyName });
        if (category) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const image = req.file ? req.file.path : null;
        const newCategory = await categoryModel.create({
            name,
            slug: slugifyName,
            description,
            image,
            productType: productType ? String(productType).trim().toLowerCase() : "",
        });
        res.status(201).json({ newCategory, message: "Category created successfully" });
    } catch (error) {
        console.error("Error in createCategory:", error);
        res.status(500).json({ message: "Error creating category: " + error.message });
    }
}


const getCategories = async (req, res) => {
    try {
        console.log("getCategories");
        const categories = await categoryModel.find().populate("subCategories");
        res.status(200).json({ categories, message: "Categories fetched successfully" });
    } catch (error) {
        console.error("Error in getCategories:", error);
        res.status(500).json({ message: "Error fetching categories: " + error.message });
    }
}

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ category, message: "Category fetched successfully" });
    } catch (error) {
        console.error("Error in getCategoryById:", error);
        res.status(500).json({ message: "Error fetching category: " + error.message });
    }
}


const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        const { name, description, productType } = req.body;
        const updateData = {};
        if (name !== undefined) {
            updateData.name = name;
            updateData.slug = slugify(name, { lower: true });
        }
        if (description !== undefined) updateData.description = description;
        if (productType !== undefined) {
            updateData.productType = productType ? String(productType).trim().toLowerCase() : "";
        }
        if (req.file) updateData.image = req.file.path;
        const updatedCategory = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ updatedCategory, message: "Category updated successfully" });
    } catch (error) {
        console.error("Error in updateCategory:", error);
        res.status(500).json({ message: "Error updating category: " + error.message });
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ category, message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        res.status(500).json({ message: "Error deleting category: " + error.message });
    }
}


/** 
 * SubCategory Section 
 */


const createSubCategory = async (req, res) => {
    try {
        const { name, description, parentCategory } = req.body;
        if (!name || !parentCategory) {
            return res.status(400).json({ message: "Name and category are required" });
        }
        const slugifyName = slugify(name, { lower: true });
        const subCategory = await subCategoryModel.findOne({ slug: slugifyName });
        if (subCategory) {
            return res.status(400).json({ message: "SubCategory already exists" });
        }
        const newSubCategory = await subCategoryModel.create({ name, slug: slugifyName, description, parentCategory });
        res.status(201).json({ newSubCategory, message: "SubCategory created successfully" });
    } catch (error) {
        console.error("Error in createSubCategory:", error);
        res.status(500).json({ message: "Error creating subCategory: " + error.message });
    }
}

const getSubCategories = async (req, res) => {
    try {
        const subCategories = await subCategoryModel.find();
        res.status(200).json({ subCategories, message: "SubCategories fetched successfully" });
    } catch (error) {
        console.error("Error in getSubCategories:", error);
        res.status(500).json({ message: "Error fetching subCategories: " + error.message });
    }
}

const getSubCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const subCategory = await subCategoryModel.findById(id);
        if (!subCategory) {
            return res.status(404).json({ message: "SubCategory not found" });
        }
        res.status(200).json({ subCategory, message: "SubCategory fetched successfully" });
    } catch (error) {
        console.error("Error in getSubCategoryById:", error);
        res.status(500).json({ message: "Error fetching subCategory: " + error.message });
    }
}

const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const subCategory = await subCategoryModel.findById(id);
        if (!subCategory) {
            return res.status(404).json({ message: "SubCategory not found" });
        }
        const { name, description, parentCategory } = req.body;
        const updatedSubCategory = await subCategoryModel.findByIdAndUpdate(id, { name, description, parentCategory }, { new: true });
        res.status(200).json({ updatedSubCategory, message: "SubCategory updated successfully" });
    } catch (error) {
        console.error("Error in updateSubCategory:", error);
        res.status(500).json({ message: "Error updating subCategory: " + error.message });
    }
}

const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const subCategory = await subCategoryModel.findByIdAndDelete(id);
        if (!subCategory) {
            return res.status(404).json({ message: "SubCategory not found" });
        }
        res.status(200).json({ subCategory, message: "SubCategory deleted successfully" });
    } catch (error) {
        console.error("Error in deleteSubCategory:", error);
        res.status(500).json({ message: "Error deleting subCategory: " + error.message });
    }
}

const getSubCategoriesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        // Validate if category is a valid ObjectId
        if (!category || !category.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid category ID format" });
        }
        
        const subCategories = await subCategoryModel.find({ parentCategory: category });
        res.status(200).json({ subCategories, message: "SubCategories fetched successfully" });
    } catch (error) {
        console.error("Error in getSubCategoriesByCategory:", error);
        res.status(500).json({ message: "Error fetching subCategories: " + error.message });
    }
}

const getFilteredProducts = async (req, res) => {
    try {
        const {
            // Pagination
            page = 1,
            perPage = 10,
            
            // Basic filters
            search,
            category,
            brand,
            subCategory,
            
            // Price filters
            minPrice,
            maxPrice,
            
            // Product type filters
            isFeatured,
            isBestSeller,
            isTrending,
            isSpecial,
            isDiscounted,
            
            // Color and size filters
            color,
            size,
            
            // Availability
            inStock,
            
            // Sorting
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query object
        const query = {};

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            // Check if it's a valid ObjectId or a slug
            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                // It's a valid ObjectId
                query.category = category;
            } else {
                // It's a slug, find the category by slug
                const categoryDoc = await categoryModel.findOne({ slug: category });
                if (!categoryDoc) {
                    return res.status(404).json({ message: "Category not found" });
                }
                query.category = categoryDoc._id;
            }
        }

        // Brand / company filter (ObjectId or slug)
        if (brand) {
            const brandModel = require("../models/brand.model");
            if (String(brand).match(/^[0-9a-fA-F]{24}$/)) {
                query.brand = brand;
            } else {
                const brandDoc = await brandModel.findOne({ slug: brand });
                if (!brandDoc) {
                    return res.status(404).json({ message: "Brand not found" });
                }
                query.brand = brandDoc._id;
            }
        }

        // SubCategory filter - Currently not supported as products don't have subCategory field
        // If you want to filter by subcategory, you'll need to add subCategory field to product model
        if (subCategory) {
            return res.status(400).json({ 
                message: "SubCategory filtering is not currently supported. Products don't have subCategory field." 
            });
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Product type filters
        if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
        if (isBestSeller !== undefined) query.isBestSeller = isBestSeller === 'true';
        if (isTrending !== undefined) query.isTrending = isTrending === 'true';
        if (isSpecial !== undefined) query.isSpecial = isSpecial === 'true';
        if (isDiscounted !== undefined) query.isDiscounted = isDiscounted === 'true';
        if (req.query.productType) query.productType = req.query.productType;

        // Color filter (search in colorQuantities JSON string)
        if (color) {
            query.colorQuantities = { $regex: color, $options: 'i' };
        }

        // Size filter
        if (size) {
            query.sizes = { $in: [size] };
        }

        // Stock availability filter
        if (inStock === 'true') {
            query.quantity = { $gt: 0 };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const pageNum = parseInt(page);
        const perPageNum = parseInt(perPage);
        const skip = (pageNum - 1) * perPageNum;

        // Execute query with pagination and population
        const [products, totalProducts] = await Promise.all([
            productModel
                .find(query)
                .populate('category', 'name slug')
                .populate('brand', 'name slug logo')
                .sort(sort)
                .skip(skip)
                .limit(perPageNum),
            productModel.countDocuments(query)
        ]);

        const enriched = products.map((p) => {
            const obj = p.toObject();
            return { ...obj, ...resolvePricing(obj) };
        });

        // Calculate pagination info
        const totalPages = Math.ceil(totalProducts / perPageNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        res.status(200).json({
            products: enriched,
            pagination: {
                currentPage: pageNum,
                perPage: perPageNum,
                totalProducts,
                totalPages,
                hasNextPage,
                hasPrevPage,
                currentProducts: products.length
            },
            filters: {
                search,
                category,
                brand,
                subCategory,
                minPrice,
                maxPrice,
                isFeatured,
                isBestSeller,
                isTrending,
                isSpecial,
                isDiscounted,
                color,
                size,
                inStock,
                sortBy,
                sortOrder
            },
            message: "Filtered products fetched successfully"
        });

    } catch (error) {
        console.error("Error in getFilteredProducts:", error);
        res.status(500).json({ message: "Error fetching filtered products: " + error.message });
    }
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    getSimilarProducts,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductsByType,
    getFilteredProducts,
    getAllTypesProducts,
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    createSubCategory,
    getSubCategories,
    getSubCategoryById,
    updateSubCategory,
    deleteSubCategory,
    getSubCategoriesByCategory
};