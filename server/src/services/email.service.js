const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const PAYMENT_LABELS = {
    cash_on_delivery: 'Cash on Delivery',
    cod: 'Cash on Delivery',
    bank_transfer: 'Bank Transfer',
    card: 'Card Payment',
    jazzcash: 'JazzCash',
    easypaisa: 'Easypaisa',
};

const formatRs = (amount) => {
    const n = Number(amount) || 0;
    return `Rs ${n.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

const formatPaymentMethod = (method) => {
    if (!method) return 'Cash on Delivery';
    const key = String(method).toLowerCase();
    return PAYMENT_LABELS[key] || String(method).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatAddress = (address) => {
    if (!address) return null;
    if (typeof address === 'string') return { lines: [address] };
    const lines = [
        address.street,
        [address.city, address.state].filter(Boolean).join(', '),
        [address.zipCode, address.country].filter(Boolean).join(', '),
    ].filter(Boolean);
    return {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || '',
        lines,
        full: lines.join(', '),
    };
};

const formatItemsForEmail = (items = []) =>
    items.map((item) => ({
        productName: item.productName,
        brandName: item.brandName || '',
        categoryName: item.categoryName || '',
        quantity: item.quantity,
        productPrice: formatRs(item.productPrice),
        totalPrice: formatRs(item.totalPrice),
        meta: [item.brandName, item.categoryName, item.size, item.color]
            .filter(Boolean)
            .join(' · '),
    }));

const getSmtpConfig = () => {
    const user = process.env.MAILTRAP_USER || process.env.SMTP_USER;
    const pass = process.env.MAILTRAP_PASS || process.env.SMTP_PASS;
    const host =
        process.env.SMTP_HOST ||
        process.env.MAILTRAP_HOST ||
        'sandbox.smtp.mailtrap.io';
    const port = Number(process.env.SMTP_PORT || process.env.MAILTRAP_PORT || 2525);
    const secure = process.env.SMTP_SECURE === 'true';

    return { user, pass, host, port, secure };
};

const createTransporter = async () => {
    const { user, pass, host, port, secure } = getSmtpConfig();

    if (!user || !pass) {
        throw new Error(
            'SMTP credentials missing. Set SMTP_USER and SMTP_PASS (or MAILTRAP_USER / MAILTRAP_PASS) ' +
                'plus SMTP_HOST / SMTP_PORT for production mail delivery.'
        );
    }

    const isMailtrap = /mailtrap\.io/i.test(host);
    console.log(`[email] Using ${isMailtrap ? 'Mailtrap' : 'SMTP'} → ${host}:${port}`);

    return {
        transporter: nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        }),
        isMailtrap,
    };
};

const compileTemplate = (templateName, data) => {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template(data);
};

const buildTemplateData = (orderData) => {
    const {
        customerEmail,
        customerName,
        customerPhone,
        orderNumber,
        orderDate,
        items,
        subtotal,
        discountAmount,
        shippingAmount,
        taxAmount,
        totalAmount,
        shippingAddress,
        paymentMethod,
        notes,
        paymentStatus,
        orderStatus,
    } = orderData;

    const shipping = Number(shippingAmount) || 0;

    return {
        customerName,
        customerEmail,
        customerPhone: customerPhone || 'N/A',
        orderNumber,
        orderDate: new Date(orderDate).toLocaleString('en-PK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
        items: formatItemsForEmail(items),
        subtotal: formatRs(subtotal),
        discountAmount: formatRs(discountAmount),
        hasDiscount: Number(discountAmount) > 0,
        shippingAmount: shipping === 0 ? 'Free' : formatRs(shipping),
        taxAmount: formatRs(taxAmount),
        hasTax: Number(taxAmount) > 0,
        totalAmount: formatRs(totalAmount),
        shippingAddress: formatAddress(shippingAddress),
        paymentMethod: formatPaymentMethod(paymentMethod),
        paymentStatus: paymentStatus || 'Pending',
        orderStatus: orderStatus || 'Pending',
        notes: notes || '',
        hasNotes: Boolean(notes && String(notes).trim()),
        currentYear: new Date().getFullYear(),
        companyName: process.env.COMPANY_NAME || 'Khareedo',
        supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'support@khareedo.com',
        websiteUrl: process.env.WEBSITE_URL || 'http://localhost:3000',
        dashboardUrl: process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000/admin/orders',
        logoUrl: process.env.EMAIL_LOGO_URL || '',
    };
};

const sendMail = async ({ to, subject, html, fromName }) => {
    const { transporter, isMailtrap } = await createTransporter();
    const fromEmail = process.env.EMAIL_FROM || 'orders@khareedo.com';
    const mailOptions = {
        from: `"${fromName || process.env.COMPANY_NAME || 'Khareedo'}" <${fromEmail}>`,
        to,
        subject,
        html,
    };

    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(
                `[email] Sent to ${to}` +
                    (isMailtrap ? ' (check Mailtrap inbox)' : '') +
                    `: ${info.messageId}`
            );
            return { success: true, messageId: info.messageId };
        } catch (error) {
            lastError = error;
            const rateLimited =
                error?.responseCode === 550 ||
                /too many emails per second/i.test(String(error?.response || error?.message || ''));
            if (rateLimited && attempt < 3) {
                const waitMs = attempt * 2000;
                console.warn(`[email] Rate limited — retry ${attempt}/3 in ${waitMs}ms`);
                await new Promise((r) => setTimeout(r, waitMs));
                continue;
            }
            throw error;
        }
    }

    throw lastError;
};

const sendOrderConfirmationEmail = async (orderData) => {
    try {
        const data = buildTemplateData(orderData);
        const htmlContent = compileTemplate('order-confirmation', data);

        return await sendMail({
            to: orderData.customerEmail,
            subject: `Order Confirmed — #${orderData.orderNumber} | ${data.companyName}`,
            html: htmlContent,
        });
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, error: error.message };
    }
};

const sendAdminOrderNotification = async (orderData) => {
    try {
        const data = buildTemplateData(orderData);
        const htmlContent = compileTemplate('admin-order-notification', data);
        const adminTo = process.env.ADMIN_EMAIL || 'admin@khareedo.com';

        return await sendMail({
            to: adminTo,
            subject: `New Order #${orderData.orderNumber} — ${data.totalAmount}`,
            html: htmlContent,
            fromName: `${data.companyName} Orders`,
        });
    } catch (error) {
        console.error('Error sending admin notification email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOrderConfirmationEmail,
    sendAdminOrderNotification,
    formatRs,
    formatPaymentMethod,
};
