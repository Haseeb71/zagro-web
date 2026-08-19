const { default: slugify } = require("slugify");
const permissionSchema = require("../models/permission.model");
const roleSchema = require("../models/role.model");
const userSchema = require("../models/user.model");
const UserPermissions = require("../models/userPermissions.model");
const Notification = require("../models/notification.model");
const { log, fromReq } = require("../services/activityLog.service");
const { USER_TYPES } = require("../constants/enums");
const bcrypt = require("bcrypt");

const getPermissions = async (req, res) => {
    const permissions = await permissionSchema.find();
    res.status(200).json({ message: "Permissions fetched successfully", permissions });
}

const createRole = async (req, res) => {
    try {
        const { name, permissions } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Role name is required" });
        }

        const slug = slugify(name, { lower: true });

        const existingRole = await roleSchema.findOne({
            $or: [{ name }, { slug }]
        });

        if (existingRole) {
            return res.status(400).json({ 
                message: "Role with this name or slug already exists" 
            });
        }

        const newRole = await roleSchema.create({
            name,
            slug,
            permissions: permissions || []
        });

        // Populate permissions after creation
        const populatedRole = await roleSchema.findById(newRole._id).populate({
            path: 'permissions',
            select: 'name slug description'
        });

        res.status(201).json({ 
            message: "Role created successfully", 
            role: populatedRole 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error creating role", 
            error: error.message 
        });
    }
}

const getRoles = async (req, res) => {
    try {
        const roles = await roleSchema.find().populate({
            path: 'permissions',
            select: 'name slug'
    });
    if(!roles){
        return res.status(404).json({ message: "Roles not found" });
        }
        res.status(200).json({ message: "Roles fetched successfully", roles });
    } catch (error) {
        res.status(500).json({ message: "Internal server errors", error });
    }
}


const deleteRole = async (req,res)=>{
    try {
        const { id } = req.body;
        console.log("idd  ==", id)
        const role = await roleSchema.findById(id);
        
        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        const usersWithRole = await userSchema.find({ role: id });
        if (usersWithRole.length > 0) {
            return res.status(400).json({ 
                message: "Cannot delete role - users are still assigned to it" 
            });
        }

        await roleSchema.findByIdAndDelete(id);
        
        res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
        res.status(500).json({ 
            message: "Error deleting role", 
            error: error.message 
        });
    }
}

const updateRole = async (req, res) => {
    try {
        const { _id, name, slug, description, permissions } = req.body;

        if (!_id || !name || !slug || !permissions) {
            return res.status(400).json({ 
                message: "Missing required fields" 
            });
        }
        const existingRole = await roleSchema.findById(_id);
        if (!existingRole) {
            return res.status(404).json({ 
                message: "Role not found" 
            });
        }

        // Validate permissions exist
        const validPermissions = await permissionSchema.find({
            _id: { $in: permissions }
        });

        if (validPermissions.length !== permissions.length) {
            return res.status(400).json({ 
                message: "One or more invalid permissions provided" 
            });
        }
        const updatedRole = await roleSchema.findByIdAndUpdate(
            _id,
            {
                name,
                slug,
                description,
                permissions
            },
            { new: true }
        ).populate({
            path: 'permissions',
            select: 'name slug'
        });

        res.status(200).json({
            message: "Role updated successfully",
            role: updatedRole
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating role",
            error: error.message
        });
    }
}



/**
 * Worker Routes
 */
const addWorker = async (req, res) => {
    try {
        const { name, email, phone, password, roleId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Missing required fields: name, email, and password are required"
            });
        }

        if (roleId) {
            const role = await roleSchema.findById(roleId);
            if (!role) {
                return res.status(404).json({ message: "Role not found" });
            }
        }

        const existingUser = await userSchema.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newWorker = await userSchema.create({
            name,
            email,
            phone,
            password: hashPassword,
            tempPassword: password,
            type: USER_TYPES.WORKER,
            role: roleId || null,
            isActive: true,
        });

        await UserPermissions.findOneAndUpdate(
            { user: newWorker._id },
            { allowedPermissions: [], canEditProfile: false },
            { upsert: true, new: true }
        );

        const worker = await userSchema.findById(newWorker._id).select("-password");

        log({
            ...fromReq(req),
            action: "create",
            module: "permission",
            description: `Added worker "${name}" (${email})`,
            referenceId: newWorker._id,
            referenceType: "User",
        });

        res.status(201).json({
            message: "Worker added successfully. Assign permissions from Worker Access.",
            worker,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error adding worker",
            error: error.message
        });
    }
}

