import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  Sparkles,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Collect Feedback',
    description: 'Gather user feedback from multiple sources in one centralized platform.',
  },
  {
    icon: Lightbulb,
    title: 'AI-Powered Insights',
    description: 'Transform raw feedback into actionable insights with advanced AI analysis.',
  },
  {
    icon: TrendingUp,
    title: 'Track Trends',
    description: 'Identify patterns and trends across all your user feedback over time.',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Decisions',
    description: 'Make informed product decisions backed by comprehensive analytics.',
  },
];

const benefits = [
  'Real-time feedback analysis',
  'Automated sentiment detection',
  'Smart categorization',
  'Action item generation',
  'Theme extraction',
  'Trend identification',
];

export default function Index() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-xl font-bold">Clueso.io</span>
            </Link>
            <div className="flex items-center gap-4">
              {loading ? null : user ? (
                <Button asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            AI-Powered Feedback Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up">
            Transform User Feedback
            <br />
            into <span className="text-primary">Actionable Insights</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Collect, analyze, and act on user feedback with AI-powered intelligence.
            Make data-driven product decisions faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Button asChild size="lg" className="gradient-primary text-lg px-8">
              <Link to="/auth">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/auth">View Demo</Link>
            </Button>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need for Feedback Intelligence
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you understand your users better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Powered by Advanced AI
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our AI engine processes your feedback in real-time, extracting valuable insights
                and generating actionable recommendations automatically.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-3xl" />
              <div className="relative p-8 rounded-3xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">AI Analysis Complete</div>
                    <div className="text-sm text-muted-foreground">Just now</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm font-medium mb-1">Key Theme Detected</div>
                    <div className="text-sm text-muted-foreground">
                      Users are requesting better mobile experience
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm font-medium mb-1">Sentiment Analysis</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-success/20">
                        <div className="h-full w-3/4 rounded-full bg-success" />
                      </div>
                      <span className="text-sm text-success">75% Positive</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm font-medium mb-1">Action Item</div>
                    <div className="text-sm text-muted-foreground">
                      Prioritize responsive design improvements
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl gradient-dark text-sidebar-foreground">
            <Shield className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your Feedback?
            </h2>
            <p className="text-xl text-sidebar-foreground/70 mb-8 max-w-2xl mx-auto">
              Join thousands of product teams using Clueso to make better decisions faster.
            </p>
            <Button asChild size="lg" className="gradient-primary text-lg px-10">
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="text-lg font-semibold">Clueso.io</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Clueso.io. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
