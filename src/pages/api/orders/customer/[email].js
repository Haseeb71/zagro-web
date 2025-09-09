// GET /api/orders/customer/[email] - Get orders by customer email
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Customer email is required' });
  }

  try {
    // In a real application, you would fetch from database
    // const orders = await Order.find({ 'customer.email': email }).sort({ createdAt: -1 });
    
    // For now, return a mock response
    res.status(200).json({
      success: true,
      orders: [
        {
          id: '1',
          orderNumber: 'ORD-123456789',
          status: 'pending',
          totalAmount: 99.99,
          createdAt: new Date().toISOString(),
          message: 'Customer orders would be fetched from database'
        }
      ],
      message: `Orders for customer ${email} would be fetched from database`
    });

  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
