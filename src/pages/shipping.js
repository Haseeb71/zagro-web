import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function Shipping() {
  return (
    <Layout>
      <Head>
        <title>Shipping Policy - Zagro Footwear</title>
        <meta name="description" content="Read Zagro Footwear's shipment policy, delivery timelines, fees, and important notes for secure deliveries." />
      </Head>
      <div className="min-h-screen bg-white">
        <section className="py-8 sm:py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Shipment Policy</h1>

            <div className="space-y-4 text-gray-800">
              <p>Delivery fee will be charged for orders below Rs. 4,999/-.</p>
              <p>Delivery time: 03–05 working days after order confirmation.</p>
              <p>All parcels are dispatched through registered courier companies.</p>
              <p>Customers must pay before receiving the parcel due to security concerns.</p>
              <p>Reject the parcel immediately if it appears opened or damaged at the time of delivery.</p>
            </div>

            <div className="mt-8 p-4 rounded-md bg-yellow-50 border border-yellow-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Note</h2>
              <p className="text-gray-800">
                As per courier policy, parcels cannot be opened before payment. However, we strongly advise recording an unboxing video after receiving your order. This helps us verify any claim regarding size, product mismatch, or damage. Please note that claims without video proof may not be accepted.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}


