import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import adminAPI from '../../APIs/admin';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@zagro.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminAPI.login(email, password);
      const token = res?.data?.token;
      const user = res?.data?.user;
      if (!token) {
        toast.error(res?.data?.message || 'Login failed');
        return;
      }
      localStorage.setItem('accessToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user || {}));
      if (user?._id) localStorage.setItem('userId', user._id);
      toast.success('Welcome back');
      router.push('/admin');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <Toaster position="top-right" />
      <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse at 20% 20%, #c4a57455, transparent 50%), radial-gradient(ellipse at 80% 80%, #14121022, transparent 45%)' }} />
      <div className="relative w-full max-w-md admin-card p-8 sm:p-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#8a7350] mb-3">Khareedo commerce</p>
        <h1 className="admin-display text-4xl text-[#141210] mb-2">Admin</h1>
        <p className="text-sm text-[#6b6560] mb-8">Sign in to manage catalog, brands, and orders.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input w-full mt-1" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-[#8a7350]">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="admin-input w-full mt-1" />
          </div>
          <button type="submit" disabled={loading} className="admin-btn-primary w-full py-3 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-[#6b6560]">
          <Link href="/" className="text-[#9a7a4f] hover:underline">Back to store</Link>
        </p>
      </div>
    </div>
  );
}
