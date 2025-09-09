// POST /api/orders - Create a new order
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      customer,
      items,
      subtotal,
      discountAmount = 0,
      couponCode = null,
      shippingAmount = 9.99,
      taxAmount,
      totalAmount,
      paymentMethod = 'cash_on_delivery',
      paymentStatus = 'pending',
      orderStatus = 'pending',
      shippingAddress,
      billingAddress,
      notes = ''
    } = req.body;

    // Validate required fields
    if (!customer || !items || !subtotal || !totalAmount) {
      return res.status(400).json({
        message: 'Missing required fields: customer, items, subtotal, totalAmount'
      });
    }

    // Validate customer data
    if (!customer.fullName || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({
        message: 'Customer data incomplete: fullName, email, phone, and address are required'
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Items array is required and must not be empty'
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order object
    const order = {
      orderNumber,
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: {
          street: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          zipCode: customer.address.zipCode,
          country: customer.address.country || 'Pakistan'
        }
      },
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName || 'Unknown Product',
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price || 0
      })),
      subtotal: parseFloat(subtotal),
      discountAmount: parseFloat(discountAmount),
      couponCode,
      shippingAmount: parseFloat(shippingAmount),
      taxAmount: parseFloat(taxAmount),
      totalAmount: parseFloat(totalAmount),
      paymentMethod,
      paymentStatus,
      orderStatus,
      shippingAddress: shippingAddress || customer.address,
      billingAddress: billingAddress || customer.address,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real application, you would save this to a database
    // For now, we'll just return the created order
    console.log('Order created:', order);

    // Simulate database save
    // In production, you would use your database here
    // const savedOrder = await Order.create(order);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: order
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
