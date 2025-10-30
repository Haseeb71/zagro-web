import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function Returns() {
  return (
    <Layout>
      <Head>
        <title>Returns, Refunds & Exchanges - Zagro Footwear</title>
        <meta name="description" content="Read Zagro Footwear's return, refund and exchange policy including timelines and how to start a return." />
      </Head>
      <div className="min-h-screen bg-white">
        <section className="py-8 sm:py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Return, Refund & Exchange Policy</h1>

            <p className="text-gray-800 mb-6">At ZAGRO Footwear, every pair is crafted with care, and your satisfaction means everything to us. We aim to make your shopping experience smooth, transparent, and reliable. Please take a moment to read our return and exchange guidelines below.</p>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">Return Policy</h2>
            <div className="space-y-4 text-gray-800 mb-6">
              <p>We offer a 15-day return policy, meaning you have 15 days from the date of delivery to request a return. To qualify, your item must be in the same condition as received — unworn, unused, with all original tags attached, and in its original packaging. You’ll also need to provide a receipt or proof of purchase.</p>
              <p>To initiate a return, please contact us at <a href="mailto:footwearzagro@gmail.com" className="text-blue-600 underline">footwearzagro@gmail.com</a> or send us a message on our official social media platforms. Our customer care team will guide you through the process.</p>
              <p>Once your return is approved, we’ll provide a return shipping label and detailed instructions on how to send your package back. Kindly note that items returned without prior approval will not be accepted.</p>
              <p className="font-medium">Important: Before opening your parcel, please record a video as proof of the item’s condition. This helps us verify any claims related to damage, missing items, or incorrect delivery.</p>
              <p><span className="font-semibold">Note:</span> There may be a slight color difference between the product images and the actual item due to studio lighting, camera effects, and screen display settings. Such variations are natural and not considered a defect or reason for return.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">Refund Policy</h2>
            <div className="space-y-4 text-gray-800 mb-6">
              <p>Refunds are applicable only on purchases made within 15 days of delivery. Once your return is received and inspected, we’ll notify you of the outcome. If approved, the refund will be processed automatically to your original payment method.</p>
              <p>Please allow a few working days for your bank or credit card provider to reflect the refund.</p>
              <p>During sale periods, please note that no refunds or article changes are allowed. Only size exchanges will be entertained, subject to availability. Customers are responsible for courier charges for both delivery and return during sale events.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">Credit Voucher</h2>
            <div className="space-y-4 text-gray-800 mb-6">
              <p>If a refund cannot be processed, we offer a credit voucher for your next purchase. Each voucher carries a unique redeemable code, so please keep it safe and private.</p>
              <p>Reimbursements are issued exclusively as discount coupons, redeemable during your next online purchase with ZAGRO Footwear.</p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">Size Exchange</h2>
            <div className="space-y-4 text-gray-800">
              <p>Size exchanges are available within 15 days of receiving your order, provided the product is returned in its original dispatch condition.</p>
              <p>Customers will bear courier charges for both sending and returning the product if the order was fulfilled correctly.</p>
              <p>You can reach us via our social media pages or contact number during working hours for assistance. Once your size is confirmed, your replacement pair will be dispatched on the next working day.</p>
              <p>In case of courier delays, our team will stay in touch until your exchanged item is delivered. You’ll also be notified once we’ve received and inspected your return to proceed with the exchange.</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}


