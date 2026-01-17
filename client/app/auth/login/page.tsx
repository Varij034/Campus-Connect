'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'hr'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Navigate to appropriate dashboard
      router.push(`/${role}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-100 to-base-200 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card bg-base-100 shadow-2xl w-full max-w-md"
      >
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <GraduationCap className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-base-content mb-2">Welcome Back</h1>
            <p className="text-base-content/70">Sign in to Campus Connect</p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 btn ${
                role === 'student' ? 'btn-primary' : 'btn-outline'
              }`}
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Student
            </button>
            <button
              onClick={() => setRole('hr')}
              className={`flex-1 btn ${
                role === 'hr' ? 'btn-secondary' : 'btn-outline'
              }`}
            >
              <Building2 className="w-5 h-5 mr-2" />
              HR
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={`input input-bordered w-full pl-10 ${
                    errors.email ? 'input-error' : ''
                  }`}
                />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pl-10 ${
                    errors.password ? 'input-error' : ''
                  }`}
                />
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password}</span>
                </label>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="label cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" />
                <span className="label-text ml-2">Remember me</span>
              </label>
              <Link href="#" className="label-text-alt link link-hover">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-6">
              Sign In
            </button>
          </form>

          <div className="divider">OR</div>

          <p className="text-center text-sm text-base-content/70">
            Don't have an account?{' '}
            <Link href="/register" className="link link-primary font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
