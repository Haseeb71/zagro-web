// GET /api/coupons/[code] - Get coupon by code
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  try {
    // In a real application, you would fetch from database
    // const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    // Mock coupon data for testing
    const mockCoupons = {
      'WELCOME10': {
        code: 'WELCOME10',
        title: 'Welcome Discount',
        details: '10% off on your first order',
        discountPercentage: 10,
        isActive: true,
        validFrom: new Date('2024-01-01').toISOString(),
        validUntil: new Date('2024-12-31').toISOString()
      },
      'SAVE20': {
        code: 'SAVE20',
        title: 'Save More',
        details: '20% off on orders over Rs 100',
        discountPercentage: 20,
        isActive: true,
        validFrom: new Date('2024-01-01').toISOString(),
        validUntil: new Date('2024-12-31').toISOString()
      },
      'EXPIRED': {
        code: 'EXPIRED',
        title: 'Expired Coupon',
        details: 'This coupon has expired',
        discountPercentage: 15,
        isActive: false,
        validFrom: new Date('2023-01-01').toISOString(),
        validUntil: new Date('2023-12-31').toISOString()
      }
    };

    const coupon = mockCoupons[code.toUpperCase()];

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      coupon
    });

  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
