// POST /api/checkout/customer - Create a new customer
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      fullName,
      email,
      phone,
      address
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fullName, email, phone, address'
      });
    }

    // Validate address structure
    if (!address.street || !address.city || !address.zipCode || !address.country) {
      return res.status(400).json({
        success: false,
        message: 'Address must include street, city, zipCode, and country'
      });
    }

    // Generate a mock customer ID
    const customerId = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create customer object
    const customer = {
      _id: customerId,
      fullName,
      email,
      phone,
      address: {
        street: address.street,
        city: address.city,
        zipCode: address.zipCode,
        country: address.country
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real application, you would save this to a database
    console.log('Customer created:', customer);

    // Return the customer data in the expected format
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: customer
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
