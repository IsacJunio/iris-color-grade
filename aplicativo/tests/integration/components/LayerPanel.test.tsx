import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayerPanel } from '../../../src/components/panels/LayerPanel';
import { LayerProvider } from '../../../src/contexts/LayerContext';

// Mock do Lucide React para evitar problemas de renderização de SVG no JSDOM
vi.mock('lucide-react', () => ({
  Eye: () => <span data-testid="icon-eye">Eye</span>,
  EyeOff: () => <span data-testid="icon-eye-off">EyeOff</span>,
  Trash2: () => <span data-testid="icon-trash">Trash</span>,
  ChevronUp: () => <span>Up</span>,
  ChevronDown: () => <span>Down</span>,
  Plus: () => <span>Plus</span>,
  Palette: () => <span>Palette</span>,
  TrendingUp: () => <span>Trending</span>,
  Sparkles: () => <span>Sparkles</span>,
  MousePointer2: () => <span>Mouse</span>,
}));

describe('LayerPanel Component', () => {
  it('should render the layer list', () => {
    render(
      <LayerProvider>
        <LayerPanel />
      </LayerProvider>
    );

    // Deve mostrar o header
    expect(screen.getByText('Camadas')).toBeInTheDocument();
    
    // Deve mostrar a camada inicial
    expect(screen.getByText('Cor Principal')).toBeInTheDocument();
  });

  it('should toggle layer visibility', () => {
    render(
      <LayerProvider>
        <LayerPanel />
      </LayerProvider>
    );

    const toggleBtn = screen.getByTestId('icon-eye').parentElement;
    expect(toggleBtn).toBeInTheDocument();

    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('icon-eye-off')).toBeInTheDocument();
    }
  });
});
