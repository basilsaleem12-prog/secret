'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Brain, Video, CheckCircle, Target, Zap, Clock, 
  Award, Search, ArrowRight, Sparkles, Menu, X
} from 'lucide-react';

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass-card" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              CampusConnect
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="#features" 
              className="text-sm font-medium hover:text-[#1E3A8A] transition-colors" 
              style={{ color: 'var(--foreground)' }}
            >
              Features
            </a>
            <a 
              href="#ai" 
              className="text-sm font-medium hover:text-[#1E3A8A] transition-colors" 
              style={{ color: 'var(--foreground)' }}
            >
              AI Power
            </a>
            <a 
              href="#video" 
              className="text-sm font-medium hover:text-[#1E3A8A] transition-colors" 
              style={{ color: 'var(--foreground)' }}
            >
              Video Calls
            </a>
            <a 
              href="#how-it-works" 
              className="text-sm font-medium hover:text-[#1E3A8A] transition-colors" 
              style={{ color: 'var(--foreground)' }}
            >
              How It Works
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="glass-card px-4 py-2 text-sm font-semibold hover:scale-105 transition-all rounded-lg"
              style={{ color: 'var(--foreground)' }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-gradient px-4 py-2 text-sm font-semibold rounded-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <a
              href="#features"
              className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: 'var(--foreground)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#ai"
              className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: 'var(--foreground)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              AI Power
            </a>
            <a
              href="#video"
              className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: 'var(--foreground)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Video Calls
            </a>
            <a
              href="#how-it-works"
              className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
              style={{ color: 'var(--foreground)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            
            <div className="pt-4 space-y-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link
                href="/login"
                className="block px-4 py-2 text-center glass-card rounded-lg text-sm font-semibold"
                style={{ color: 'var(--foreground)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-2 text-center btn-gradient rounded-lg text-sm font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export function AIFeaturesSection() {
  return (
    <section id="ai" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-blue-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block glass-card px-4 py-2 mb-4">
            <span className="text-sm font-semibold text-[#1E3A8A]">
              🤖 Powered by Artificial Intelligence
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            AI That Works For You
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            Advanced machine learning algorithms that understand your profile and match you with the perfect opportunities
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                    Smart Match Scoring
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    Every opportunity gets an AI-calculated compatibility score (0-100%) based on your skills, interests, and experience. See exactly why each match is relevant to you.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                    Intelligent Recommendations
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    Get personalized job recommendations based on your profile, application history, and success patterns. The more you use CampusConnect, the smarter it gets.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                    Profile Strength Analysis
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    AI evaluates your profile completeness, skill relevance, and presentation quality. Get actionable suggestions to improve your profile and stand out to employers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                How AI Matching Works
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                    <strong>Profile Analysis:</strong> AI scans your skills, interests, experience
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                    <strong>Job Parsing:</strong> Extracts requirements, tags, and expectations
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                    <strong>Similarity Calculation:</strong> Computes match score using ML algorithms
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                    <strong>Smart Ranking:</strong> Prioritizes best matches in your feed
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(30, 58, 138, 0.1)' }}>
                  <div className="text-3xl font-bold text-[#1E3A8A] mb-1">82%</div>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    Average Match Accuracy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VideoCallSection() {
  return (
    <section id="video" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block glass-card px-4 py-2 mb-4">
            <span className="text-sm font-semibold text-[#1E3A8A]">
              🎥 Powered by 100ms
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Professional Video Calling Built-In
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            Conduct interviews, team meetings, and collaboration sessions without leaving the platform. Crystal-clear HD video powered by industry-leading 100ms technology.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 text-center">
            <Video className="w-12 h-12 text-[#1E3A8A] mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              HD Quality
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Up to 1080p video quality with adaptive bitrate for smooth calls even on slower connections
            </p>
          </div>

          <div className="glass-card p-6 text-center">
            <Zap className="w-12 h-12 text-[#1E3A8A] mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Low Latency
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Sub-200ms latency for real-time conversations. Feels like you're in the same room
            </p>
          </div>

          <div className="glass-card p-6 text-center">
            <CheckCircle className="w-12 h-12 text-[#1E3A8A] mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Screen Sharing
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Share your screen, present slides, or collaborate on code in real-time
            </p>
          </div>
        </div>

        <div className="glass-card p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                Call Request System
              </h3>
              <p className="text-base mb-6" style={{ color: 'var(--foreground-muted)' }}>
                Schedule and manage video calls effortlessly. Send call requests with proposed times, get instant notifications, and join with one click.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#1E3A8A] flex-shrink-0" />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                    Request calls for interviews or team discussions
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#1E3A8A] flex-shrink-0" />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                    Accept/reject with optional message
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#1E3A8A] flex-shrink-0" />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                    Real-time notifications for all call activities
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#1E3A8A] flex-shrink-0" />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                    One-click join with secure room tokens
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6" style={{ background: 'rgba(30, 58, 138, 0.05)' }}>
              <div className="aspect-video bg-gradient-to-br from-[#1E3A8A] to-blue-600 rounded-lg flex items-center justify-center">
                <Video className="w-16 h-16 text-white" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--foreground-muted)' }}>Connection Quality</span>
                  <span className="text-green-600 font-semibold">Excellent</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full w-full bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Get Started in Minutes
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            From sign-up to your first collaboration in just 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              number: '01',
              title: 'Create Account',
              description: 'Sign up with your university email. Quick OAuth with Google or GitHub, or use traditional email registration.',
            },
            {
              number: '02',
              title: 'Build Profile',
              description: 'Add your skills, interests, and experience. Upload your resume and let AI analyze your profile strength.',
            },
            {
              number: '03',
              title: 'Discover & Connect',
              description: 'Browse AI-recommended opportunities. Apply to projects, send messages, and schedule video calls.',
            },
            {
              number: '04',
              title: 'Collaborate',
              description: 'Join teams, work on projects, and build your portfolio. Switch to Finder mode to post your own opportunities.',
            },
          ].map((step, index) => (
            <div key={index} className="relative">
              <div className="glass-card p-6 h-full">
                <div className="text-5xl font-bold text-[#1E3A8A] mb-4 opacity-20">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                  {step.description}
                </p>
              </div>
              {index < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-[#1E3A8A] opacity-30" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/signup"
            className="btn-gradient px-10 py-4 text-lg font-semibold inline-flex items-center gap-2"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function UseCasesSection() {
  const useCases = [
    {
      icon: '🎓',
      title: 'Academic Projects',
      description: 'Find team members for class projects, research collaborations, and academic competitions. Connect with students who have complementary skills.',
    },
    {
      icon: '🚀',
      title: 'Startup Teams',
      description: 'Building the next big thing? Find co-founders, developers, designers, and marketers. Turn your startup idea into reality with the right team.',
    },
    {
      icon: '💼',
      title: 'Part-Time Jobs',
      description: 'Discover flexible work opportunities on campus. From tutoring to research assistance, find jobs that fit your schedule and interests.',
    },
    {
      icon: '🏆',
      title: 'Hackathon Teams',
      description: 'Preparing for a hackathon? Form dream teams with diverse skill sets. Find developers, designers, and domain experts for your next win.',
    },
    {
      icon: '📚',
      title: 'Study Groups',
      description: 'Connect with classmates for study sessions and group projects. Find people taking the same courses or with similar academic interests.',
    },
    {
      icon: '🌟',
      title: 'Skill Exchange',
      description: 'Learn from peers and share your expertise. Trade skills, mentor others, and grow together as a community.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-blue-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Built For Every Need
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            Whatever your goal, CampusConnect has you covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div key={index} className="glass-card p-6 hover:scale-105 transition-all">
              <div className="text-4xl mb-4">{useCase.icon}</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                {useCase.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/10 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
              Ready to Connect?
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Join thousands of students already collaborating, building, and succeeding together on CampusConnect
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="btn-gradient px-10 py-4 text-lg font-semibold inline-flex items-center justify-center gap-2"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="glass-card px-10 py-4 text-lg font-semibold inline-flex items-center justify-center hover:scale-105 transition-transform"
              >
                Sign In
              </Link>
            </div>
            <p className="text-sm mt-6" style={{ color: 'var(--foreground-muted)' }}>
              No credit card required • Free forever • 2 minute setup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
              CampusConnect
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Connecting university students with opportunities and collaborators worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground-muted)' }}>Features</a></li>
              <li><a href="#ai" className="hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground-muted)' }}>AI Matching</a></li>
              <li><a href="#video" className="hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground-muted)' }}>Video Calls</a></li>
              <li><a href="#how-it-works" className="hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground-muted)' }}>How It Works</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground-muted)' }}>About Us</a></li>
              <li><a href="#" className="hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground-muted)' }}>Contact</a></li>
              <li><a href="#" className="hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground-muted)' }}>Privacy</a></li>
              <li><a href="#" className="hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground-muted)' }}>Terms</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Get Started</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground-muted)' }}>Sign Up</Link></li>
              <li><Link href="/login" className="hover:text-[#1E3A8A] transition-colors" style={{ color: 'var(--foreground-muted)' }}>Login</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-center text-sm" style={{ color: 'var(--foreground-muted)' }}>
            © 2025 CampusConnect. Built for university students, by students. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

