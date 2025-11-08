'use client';

import { useState, useEffect } from 'react';
import { PortfolioData, portfolioData as defaultData } from '@/data/portfolio-data';

export const usePortfolioData = () => {
  const [data, setData] = useState<PortfolioData>(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In the future, this could fetch from your database
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call to your database
      // const response = await fetch('/api/portfolio-data');
      // const portfolioData = await response.json();
      // setData(portfolioData);
      
      // For now, use the static data
      setData(defaultData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  // Update data (for future admin panel)
  const updateData = async (newData: Partial<PortfolioData>) => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/portfolio-data', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newData)
      // });
      
      setData(prevData => ({ ...prevData, ...newData }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    error,
    reload: loadData,
    update: updateData,
  };
};

// Specific hooks for different data sections
export const usePersonalInfo = () => {
  const { data } = usePortfolioData();
  return data.personal;
};

export const useProjects = (category?: string) => {
  const { data } = usePortfolioData();
  return category 
    ? data.projects.filter(p => p.category === category)
    : data.projects;
};

export const useSkills = (category?: string) => {
  const { data } = usePortfolioData();
  return category 
    ? data.skills.filter(s => s.category === category)
    : data.skills;
};

export const useExperience = () => {
  const { data } = usePortfolioData();
  return data.experience.sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
};

export const useEducation = () => {
  const { data } = usePortfolioData();
  return data.education.sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
};

export const useTestimonials = () => {
  const { data } = usePortfolioData();
  return data.testimonials;
};

export const useBlogPosts = (featured?: boolean) => {
  const { data } = usePortfolioData();
  return featured 
    ? data.blog.filter(post => post.featured && post.status === 'published')
    : data.blog.filter(post => post.status === 'published');
};

export const useContactInfo = () => {
  const { data } = usePortfolioData();
  return data.contact;
};

export const useSocialLinks = () => {
  const { data } = usePortfolioData();
  return data.social;
};
