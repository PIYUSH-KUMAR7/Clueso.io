import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';

interface Insight {
  id: string;
  title: string;
  summary: string;
  key_themes: string[];
  sentiment: string;
  action_items: string[];
  feedback_count: number;
  created_at: string;
}

interface Feedback {
  id: string;
  title: string;
  content: string;
  category: string;
}

export default function InsightsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [insightsResult, feedbackResult] = await Promise.all([
        supabase.from('insights').select('*').order('created_at', { ascending: false }),
        supabase.from('feedback').select('id', { count: 'exact' }),
      ]);

      if (insightsResult.data) {
        setInsights(insightsResult.data as Insight[]);
      }
      if (feedbackResult.count !== null) {
        setFeedbackCount(feedbackResult.count);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      // Fetch all feedback for analysis
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      if (!feedbackData || feedbackData.length === 0) {
        toast({
          title: "No feedback to analyze",
          description: "Add some feedback first before generating insights.",
          variant: "destructive",
        });
        setGenerating(false);
        return;
      }

      // Call the AI edge function
      const { data, error } = await supabase.functions.invoke('generate-insight', {
        body: { feedback: feedbackData },
      });

      if (error) throw error;

      // Save the insight
      const { error: insertError } = await supabase.from('insights').insert({
        user_id: user.id,
        title: data.title,
        summary: data.summary,
        key_themes: data.key_themes,
        sentiment: data.sentiment,
        action_items: data.action_items,
        feedback_count: feedbackData.length,
      });

      if (insertError) throw insertError;

      toast({
        title: "Insight generated!",
        description: "AI has analyzed your feedback and created a new insight.",
      });

      fetchData();
    } catch (error) {
      console.error('Error generating insight:', error);
      toast({
        title: "Error",
        description: "Failed to generate insight. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const deleteInsight = async (id: string) => {
    try {
      const { error } = await supabase.from('insights').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Insight deleted",
        description: "The insight has been removed.",
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting insight:', error);
      toast({
        title: "Error",
        description: "Failed to delete insight.",
        variant: "destructive",
      });
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'negative':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <TrendingUp className="h-5 w-5 text-info" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-success/10 text-success border-success/20';
      case 'negative':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-info/10 text-info border-info/20';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered analysis of your user feedback
            </p>
          </div>
          <Button
            onClick={generateInsight}
            disabled={generating || feedbackCount === 0}
            className="gradient-primary"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate New Insight
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Insights
              </CardTitle>
              <Lightbulb className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{insights.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Generated by AI</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Feedback Analyzed
              </CardTitle>
              <MessageSquare className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{feedbackCount}</div>
              <p className="text-sm text-muted-foreground mt-1">Available for analysis</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                AI Model
              </CardTitle>
              <Sparkles className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Gemini Flash</div>
              <p className="text-sm text-muted-foreground mt-1">Powered by Google AI</p>
            </CardContent>
          </Card>
        </div>

        {/* Insights List */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Insights</CardTitle>
            <CardDescription>
              AI-generated summaries and action items from your feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-1">No insights yet</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {feedbackCount === 0
                    ? "Add some feedback first, then generate AI-powered insights"
                    : "Click the button above to generate your first AI insight from your feedback"}
                </p>
                {feedbackCount > 0 && (
                  <Button onClick={generateInsight} disabled={generating}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Insight
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getSentimentIcon(insight.sentiment)}
                        <div>
                          <h3 className="text-lg font-semibold">{insight.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={getSentimentColor(insight.sentiment)}
                            >
                              {insight.sentiment}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Based on {insight.feedback_count} feedback items
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteInsight(insight.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-muted-foreground mb-4">{insight.summary}</p>

                    {insight.key_themes && insight.key_themes.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Key Themes</h4>
                        <div className="flex flex-wrap gap-2">
                          {insight.key_themes.map((theme, idx) => (
                            <Badge key={idx} variant="secondary">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {insight.action_items && insight.action_items.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Action Items</h4>
                        <ul className="space-y-2">
                          {insight.action_items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Generated on {format(new Date(insight.created_at), 'MMMM d, yyyy at h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
