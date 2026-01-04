import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LayerProvider, useLayer } from '../../../src/contexts/LayerContext';
import { ReactNode } from 'react';

// Wrapper para prover o contexto nos testes
const wrapper = ({ children }: { children: ReactNode }) => (
  <LayerProvider>{children}</LayerProvider>
);

describe('LayerContext Integration', () => {
  it('should initialize with a default layer', () => {
    const { result } = renderHook(() => useLayer(), { wrapper });
    
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0].type).toBe('cor');
    expect(result.current.selectedLayerId).toBe(result.current.layers[0].id);
  });

  it('should add a new layer correctly', () => {
    const { result } = renderHook(() => useLayer(), { wrapper });
    
    act(() => {
      result.current.addLayer('curvas');
    });

    expect(result.current.layers).toHaveLength(2);
    expect(result.current.layers[1].type).toBe('curvas');
  });

  it('should select a layer correctly', () => {
    const { result } = renderHook(() => useLayer(), { wrapper });
    
    act(() => {
      result.current.addLayer('efeitos');
    });

    const newLayerId = result.current.layers[1].id;

    act(() => {
      result.current.selectLayer(newLayerId);
    });

    expect(result.current.selectedLayerId).toBe(newLayerId);
  });

  it('should remove a layer correctly', () => {
    const { result } = renderHook(() => useLayer(), { wrapper });
    
    act(() => {
      result.current.addLayer('selecao');
    });
    
    const layerToRemoveId = result.current.layers[1].id;
    expect(result.current.layers).toHaveLength(2);

    act(() => {
      result.current.removeLayer(layerToRemoveId);
    });

    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers.find(l => l.id === layerToRemoveId)).toBeUndefined();
  });

  it('should not remove the last layer', () => {
    const { result } = renderHook(() => useLayer(), { wrapper });
    const lastLayerId = result.current.layers[0].id;

    act(() => {
      result.current.removeLayer(lastLayerId);
    });

    // Deve impedir a remoção da última camada
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0].id).toBe(lastLayerId);
  });

  it('should update layer properties', () => {
    const { result } = renderHook(() => useLayer(), { wrapper });
    const layerId = result.current.layers[0].id;

    act(() => {
      result.current.updateLayer(layerId, { opacity: 50, name: 'Updated Name' });
    });

    const updatedLayer = result.current.layers.find(l => l.id === layerId);
    expect(updatedLayer?.opacity).toBe(50);
    expect(updatedLayer?.name).toBe('Updated Name');
  });
});
