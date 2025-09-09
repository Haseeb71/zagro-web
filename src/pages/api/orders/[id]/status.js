// PATCH /api/orders/[id]/status - Update order status
export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  // Valid order statuses
  const validStatuses = [
    'pending',
    'confirmed', 
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: 'Invalid status',
      validStatuses
    });
  }

  try {
    // In a real application, you would update in database
    // const updatedOrder = await Order.findByIdAndUpdate(
    //   id, 
    //   { 
    //     orderStatus: status,
    //     updatedAt: new Date()
    //   }, 
    //   { new: true }
    // );
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        id,
        orderNumber: `ORD-${id}`,
        orderStatus: status,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
