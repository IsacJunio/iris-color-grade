# 🏗️ Arquitetura do Color Grade Pro

## 📋 Visão Geral

Este documento descreve a arquitetura profissional do **Color Grade Pro**, um aplicativo Electron para edição de imagens com foco em color grading.

---

## 🎯 Princípios Arquiteturais

1. **Separação de Responsabilidades**: Cada módulo tem uma responsabilidade única e bem definida
2. **Context-driven State**: Estado global gerenciado por Contexts React
3. **Component Composition**: Componentes pequenos, focados e reutilizáveis
4. **Type Safety**: TypeScript em todo o código
5. **Performance-first**: Web Workers para processamento pesado, Offscreen Canvas

---

## 📁 Estrutura de Pastas

```
src/
├── assets/              # Recursos estáticos
├── components/          # Componentes React organizados por domínio
│   ├── canvas/         # Componentes de canvas
│   ├── color-tools/    # Ferramentas de cor (ColorWheel, Curves, etc)
│   ├── masks/          # Sistema de máscaras
│   ├── panels/         # Painéis de UI (Layer, Presets, Settings)
│   ├── presets/        # Galeria de presets
│   ├── workflow/       # Node Graph
│   └── ui/             # Componentes base reutilizáveis
├── contexts/            # React Contexts (Estado Global)
│   ├── ImageContext    # Estado da imagem
│   ├── LayerContext    # Gerenciamento de camadas
│   └── MaskContext     # Gerenciamento de máscaras
├── hooks/              # Custom Hooks
├── services/           # Lógica de negócio
│   ├── image/         # Processamento de imagem
│   ├── mask/          # Operações de máscara
│   ├── preset/        # Gerenciamento de presets
│   └── export/        # Exportação de imagens
├── workers/            # Web Workers
├── types/              # TypeScript types
├── utils/              # Funções utilitárias
├── constants/          # Constantes da aplicação
└── styles/             # Estilos globais e temas
```

---

## 🔄 Fluxo de Dados

### **1. Carregamento de Imagem**

```
User selects file
    ↓
ImageContext.loadImage()
    ↓
Creates Full Resolution + Preview
    ↓
Stores in ImageContext state
    ↓
Canvas components render
```

### **2. Aplicação de Ajustes**

```
User adjusts sliders/curves
    ↓
LayerContext updates layer
    ↓
useImageProcessing hook triggered
    ↓
ImageProcessor service processes
    ↓
Updates processedImageData
    ↓
Canvas re-renders with new data
```

### **3. Sistema de Máscaras**

```
User creates mask
    ↓
MaskContext.addMaskLayer()
    ↓
MaskProcessor generates mask
    ↓
Applies to specific layer
    ↓
processAllMaskLayers combines all
    ↓
Final composite rendered
```

---

## 🎨 Contexts (Estado Global)

### **ImageContext**

- **Responsabilidade**: Gerenciar estado da imagem
- **Estado**: imageSrc, originalImageData, processedImageData, fullResImageData
- **Ações**: loadImage, resetImage, setZoom

### **LayerContext**

- **Responsabilidade**: Gerenciar camadas de ajustes
- **Estado**: layers[], selectedLayerId
- **Ações**: addLayer, removeLayer, updateLayer, reorderLayers

### **MaskContext**

- **Responsabilidade**: Gerenciar máscaras profissionais
- **Estado**: maskLayers[], selectedMaskLayerId, showMaskOverlay
- **Ações**: addMaskLayer, removeMaskLayer, updateMaskLayer

---

## 🧩 Componentes Principais

### **Canvas Components**

- `MaskCanvasOverlay`: Overlay para desenho de máscaras

### **Color Tools**

- `ColorWheel`: Seletor de cores HSL
- `RGBCurves`: Editor de curvas RGB
- `SimpleCurves`: Curvas simplificadas
- `Histogram`: Histograma da imagem

### **Masks**

- `MaskEditor`: Editor de máscaras básico
- `ProfessionalMaskPanel`: Painel completo de máscaras
- `SelectionTools`: Ferramentas de seleção

### **Panels**

- `LayerPanel`: Gerenciamento de camadas
- `CustomPresetsPanel`: Presets customizados
- `SettingsModal`: Configurações

---

## 🔧 Services (Lógica de Negócio)

### **Image Processing Service**

- Aplica ajustes de cor
- Processa curvas RGB
- Aplica color balance

### **Mask Processing Service**

- Gera máscaras por cor
- Aplica feathering
- Combina múltiplas máscaras

### **Preset Service**

- Salva/carrega presets
- Importa/exporta configurações
- Gerencia presets profissionais

---

## ⚡ Performance

### **Smart Preview System**

- Preview em baixa resolução (max 1280px) para edição
- Full resolution mantida em memória para export final
- Web Workers para processamento pesado (futuro)

### **Canvas Optimization**

- Offscreen Canvas para máscaras
- `willReadFrequently: true` para leituras frequentes
- RequestAnimationFrame para desenho suave

### **React Optimization**

- Contexts separados evitam re-renders desnecessários
- useCallback/useMemo para funções pesadas
- Lazy loading de componentes (futuro)

---

## 🧪 Testes (Futuro)

```
tests/
├── unit/
│   ├── services/       # Testes de lógica de negócio
│   ├── utils/          # Testes de funções utilitárias
│   └── hooks/          # Testes de hooks
├── integration/
│   └── components/     # Testes de integração
└── e2e/
    └── app.spec.ts     # Testes end-to-end
```

---

## 🚀 Próximas Melhorias

1. **Web Workers**: Mover processamento pesado para workers
2. **Undo/Redo**: Sistema de histórico de ações
3. **Lazy Loading**: Carregar componentes sob demanda
4. **Testes Automatizados**: Cobertura completa
5. **Documentação de API**: Comentários JSDoc em todos os services

---

## 📚 Referências

- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [Electron Performance](https://www.electronjs.org/docs/latest/tutorial/performance)
- [Canvas Optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)

---

**Última atualização**: 2026-01-04  
**Versão**: 2.0.0 (Refatoração Profissional)
