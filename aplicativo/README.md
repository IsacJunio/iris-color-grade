# 🎨 Color Grade Pro (Iris)

![Version](https://img.shields.io/badge/version-2.5.4-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)

**Professional Color Grading Suite** - Software profissional de correção de cor e gradação para fotógrafos, editores de vídeo e profissionais criativos.

---

## 🚀 Recursos Principais

### 🎨 Correção de Cor Profissional

- **Controles Primários**

  - ✅ Exposição (50-150%)
  - ✅ Contraste (0-200%)
  - ✅ Saturação (0-200%)
  - ✅ Temperatura (-100 a +100)

- **Color Balance Tripartido**
  - 🌑 **Shadows** (Sombras) - Ajuste fino RGB
  - 🌓 **Midtones** (Médios) - Ajuste fino RGB
  - 🌕 **Highlights** (Luzes) - Ajuste fino RGB

### 📊 Curvas RGB

- Curvas independentes: RGB Master, R, G, B
- Interface profissional com grade visual
- Controle preciso ponto a ponto

### ✨ Efeitos de Pós-Produção

- **Granulação** (Film Grain)
- **Vinheta** (Vignette)
- **Desfoque** (Blur)

### 🎭 Sistema de Máscaras Profissionais

- Máscaras por cor (HSL)
- Máscaras geométricas (Retângulo, Elipse)
- Máscaras com brush
- Overlay visual em tempo real (zero delay)

### 🔄 Fluxo de Trabalho Não-Destrutivo

- **NodeGraph** interativo (toggleable)
- Camadas empilháveis
- Presets customizáveis
- Processamento em tempo real

---

## 🖥️ Requisitos do Sistema

- **SO**: Windows 10/11 (64-bit)
- **RAM**: 4GB mínimo, 8GB recomendado
- **Processador**: Intel i3 ou equivalente
- **GPU**: Opcional (processamento CPU otimizado)

---

## 📦 Instalação

### Opção 1: Executável Portátil

1. Baixe o arquivo `Iris 2.5.4.exe`
2. Execute diretamente - não requer instalação

### Opção 2: Instalador

1. Baixe o `Iris Setup 2.5.4.exe`
2. Execute o instalador
3. Siga as instruções na tela

### Opção 3: Build a partir do código

```bash
# Instalar dependências
npm install

# Executar em modo dev
npm run dev

# Build de produção
npm run build

# Ou usar o script automatizado
build_executable.bat
```

---

## 🎯 Como Usar

### 1. Abrir Imagem

- Clique em **"Open Image"** ou arraste uma imagem para a área central

### 2. Ajustar Cores

- Use o **painel esquerdo** para ajustes de cor
- Alterne entre **Lift/Gamma/Gain** (Shadows/Midtones/Highlights)
- Ajuste sliders RGB para controle fino
- Modifique **Exposição, Contraste, Saturação, Temperatura**

### 3. Aplicar Curvas

- Adicione camada de **Curvas** no fluxo
- Ajuste curvas RGB individualmente
- Veja resultado em tempo real

### 4. Adicionar Efeitos

- Adicione camada de **Efeitos**
- Configure Grain, Vignette, Blur

### 5. Trabalhar com Máscaras

- Use o **painel direito** (aba Máscaras)
- Crie máscaras por cor ou geométricas
- Ajuste seletivamente áreas da imagem

### 6. Salvar Preset

- Configure seus ajustes favoritos
- Salve como preset customizado
- Reutilize em outras imagens

---

## 🛠️ Arquitetura Técnica

### Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Build**: Vite 5
- **Desktop**: Electron 29
- **Processamento**: Canvas API (CPU-based)
- **UI Components**: Lucide React icons

### Estrutura de Camadas

```
ImageContext  ──┐
LayerContext  ──┼──► useImageProcessing ──► ImageProcessorService
MaskContext   ──┘                               │
                                                ↓
                                         Canvas Rendering
```

### Pipeline de Processamento

```
Original Image
    ↓
[1] Exposure (multiplicativo)
    ↓
[2] Contrast (ponto médio 128)
    ↓
[3] Saturation (interpolação)
    ↓
[4] Temperature (shift R/B)
    ↓
[5] Color Balance (Shadows/Mid/Highlights)
    ↓
[6] Opacity Blend
    ↓
Processed Image
```

---

## 📝 Changelog

### [2.5.4] - 2026-01-04

- ✅ **FIX CRÍTICO**: Controles primários agora funcionais
- 🔧 Pipeline de processamento otimizado
- 📊 Todos os ajustes aplicados corretamente

[Ver changelog completo](CHANGELOG.md)

---

## 🐛 Problemas Conhecidos

Nenhum problema crítico conhecido na versão atual.

Para reportar bugs, entre em contato com a equipe de desenvolvimento.

---

## 🤝 Contribuindo

Este é um projeto proprietário. Para sugestões ou melhorias, entre em contato com a Iris Team.

---

## 📄 Licença

MIT License - Copyright (c) 2026 Iris Team

---

## 👥 Créditos

Desenvolvido com 💜 pela **Iris Team**

**Color Grade Pro** - Professional Grading Suite
