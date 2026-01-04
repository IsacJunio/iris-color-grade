# Changelog - Color Grade Pro (Iris)

## [2.6.0] - 2026-01-04

### ✨ New Features

- **EXPORT**: Adicionado botão para exportar a imagem final processada (PNG de alta qualidade).
- **COMPARE SLIDER**: Nova ferramenta de comparação (Split View) que permite deslizar uma linha sobre a imagem para ver o "Antes" e "Depois" em tempo real.

---

## [2.5.9] - 2026-01-04

### 📐 Math Logic Fixes

- **COLOR MASK ALGORITHM**: Reescrito o algoritmo de geração de máscara por cor. Agora ele calcula corretamente a distância para a cor amostrada mais próxima, resolvendo problemas de máscaras invertidas ou imprecisas que ocorriam devido a centros de cor estáticos desatualizados.

---

## [2.5.8] - 2026-01-04

### 🚑 Critical Fixes

- **COLOR PICKER**: A seleção de cor na imagem (clique) agora é efetivamente salva na máscara. Anteriormente, apenas registrava no log sem ação.
- **Máscara de Cor**: Agora exibe corretamente as cores selecionadas e aplica o efeito.

---

## [2.5.7] - 2026-01-04

### 🔄 Refatoração e UX (Mask System)

- **REFATORAÇÃO**: Sliders de ajuste de máscara agora são atualizados em **tempo real** durante o arrasto, corrigindo a sensação de "travamento" ou "não funciona".
- **UX**: Adicionado aviso visual em "Máscara de Cor" quando nenhuma cor foi selecionada, orientando o usuário.
- **Performance**: Otimização do debounce no pipeline principal permite atualizações mais fluidas.

---

## [2.5.6] - 2026-01-04

### 🛠️ UX Improvements & Bug Fixes

- **FIX**: Corrigido bug onde o input de nome do Preset travava e não permitia digitação (Event Bubbling)
- **UX**: Novas camadas agora são **selecionadas automaticamente** ao serem adicionadas
  - Isso resolve a confusão de "adicionei o efeito mas os controles não apareceram"
- **Stability**: Melhoria na gestão de foco da UI

---

## [2.5.5] - 2026-01-04

### 🐛 Correções Críticas (Mask System)

- **FIX CRÍTICO**: Máscaras Geométricas e Locais agora funcionam
  - **Integração do Motor**: `MaskProcessor` conectado ao `ImageProcessorService`
  - **Novos Tipos**: Suporte total para Máscaras Circulares, Elípticas, Retangulares e Brush
  - **Pipeline Completo**: Camadas Globais + Ajustes Locais via Máscara
  - **Adjustments**: Hue, Saturation, Exposure locais aplicados apenas na área mascarada

### 🔧 Alterações Técnicas

- Atualizado `imageProcessor.service.ts` para receber `maskLayers`
- Injeção de dependência no hook `useImageProcessing`
- Métodos `processMask` e `applyLocalAdjustments` ativados no pipeline principal

---

## [2.5.4] - 2026-01-04

### 🐛 Correções Críticas

- **FIX CRÍTICO**: Controles primários de cor agora funcionais
  - **Exposição** (Exposure): 50-150% - Controle multiplicativo de brilho
  - **Contraste** (Contrast): 0-200% - Ajuste em torno do ponto médio
  - **Saturação** (Saturation): 0-200% - Interpolação entre grayscale e cores
  - **Temperatura** (Temperature): -100 a +100 - Shift de cores quentes/frias

### 🔧 Alterações Técnicas

- Refatorado `imageProcessor.service.ts`:
  - Pipeline de processamento otimizado: Exposure → Contrast → Saturation → Temperature → Color Balance
  - Método `applyColorLayer()` agora processa todos os ajustes corretamente
  - Processamento em ordem para melhor resultado visual

### 📝 Detalhes da Correção

O bug estava no serviço de processamento de imagem que aplicava apenas os ajustes de Color Balance (Shadows/Midtones/Highlights), mas ignorava completamente os controles primários. Agora todos os controles funcionam em tempo real.

---

## [2.5.3] - 2026-01-03

### ✅ Build Estável

- Hidden Canvas Fix: Renderização de imagem agora funcional
- Deep Merge Fix: Todos os controles de cor e efeitos operacionais
- Todas funcionalidades testadas e validadas

---

## [2.5.2] - 2026-01-03

### 🔧 Correções Críticas

- Canvas sizing corrigido com logs de debug
- Controles de cor completos: RGB sliders + Primários restaurados
- NodeGraph: Botão de exclusão adicionado + botão de máscara removido

---

## [2.5.1] - 2026-01-02

### ✨ Polimento Final

- Fluxo interativo com botões rápidos (Cor, Curvas, Efeitos)
- Painel esquerdo dinâmico com controles de efeitos

---

## [2.5.0] - 2026-01-02

### 🎨 Layout Profissional

- NodeGraph (Fluxo) dockable na base (toggleable)
- Painel direito unificado com abas (Máscaras / Presets)
- Interface reorganizada para workflow profissional

---

## [2.4.0] - 2025-12-30

### 🎭 Máscaras Profissionais

- Sistema de máscaras completo
- Overlay canvas com zero delay
- Processador de máscaras otimizado

---

**Desenvolvido com 💜 por Iris Team**
