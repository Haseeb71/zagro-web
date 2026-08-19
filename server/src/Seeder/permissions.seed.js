const connectToDB = require("../config/db");
const permissionSchema = require("../models/permission.model");
const roleSchema = require("../models/role.model");
const mongoose = require("mongoose");

const PERMISSIONS = [
  // Legacy permissions (kept for backwards compatibility)
  { name: "User", slug: "user", description: "General user access" },
  { name: "Product", slug: "product", description: "Product management" },
  { name: "Category", slug: "category", description: "Category management" },
  { name: "Unit", slug: "unit", description: "Unit management" },
  { name: "Worker Access", slug: "worker-access", description: "Worker access" },
  { name: "Invoices", slug: "invoices", description: "General invoice access" },

  // Raw Material — Incoming
  { name: "View Raw Material Incoming Invoice", slug: "raw-material.incoming.view", description: "View incoming invoices for raw material" },
  { name: "Create Raw Material Incoming Invoice", slug: "raw-material.incoming.create", description: "Create incoming invoices for raw material" },
  { name: "Edit Raw Material Incoming Invoice", slug: "raw-material.incoming.edit", description: "Edit incoming invoices for raw material" },
  { name: "Delete Raw Material Incoming Invoice", slug: "raw-material.incoming.delete", description: "Delete incoming invoices for raw material" },

  // Raw Material — Outgoing
  { name: "View Raw Material Outgoing Invoice", slug: "raw-material.outgoing.view", description: "View outgoing invoices for raw material" },
  { name: "Create Raw Material Outgoing Invoice", slug: "raw-material.outgoing.create", description: "Create outgoing invoices for raw material" },
  { name: "Edit Raw Material Outgoing Invoice", slug: "raw-material.outgoing.edit", description: "Edit outgoing invoices for raw material" },
  { name: "Delete Raw Material Outgoing Invoice", slug: "raw-material.outgoing.delete", description: "Delete outgoing invoices for raw material" },

  // Warehouse — Incoming
  { name: "View Warehouse Incoming Invoice", slug: "warehouse.incoming.view", description: "View incoming invoices for warehouse" },
  { name: "Create Warehouse Incoming Invoice", slug: "warehouse.incoming.create", description: "Create incoming invoices for warehouse" },
  { name: "Edit Warehouse Incoming Invoice", slug: "warehouse.incoming.edit", description: "Edit incoming invoices for warehouse" },
  { name: "Delete Warehouse Incoming Invoice", slug: "warehouse.incoming.delete", description: "Delete incoming invoices for warehouse" },

  // Warehouse — Outgoing
  { name: "View Warehouse Outgoing Invoice", slug: "warehouse.outgoing.view", description: "View outgoing invoices for warehouse" },
  { name: "Create Warehouse Outgoing Invoice", slug: "warehouse.outgoing.create", description: "Create outgoing invoices for warehouse" },
  { name: "Edit Warehouse Outgoing Invoice", slug: "warehouse.outgoing.edit", description: "Edit outgoing invoices for warehouse" },
  { name: "Delete Warehouse Outgoing Invoice", slug: "warehouse.outgoing.delete", description: "Delete outgoing invoices for warehouse" },

  // Machinery & Tools — Incoming
  { name: "View Machinery Incoming Invoice", slug: "machinery.incoming.view", description: "View incoming invoices for machinery" },
  { name: "Create Machinery Incoming Invoice", slug: "machinery.incoming.create", description: "Create incoming invoices for machinery" },
  { name: "Edit Machinery Incoming Invoice", slug: "machinery.incoming.edit", description: "Edit incoming invoices for machinery" },
  { name: "Delete Machinery Incoming Invoice", slug: "machinery.incoming.delete", description: "Delete incoming invoices for machinery" },

  // Machinery & Tools — Outgoing
  { name: "View Machinery Outgoing Invoice", slug: "machinery.outgoing.view", description: "View outgoing invoices for machinery" },
  { name: "Create Machinery Outgoing Invoice", slug: "machinery.outgoing.create", description: "Create outgoing invoices for machinery" },
  { name: "Edit Machinery Outgoing Invoice", slug: "machinery.outgoing.edit", description: "Edit outgoing invoices for machinery" },
  { name: "Delete Machinery Outgoing Invoice", slug: "machinery.outgoing.delete", description: "Delete outgoing invoices for machinery" },

  // E-commerce
  { name: "View E-commerce Products", slug: "ecommerce.products.view", description: "View e-commerce products" },
  { name: "Create E-commerce Products", slug: "ecommerce.products.create", description: "Create e-commerce products" },
  { name: "Edit E-commerce Products", slug: "ecommerce.products.edit", description: "Edit e-commerce products" },
  { name: "Delete E-commerce Products", slug: "ecommerce.products.delete", description: "Delete e-commerce products" },
  { name: "View Orders", slug: "ecommerce.orders.view", description: "View customer orders" },
  { name: "Create Orders", slug: "ecommerce.orders.create", description: "Create customer orders" },
  { name: "Edit Orders", slug: "ecommerce.orders.edit", description: "Edit customer orders" },
  { name: "Delete Orders", slug: "ecommerce.orders.delete", description: "Delete customer orders" },
  { name: "View Coupons", slug: "ecommerce.coupons.view", description: "View coupons" },
  { name: "Create Coupons", slug: "ecommerce.coupons.create", description: "Create coupons" },
  { name: "Edit Coupons", slug: "ecommerce.coupons.edit", description: "Edit coupons" },
  { name: "Delete Coupons", slug: "ecommerce.coupons.delete", description: "Delete coupons" },

  // Reports
  { name: "View Reports", slug: "reports.view", description: "View inventory and sales reports" },
  { name: "Export Reports", slug: "reports.export", description: "Export reports to PDF or Excel" },

  // Customer Ledger
  { name: "View Customer Ledger", slug: "customer-ledger.view", description: "View customer/supplier ledger" },
  { name: "Export Customer Ledger", slug: "customer-ledger.export", description: "Export ledger to PDF or Excel" },
  { name: "Record Ledger Transactions", slug: "customer-ledger.create", description: "Record payments and adjustments on customer ledger" },

  // Dashboard
  { name: "View Dashboard", slug: "dashboard.view", description: "View main dashboard" },

  // Factory Products module
  { name: "View Products", slug: "products.view", description: "View factory products" },
  { name: "Create Products", slug: "products.create", description: "Create factory products" },
  { name: "Edit Products", slug: "products.edit", description: "Edit factory products" },
  { name: "Delete Products", slug: "products.delete", description: "Delete factory products" },

  { name: "View Categories", slug: "categories.view", description: "View product categories" },
  { name: "Create Categories", slug: "categories.create", description: "Create product categories" },
  { name: "Edit Categories", slug: "categories.edit", description: "Edit product categories" },
  { name: "Delete Categories", slug: "categories.delete", description: "Delete product categories" },

  { name: "View Units", slug: "units.view", description: "View units" },
  { name: "Create Units", slug: "units.create", description: "Create units" },
  { name: "Edit Units", slug: "units.edit", description: "Edit units" },
  { name: "Delete Units", slug: "units.delete", description: "Delete units" },

  // Clients
  { name: "View Clients", slug: "clients.view", description: "View factory clients" },
  { name: "Create Clients", slug: "clients.create", description: "Create factory clients" },
  { name: "Edit Clients", slug: "clients.edit", description: "Edit factory clients" },
  { name: "Delete Clients", slug: "clients.delete", description: "Delete factory clients" },

  // Suppliers
  { name: "View Suppliers", slug: "suppliers.view", description: "View suppliers" },
  { name: "Create Suppliers", slug: "suppliers.create", description: "Create suppliers" },
  { name: "Edit Suppliers", slug: "suppliers.edit", description: "Edit suppliers" },
  { name: "Delete Suppliers", slug: "suppliers.delete", description: "Delete suppliers" },

  // Activity Log
  { name: "View Activity Log", slug: "activity-log.view", description: "View system activity log" },

  // Workers
  { name: "Manage Workers", slug: "workers.manage", description: "Add, edit, and delete workers" },

  // Profile
  { name: "Edit Own Profile", slug: "profile.edit", description: "Employee can edit their own profile" },
];

const createPermission = async () => {
  connectToDB();
  try {
    const createdPermissions = [];

    for (const permission of PERMISSIONS) {
      const existing = await permissionSchema.findOne({ slug: permission.slug });
      if (!existing) {
        const newPerm = await permissionSchema.create(permission);
        createdPermissions.push(newPerm);
        console.log(`  ✅ Created: ${permission.slug}`);
      } else {
        createdPermissions.push(existing);
        console.log(`  ⏭  Exists: ${permission.slug}`);
      }
    }

    // Ensure admin role has ALL permissions
    const allPermIds = createdPermissions.map((p) => p._id);
    const adminRole = await roleSchema.findOne({ slug: "admin" });
    if (!adminRole) {
      await roleSchema.create({ name: "Admin", slug: "admin", permissions: allPermIds });
      console.log("Admin role created with all permissions.");
    } else {
      await roleSchema.findByIdAndUpdate(adminRole._id, { permissions: allPermIds });
      console.log("Admin role updated with all permissions.");
    }

    console.log("\nPermission seeder completed successfully.");
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error in permission seeder:", error);
    process.exit(1);
  }
};

createPermission();
