import { supabaseAdmin } from './supabase';

// Analytics utility for tracking user interactions
export class PortfolioAnalytics {
  
  // Track page views
  static async trackPageView(
    page: string,
    sessionId?: string,
    userAgent?: string,
    ip?: string,
    referrer?: string
  ) {
    try {
      await supabaseAdmin
        .from('portfolio_views')
        .insert([{
          page,
          session_id: sessionId,
          user_agent: userAgent,
          ip,
          referrer
        }]);
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  // Track user interactions (portfolio interactions, clicks, etc.)
  static async trackInteraction(
    action: string,
    data?: any,
    sessionId?: string,
    userAgent?: string,
    ip?: string
  ) {
    try {
      await supabaseAdmin
        .from('interaction_logs')
        .insert([{
          action,
          data: data ? JSON.stringify(data) : null,
          session_id: sessionId,
          user_agent: userAgent,
          ip
        }]);
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }

  // Get contact submissions (for admin dashboard)
  static async getContactSubmissions(limit = 50) {
    try {
      const { data, error } = await supabaseAdmin
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get contact submissions:', error);
      return [];
    }
  }

  // Get analytics data
  static async getAnalyticsData(days = 30) {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      // Get page views
      const { data: pageViews, error: pageViewsError } = await supabaseAdmin
        .from('portfolio_views')
        .select('page, created_at')
        .gte('created_at', fromDate.toISOString());

      if (pageViewsError) throw pageViewsError;

      // Get interactions
      const { data: interactions, error: interactionsError } = await supabaseAdmin
        .from('interaction_logs')
        .select('action, created_at')
        .gte('created_at', fromDate.toISOString());

      if (interactionsError) throw interactionsError;

      // Get contact submissions
      const { data: contacts, error: contactsError } = await supabaseAdmin
        .from('contact_submissions')
        .select('created_at, status')
        .gte('created_at', fromDate.toISOString());

      if (contactsError) throw contactsError;

      return {
        pageViews: pageViews || [],
        interactions: interactions || [],
        contacts: contacts || []
      };
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return {
        pageViews: [],
        interactions: [],
        contacts: []
      };
    }
  }

  // Mark contact as read
  static async markContactAsRead(id: number) {
    try {
      const { error } = await supabaseAdmin
        .from('contact_submissions')
        .update({ status: 'read' })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to mark contact as read:', error);
      return false;
    }
  }
}
