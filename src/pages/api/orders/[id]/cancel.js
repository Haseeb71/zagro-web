// PATCH /api/orders/[id]/cancel - Cancel order
export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    // In a real application, you would update in database
    // const updatedOrder = await Order.findByIdAndUpdate(
    //   id, 
    //   { 
    //     orderStatus: 'cancelled',
    //     paymentStatus: 'refunded', // or 'pending_refund'
    //     updatedAt: new Date()
    //   }, 
    //   { new: true }
    // );
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        id,
        orderNumber: `ORD-${id}`,
        orderStatus: 'cancelled',
        paymentStatus: 'refunded',
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