const getAllWorkers = async(req, res) => {
    try {
        const workers = await userSchema.find({ type: USER_TYPES.WORKER });

        return res.status(200).json({ 
            message: "All workers fetched successfully",
            workers 
        });
    } catch (error) {
        console.log("Error in get all workers =", error);
        return res.status(500).json({
            message: "Error fetching workers",
            error: error.message
        });
    }
}

const editWorker = async(req, res) => {
    try {
        const { id, name, email, phone, password, roleId } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Worker ID is required"
            });
        }

        // Find the worker
        const worker = await userSchema.findById(id);
        if (!worker) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== worker.email) {
            const existingUser = await userSchema.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    message: "Email already in use"
                });
            }
        }

        // Check if role exists if being updated
        if (roleId) {
            const role = await roleSchema.findById(roleId);
            if (!role) {
                return res.status(404).json({
                    message: "Role not found"
                });
            }
        }

        // Prepare update object
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (roleId) updateData.role = roleId;

        // Handle password update if provided
        if (password) {
            const hashPassword = await bcrypt.hash(password, 10);
            updateData.password = hashPassword;
            updateData.tempPassword = password;
        }

        // Update worker
        const updatedWorker = await userSchema.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate({
            path: 'role',
            select: 'name slug permissions',
            populate: {
                path: 'permissions',
                select: 'name slug description'
            }
        });

        res.status(200).json({
            message: "Worker updated successfully",
            worker: updatedWorker
        });

    } catch (error) {
        console.log("Error in edit worker =", error);
        res.status(500).json({
            message: "Error updating worker",
            error: error.message
        });
    }
}

const deleteWorker = async(req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Worker ID is required"
            });
        }

        // Find and verify the worker exists
        const worker = await userSchema.findById(id);
        if (!worker) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }

        // Verify it's actually a worker
        if (worker.type !== USER_TYPES.WORKER) {
            return res.status(400).json({
                message: "User is not a worker"
            });
        }

        await UserPermissions.deleteOne({ user: id });
        await userSchema.findByIdAndDelete(id);

        log({
            ...fromReq(req),
            action: "delete",
            module: "user",
            description: `Admin deleted worker ${worker.name} (${worker.email})`,
            referenceId: id,
            referenceType: "users",
            before: { name: worker.name, email: worker.email, type: worker.type },
        });

        res.status(200).json({
            message: "Worker deleted successfully"
        });

    } catch (error) {
        console.log("Error in delete worker =", error);
        res.status(500).json({
            message: "Error deleting worker",
            error: error.message
        });
    }
}

/**
 * GET /api/permission/user/:userId
 * Return the per-user permission record for a worker.
 */
const getUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const userPerms = await UserPermissions.findOne({ user: userId });
        const allPermissions = await permissionSchema.find().select("name slug description");

        return res.status(200).json({
            success: true,
            data: {
                userId,
                allowedPermissions: userPerms ? userPerms.allowedPermissions : [],
                canEditProfile: userPerms ? userPerms.canEditProfile : false,
                allAvailablePermissions: allPermissions,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching user permissions", error: error.message });
    }
};

/**
 * PUT /api/permission/user/:userId
 * Admin sets per-user permissions.
 * Body: { allowedPermissions: ["raw-material.incoming.create", ...], canEditProfile: true/false }
 */
const setUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { allowedPermissions, canEditProfile } = req.body;

        if (!Array.isArray(allowedPermissions)) {
            return res.status(400).json({ success: false, message: "allowedPermissions must be an array of permission slugs" });
        }

        const worker = await userSchema.findById(userId);
        if (!worker) return res.status(404).json({ success: false, message: "User not found" });

        const userPerms = await UserPermissions.findOneAndUpdate(
            { user: userId },
            { allowedPermissions, canEditProfile: canEditProfile || false },
            { new: true, upsert: true }
        );

        await Notification.create({
            title: "Permissions Updated",
            message: `Permissions for ${worker.name} have been updated by admin.`,
            type: "info",
            category: "permission",
            recipients: [userId],
            createdBy: req.user ? req.user.userId : null,
        });

        log({
            ...fromReq(req),
            action: "permission_change",
            module: "permission",
            description: `Admin updated permissions for ${worker.name} — granted: [${allowedPermissions.join(", ")}]`,
            referenceId: userId,
            referenceType: "users",
            after: { allowedPermissions, canEditProfile },
        });

        return res.status(200).json({
            success: true,
            message: "User permissions updated successfully",
            data: userPerms,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error setting user permissions", error: error.message });
    }
};

/**
 * GET /api/permission/all-slugs
 * Returns all available permission slugs grouped by category.
 * Useful for rendering the permission management UI.
 */
const getAllPermissionSlugs = async (req, res) => {
    const grouped = {
        "Dashboard": {
            general: ["dashboard.view"],
        },
        "Factory Products": {
            products: ["products.view", "products.create", "products.edit", "products.delete"],
            categories: ["categories.view", "categories.create", "categories.edit", "categories.delete"],
            units: ["units.view", "units.create", "units.edit", "units.delete"],
        },
        "Clients & Suppliers": {
            clients: ["clients.view", "clients.create", "clients.edit", "clients.delete"],
            suppliers: ["suppliers.view", "suppliers.create", "suppliers.edit", "suppliers.delete"],
        },
        "Raw Material": {
            incoming: ["raw-material.incoming.view", "raw-material.incoming.create", "raw-material.incoming.edit", "raw-material.incoming.delete"],
            outgoing: ["raw-material.outgoing.view", "raw-material.outgoing.create", "raw-material.outgoing.edit", "raw-material.outgoing.delete"],
        },
        "Warehouse Products": {
            incoming: ["warehouse.incoming.view", "warehouse.incoming.create", "warehouse.incoming.edit", "warehouse.incoming.delete"],
            outgoing: ["warehouse.outgoing.view", "warehouse.outgoing.create", "warehouse.outgoing.edit", "warehouse.outgoing.delete"],
        },
        "Machinery & Tools": {
            incoming: ["machinery.incoming.view", "machinery.incoming.create", "machinery.incoming.edit", "machinery.incoming.delete"],
            outgoing: ["machinery.outgoing.view", "machinery.outgoing.create", "machinery.outgoing.edit", "machinery.outgoing.delete"],
        },
        "E-commerce": {
            products: ["ecommerce.products.view", "ecommerce.products.create", "ecommerce.products.edit", "ecommerce.products.delete"],
            orders: ["ecommerce.orders.view", "ecommerce.orders.create", "ecommerce.orders.edit", "ecommerce.orders.delete"],
            coupons: ["ecommerce.coupons.view", "ecommerce.coupons.create", "ecommerce.coupons.edit", "ecommerce.coupons.delete"],
        },
        "Reports & Ledger": {
            reports: ["reports.view", "reports.export"],
            ledger: ["customer-ledger.view", "customer-ledger.export", "customer-ledger.create"],
        },
        "Workers": {
            general: ["workers.manage"],
        },
        "Activity Log": {
            general: ["activity-log.view"],
        },
    };
    return res.status(200).json({ success: true, data: grouped });
};

module.exports = {
    getPermissions,
    getRoles,
    createRole,
    deleteRole,
    updateRole,
    addWorker,
    getAllWorkers,
    editWorker,
    deleteWorker,
    getUserPermissions,
    setUserPermissions,
    getAllPermissionSlugs,
}

