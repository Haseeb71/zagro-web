// POST /api/checkout - Create a new order
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      customerId,
      items,
      subtotal,
      discountAmount = 0,
      couponCode = null,
      shippingAmount = 9.99,
      taxAmount = 0,
      totalAmount,
      paymentMethod = 'cash_on_delivery',
      paymentStatus = 'pending',
      orderStatus = 'pending',
      shippingAddress,
      billingAddress,
      notes = ''
    } = req.body;

    // Validate required fields
    if (!customerId || !items || !subtotal || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerId, items, subtotal, totalAmount'
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must not be empty'
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order object
    const order = {
      _id: `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      orderNumber,
      customerId,
      items,
      subtotal,
      discountAmount,
      couponCode,
      shippingAmount,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      orderStatus,
      shippingAddress,
      billingAddress,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real application, you would save this to a database
    console.log('Order created:', order);

    // Return the order data
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
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
