import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  Sparkles, Video, MessageSquare, Shield, Zap, Users, 
  Briefcase, Brain, Star, CheckCircle, TrendingUp, Clock,
  Search, Globe, Award, Target, ArrowRight, ChevronRight
} from 'lucide-react';
import { 
  AIFeaturesSection, 
  VideoCallSection, 
  HowItWorksSection, 
  UseCasesSection,
  CTASection,
  Footer,
  LandingNav 
} from '@/components/LandingPageSections';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen w-full">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 relative z-10">
            <div className="inline-block">
              <div className="glass-card px-4 py-2 inline-flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  AI-Powered Campus Collaboration Platform
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight" style={{
              background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Connect, Collaborate,
              <br />Create Together
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold max-w-4xl mx-auto" style={{ color: 'var(--foreground)' }}>
              The ultimate platform where university students discover talent, find opportunities, and build amazing projects together
            </p>
            
            <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Powered by AI matching, real-time video calls, smart notifications, and seamless collaboration tools - CampusConnect brings your campus community together like never before.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/signup"
                className="btn-gradient px-8 py-4 text-lg font-semibold inline-flex items-center justify-center gap-2 group"
              >
                Start For Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="glass-card px-8 py-4 text-lg font-semibold inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                Explore Features
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#1E3A8A]">AI</div>
                <div className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Smart Matching</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#1E3A8A]">HD</div>
                <div className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Video Calls</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#1E3A8A]">Real-time</div>
                <div className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Messaging</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#1E3A8A]">Secure</div>
                <div className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Platform</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'var(--foreground-muted)' }}>
              Comprehensive tools and features designed to help students collaborate, connect, and build amazing things together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="glass-card p-8 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                AI-Powered Matching
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Advanced algorithms analyze your skills, interests, and profile to recommend the perfect opportunities and collaborators. Get intelligent match scores showing compatibility with each opportunity.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                HD Video Calls
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Built-in high-quality video calling powered by 100ms. Schedule and join interviews, team meetings, and collaboration sessions without leaving the platform. Screen sharing included.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                Real-time Messaging
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Connect instantly with potential collaborators. Real-time chat keeps you in sync with your team, with message history and file sharing capabilities.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                Smart Job Board
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Post and discover opportunities across categories: Academic Projects, Startups, Part-time Jobs, and Hackathon Teams. Admin-approved quality control ensures legitimate postings.
              </p>
          </div>

            <div className="glass-card p-8 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                Profile Ratings
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                AI-powered profile strength analysis provides actionable feedback to improve your profile. Get scored on completeness, skills relevance, and professional presentation.
              </p>
          </div>

            <div className="glass-card p-8 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                Secure & Private
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Enterprise-grade security with Supabase authentication. Your data is encrypted, and you control what information you share. GDPR compliant and privacy-first design.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                Application Tracking
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Track all your applications in one place. See status updates, manage responses, and never miss an opportunity. Built-in resume management and application analytics.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                Role Flexibility
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Switch seamlessly between being a Talent Seeker (finding opportunities) and Talent Finder (posting projects). One account, limitless possibilities.
              </p>
            </div>

            <div className="glass-card p-8 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
                University Network
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                Connect with students across your campus. Filter by department, year, and interests to find the perfect team members for your next big project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <AIFeaturesSection />

      {/* Video Call Section */}
      <VideoCallSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Use Cases */}
      <UseCasesSection />

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
