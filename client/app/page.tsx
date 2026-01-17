'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, Sparkles, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-16"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-base-content">Campus Connect</h1>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="btn btn-ghost text-base-content hover:bg-primary/10"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="btn btn-primary"
            >
              Get Started
            </Link>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-20"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-16 h-16 text-primary" />
            </motion.div>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-base-content mb-6">
            AI-Powered Job Portal
          </h2>
          <p className="text-lg sm:text-xl text-base-content/70 max-w-2xl mx-auto mb-8 px-4">
            Connect students with the best opportunities and help HR find the perfect candidates
            through intelligent AI matching
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/auth/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Student Portal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-base-content">Student Portal</h3>
              </div>
              <p className="text-base-content/70 mb-4">
                Discover personalized job recommendations powered by AI. Get matched with
                opportunities that align with your skills and career goals.
              </p>
              <ul className="space-y-2 text-base-content/70 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> AI-powered job matching
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Application tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Career guidance chat
                </li>
              </ul>
              <Link href="/auth/register" className="btn btn-primary btn-outline">
                Join as Student
              </Link>
            </div>
          </motion.div>

          {/* HR Portal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-secondary/10">
                  <Building2 className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-base-content">HR Portal</h3>
              </div>
              <p className="text-base-content/70 mb-4">
                Find the perfect candidates for your job openings. Our AI analyzes profiles
                and matches them with your requirements.
              </p>
              <ul className="space-y-2 text-base-content/70 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-secondary">✓</span> Smart candidate matching
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary">✓</span> Job posting management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary">✓</span> AI recruitment assistant
                </li>
              </ul>
              <Link href="/auth/register" className="btn btn-secondary btn-outline">
                Join as HR
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
