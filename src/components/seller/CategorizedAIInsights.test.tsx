import { render } from '@testing-library/react';
import CategorizedAIInsights from './CategorizedAIInsights';

describe('CategorizedAIInsights', () => {
  describe('Severity Badge Color Consistency', () => {
    it('renders with correct severity badge colors', () => {
      const { container } = render(<CategorizedAIInsights />);
      
      // Get all severity badges
      const badges = container.querySelectorAll('[class*="bg-red-50"], [class*="bg-amber-50"], [class*="bg-blue-50"]');
      
      expect(badges.length).toBeGreaterThan(0);
    });

    it('uses red colors for high severity (bg-red-50 text-red-700 border-red-200)', () => {
      const { container } = render(<CategorizedAIInsights />);
      
      // Find high severity badge - SKU #104
      const highSeverityBadge = Array.from(container.querySelectorAll('span')).find(
        span => span.textContent?.includes('High Priority Alert')
      );
      
      expect(highSeverityBadge).toBeTruthy();
      expect(highSeverityBadge?.className).toContain('bg-red-50');
      expect(highSeverityBadge?.className).toContain('text-red-700');
      expect(highSeverityBadge?.className).toContain('border-red-200');
    });

    it('uses amber colors for medium severity (bg-amber-50 text-amber-800 border-amber-200)', () => {
      const { container } = render(<CategorizedAIInsights />);
      
      // Find medium severity badge
      const mediumSeverityBadge = Array.from(container.querySelectorAll('span')).find(
        span => span.textContent?.includes('Medium Alert')
      );
      
      expect(mediumSeverityBadge).toBeTruthy();
      expect(mediumSeverityBadge?.className).toContain('bg-amber-50');
      expect(mediumSeverityBadge?.className).toContain('text-amber-800');
      expect(mediumSeverityBadge?.className).toContain('border-amber-200');
    });

    it('uses blue colors for optimization/info (bg-blue-50 text-blue-700 border-blue-200)', () => {
      const { container } = render(<CategorizedAIInsights />);
      
      // Find optimization severity badge - SKU #209
      const optimizationBadge = Array.from(container.querySelectorAll('span')).find(
        span => span.textContent?.includes('AI Optimization Active')
      );
      
      expect(optimizationBadge).toBeTruthy();
      expect(optimizationBadge?.className).toContain('bg-blue-50');
      expect(optimizationBadge?.className).toContain('text-blue-700');
      expect(optimizationBadge?.className).toContain('border-blue-200');
    });

    it('does NOT use emerald colors for optimization severity', () => {
      const { container } = render(<CategorizedAIInsights />);
      
      // Find optimization badge
      const optimizationBadge = Array.from(container.querySelectorAll('span')).find(
        span => span.textContent?.includes('AI Optimization Active')
      );
      
      expect(optimizationBadge).toBeTruthy();
      expect(optimizationBadge?.className).not.toContain('bg-emerald-50');
      expect(optimizationBadge?.className).not.toContain('text-emerald-700');
      expect(optimizationBadge?.className).not.toContain('border-emerald-200');
    });

    it('uses correct border hover colors for optimization cards (border-blue-200 hover:border-blue-300)', () => {
      const { container } = render(<CategorizedAIInsights />);
      
      // Find the optimization card (SKU #209)
      const cards = container.querySelectorAll('[class*="rounded-2xl"][class*="border"]');
      const optimizationCard = Array.from(cards).find(card => 
        card.textContent?.includes('Puma RS-X Retro Chunky Sneakers')
      );
      
      expect(optimizationCard).toBeTruthy();
      expect(optimizationCard?.className).toContain('border-blue-200');
      expect(optimizationCard?.className).toContain('hover:border-blue-300');
    });
  });
});
