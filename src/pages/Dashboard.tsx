import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

interface FeedbackStats {
  total: number;
  thisWeek: number;
  categories: Record<string, number>;
}

interface Insight {
  id: string;
  title: string;
  summary: string;
  sentiment: string;
  created_at: string;
}

interface Feedback {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FeedbackStats>({ total: 0, thisWeek: 0, categories: {} });
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [recentInsights, setRecentInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch feedback
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackData) {
        setRecentFeedback(feedbackData.slice(0, 5));
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const categories: Record<string, number> = {};
        feedbackData.forEach(f => {
          categories[f.category || 'general'] = (categories[f.category || 'general'] || 0) + 1;
        });

        setStats({
          total: feedbackData.length,
          thisWeek: feedbackData.filter(f => new Date(f.created_at) > weekAgo).length,
          categories,
        });
      }

      // Fetch insights
      const { data: insightsData } = await supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (insightsData) {
        setRecentInsights(insightsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-success/10 text-success border-success/20';
      case 'negative': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-info/10 text-info border-info/20';
      case 'reviewed': return 'bg-warning/10 text-warning border-warning/20';
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your feedback and insights.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/insights">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </Link>
            </Button>
            <Button asChild>
              <Link to="/feedback">
                <Plus className="mr-2 h-4 w-4" />
                Add Feedback
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Feedback
              </CardTitle>
              <MessageSquare className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground mt-1">
                +{stats.thisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Insights Generated
              </CardTitle>
              <Lightbulb className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recentInsights.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Powered by AI analysis
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(stats.categories).length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Active categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Feedback */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>Latest feedback from your users</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/feedback">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentFeedback.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No feedback yet</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/feedback">Add your first feedback</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentFeedback.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{feedback.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getStatusColor(feedback.status)}>
                            {feedback.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">
                            {feedback.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(feedback.created_at), 'MMM d')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Insights */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>AI-generated analysis of your feedback</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/insights">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentInsights.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No insights generated yet</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/insights">Generate your first insight</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline" className={getSentimentColor(insight.sentiment)}>
                          {insight.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {insight.summary}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(insight.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
