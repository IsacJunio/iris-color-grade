@echo off
TITLE Iris Builder - v2.6.1
chcp 65001 >nul 2>&1

REM ==========================================
REM  NAVEGAR PARA O DIRETORIO DO SCRIPT
REM ==========================================
cd /d "%~dp0"
rem Create site folder structure
if not exist "site\public\downloads" mkdir "site\public\downloads"

rem Change to aplicativo folder for build
cd "aplicativo"

ECHO ==========================================
ECHO      Construindo IRIS (Color Grade Pro)
ECHO        Versao 2.7.0 - AI Revolution
ECHO ==========================================
ECHO.
ECHO Diretorio: %cd%
ECHO Data/Hora: %date% %time%
ECHO.

ECHO 1. Verificando permissoes de administrador...
net session >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    ECHO    [OK] Executando como Administrador
) ELSE (
    ECHO    [AVISO] Nao esta como Administrador, mas continuando...
)

ECHO.
ECHO 2. Limpando cache problematico do electron-builder...
IF EXIST "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" (
    rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" 2>nul
    ECHO    Cache winCodeSign limpo.
) ELSE (
    ECHO    Cache ja estava limpo.
)

ECHO.
ECHO 3. Encerrando processos do Iris (se estiverem rodando)...
taskkill /F /IM "Iris.exe" 2>nul
taskkill /F /IM "iris-app.exe" 2>nul
ECHO    Processos verificados.

ECHO.
ECHO 4. Limpando versoes anteriores...
IF EXIST "dist" (
    rmdir /s /q "dist" 2>nul
    IF EXIST "dist" (
        ECHO    [AVISO] Pasta dist ainda em uso. Aguardando 3 segundos...
        timeout /t 3 /nobreak >nul
        rmdir /s /q "dist" 2>nul
    )
    ECHO    Pasta dist removida.
)
IF EXIST "dist-electron" (
    rmdir /s /q "dist-electron" 2>nul
    ECHO    Pasta dist-electron removida.
)
ECHO    Limpeza concluida.

ECHO.
ECHO 5. Verificando node_modules...
IF NOT EXIST "node_modules" (
    ECHO    [AVISO] node_modules nao encontrado. Instalando dependencias...
    call npm install
    IF %ERRORLEVEL% NEQ 0 (
        ECHO [ERRO] Falha ao instalar dependencias.
        PAUSE
        EXIT /B 1
    )
)
ECHO    [OK] Dependencias verificadas.

ECHO.
ECHO 6. Verificando arquivos do sistema...
IF NOT EXIST "src\components\masks\ProfessionalMaskPanel.tsx" (
    ECHO    [AVISO] ProfessionalMaskPanel.tsx nao encontrado
) ELSE (
    ECHO    [OK] Painel de Mascaras Profissionais
)
IF NOT EXIST "src\utils\MaskProcessor.ts" (
    ECHO    [AVISO] MaskProcessor.ts nao encontrado
) ELSE (
    ECHO    [OK] Motor de Processamento de Mascaras
)
IF NOT EXIST "src\components\canvas\MaskCanvasOverlay.tsx" (
    ECHO    [AVISO] MaskCanvasOverlay.tsx nao encontrado
) ELSE (
    ECHO    [OK] Canvas Overlay Zero Delay
)
IF NOT EXIST "src\components\layout\MainLayout.tsx" (
    ECHO    [AVISO] MainLayout.tsx nao encontrado
) ELSE (
    ECHO    [OK] Layout Estrutural v2.5
)

ECHO.
ECHO 7. Compilando TypeScript...
call npx tsc --noEmit 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO    [AVISO] Erros de tipo encontrados, tentando continuar...
)
call npx tsc
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERRO] Falha ao compilar TypeScript.
    PAUSE
    EXIT /B 1
)
ECHO    [OK] TypeScript compilado.

ECHO.
ECHO 8. Construindo com Vite...
call npx vite build
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERRO] Falha ao construir com Vite.
    PAUSE
    EXIT /B 1
)
ECHO    [OK] Vite build concluido.

ECHO.
ECHO 9. Compilando Electron TypeScript...
call npx tsc -p electron/tsconfig.json
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERRO] Falha ao compilar Electron.
    PAUSE
    EXIT /B 1
)
ECHO    [OK] Electron compilado.

ECHO.
ECHO 10. Empacotando aplicacao com Electron Builder...
ECHO    (Isso pode demorar alguns minutos, aguarde...)
ECHO.
call npx electron-builder --win -c.win.signAndEditExecutable=false
IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO [AVISO] Electron Builder retornou erro.
    ECHO         Verificando se o executavel foi criado mesmo assim...
)

ECHO.
ECHO 11. Verificando resultado...
ECHO.

SET "EXE_FOUND=0"

IF EXIST "dist\win-unpacked\Iris.exe" (
    SET "EXE_FOUND=1"
    SET "EXE_PATH=dist\win-unpacked\Iris.exe"
)

IF EXIST "dist\win-unpacked\iris-app.exe" (
    SET "EXE_FOUND=1"
    SET "EXE_PATH=dist\win-unpacked\iris-app.exe"
    ECHO    Renomeando iris-app.exe para Iris.exe...
    ren "dist\win-unpacked\iris-app.exe" "Iris.exe"
    SET "EXE_PATH=dist\win-unpacked\Iris.exe"
)

IF "%EXE_FOUND%"=="1" (
    ECHO.
    ECHO ==========================================
    ECHO  [SUCESSO] BUILD CONCLUIDO COM SUCESSO!
    ECHO ==========================================
    ECHO.
    ECHO  Aplicacao: Iris - Color Grade Pro v2.7.0
    rem Copy installer to site\downloads if exists
    REM Removed copy of portable executable to site\downloads (handled by installer copy)
    rem Copy installer to site/downloads if exists
    REM Removed redundant copy to site\downloads (handled by relative path above)
    ECHO.
    ECHO  === ARQUIVOS GERADOS ===
    ECHO.
    ECHO  [1] PASTA PORTATIL:
    ECHO      Localizacao: %cd%\dist\win-unpacked\
    ECHO      ^(Pasta com todos os arquivos^)
    ECHO.
    
    REM Verificar se o executável portátil único foi criado
    SET "PORTABLE_FOUND=0"
    FOR %%F IN ("dist\Iris 2.5.0.exe") DO (
        IF EXIST "%%F" (
            SET "PORTABLE_FOUND=1"
            SET "PORTABLE_NAME=%%~nxF"
        )
    )
    FOR %%F IN ("dist\Iris*.exe") DO (
        IF NOT "%%~nxF"=="Iris Setup.exe" (
             IF NOT "%%~nxF"=="Iris Setup*.exe" (
                 SET "PORTABLE_FOUND=1"
                 SET "PORTABLE_NAME=%%~nxF"
             )
        )
    )
    
    IF "%PORTABLE_FOUND%"=="1" (
        ECHO  [2] EXECUTAVEL PORTATIL:
        ECHO      Arquivo: %PORTABLE_NAME%
        ECHO      Localizacao: %cd%\dist\
        ECHO      ^(Arquivo unico, nao requer instalacao^)
        ECHO.
    )
    
    REM Check if setup file exists and capture name
    SET "SETUP_NAME="
    FOR %%F IN ("dist\Iris Setup*.exe") DO SET "SETUP_NAME=%%~nxF"

    IF DEFINED SETUP_NAME (
        ECHO  [3] INSTALADOR SETUP:
        ECHO      Arquivo: %SETUP_NAME%
        ECHO      Localizacao: %cd%\dist\
        ECHO      ^(Instalador para distribuicao^)
        ECHO.
        
        rem Call subroutine to handle copy safely outside of block context
        CALL :COPY_INSTALLER
    )
    
    ECHO  === RECURSOS v2.7.0 ===
    ECHO.
    ECHO  [REVOLUTION] AI Auto Grade:
    ECHO    - Integracao com Google Gemini, OpenAI e Hugging Face
    ECHO    - Geracao automatica de color grading via prompt de texto
    ECHO    - Modo Offline Inteligente (Fallback Smart) quando sem internet
    ECHO.
    ECHO  === RECURSOS v2.6.1 ===
    ECHO.
    ECHO  [NOVO] Node Renaming:
    ECHO    - Edicao direta de nome dos nos com duplo clique
    ECHO    - Sincronizacao automatica com painel de camadas
    ECHO.
    ECHO  === RECURSOS v2.6.0 ===
    ECHO.
    ECHO  [NOVO] Export Image:
    ECHO    - Botao para exportar a imagem final em alta resolucao (PNG)
    ECHO.
    ECHO  [NOVO] Split View Compare:
    ECHO    - Slider interativo para comparar Antes/Depois (Original vs Processada)
    ECHO.
    ECHO  [FIX MATEMATICO] Color Mask Logic (v2.5.9):
    ECHO    - Correcao do algoritmo de mascara de cor
    ECHO.
    ECHO  [FIX CRITICO 2.5.8] Color Sampler:
    ECHO    - Clicar na imagem agora salva CORRETAMENTE a cor amostrada
    ECHO.
    ECHO  [REFATORACAO] Mask System UX:
    ECHO    - Sliders de Mascara agora atualizam em TEMPO REAL (sem travar)
    ECHO    - Aviso visual para selecionar cor na Mascara de Cor
    ECHO    - Correcao de delay na resposta dos controles
    ECHO.
    ECHO  [FIX 2.5.6] UX & Input Fixes:
    ECHO    - Correcao no Input de salvar Preset
    ECHO    - Auto-selecao de camada ao adicionar
    ECHO.
    ECHO  [v2.5.5] Mask System Fix:
    ECHO    - FIX CRITICO: Mascaras geometricas agora funcionam!
    ECHO    - Integracao completa do MaskProcessor no pipeline
    ECHO.
    ECHO  [v2.5.4] Image Processing Fix:
    ECHO    - FIX CRITICO: Controles primarios globais funcionais
    ECHO    - Pipeline otimizado: Exposure -> Contrast -> Saturation 200%%
    ECHO      * Saturacao ^(Saturation^) - 0 a 200%%
    ECHO      * Temperatura ^(Temperature^) - -100 a +100
    ECHO    - Processamento completo em imageProcessor.service.ts
    ECHO    - Pipeline otimizado: Exposure -> Contrast -> Saturation -> Temp -> Balance
    ECHO.
    ECHO  [v2.5.3] Stable Build:
    ECHO    - Hidden Canvas Fix: Renderizacao de imagem agora funcional
    ECHO    - Deep Merge Fix: Controles de cor e efeitos totalmente funcionais
    ECHO    - Todas funcionalidades testadas e operacionais
    ECHO.
    ECHO  [v2.5.2] Critical Fixes:
    ECHO    - Renderizacao de Imagem: Canvas sizing + debug logs
    ECHO    - Controles de Cor Completos: RGB sliders + Primarios restaurados
    ECHO    - NodeGraph: Botao exclusao + remocao de botao mascara
    ECHO.
    ECHO  [v2.5.1] Final Polish:
    ECHO    - Fluxo Interativo: Botoes rapidos (Cor, Curvas, Efeitos)
    ECHO    - Painel Esquerdo Dinamico: Controles de Efeitos
    ECHO.
    ECHO  [v2.5.0] Pro Layout:
    ECHO    - NodeGraph (Fluxo) dockable na base (Toggleable)
    ECHO    - Painel Direito Unificado: Abas (Mascaras / Presets)
    ECHO.
    ECHO  Abrindo pasta de saida...
    start "" "dist"
) ELSE (
    IF EXIST "dist\win-unpacked" (
        ECHO [INFO] Pasta win-unpacked existe. Arquivos encontrados:
        dir "dist\win-unpacked\*.exe" /b 2>nul
        IF %ERRORLEVEL% NEQ 0 (
            ECHO    Nenhum .exe encontrado na pasta.
        )
        ECHO.
        ECHO Abrindo pasta para verificacao...
        start "" "dist\win-unpacked"
    ) ELSE (
        ECHO.
        ECHO ==========================================
        ECHO  [ERRO] FALHA AO CRIAR EXECUTAVEL
        ECHO ==========================================
        ECHO.
        ECHO  Possiveis solucoes:
        ECHO  1. Verifique se ha erros acima
        ECHO  2. Tente: npm run build
        ECHO  3. Execute como Administrador
        ECHO.
    )
)

ECHO.
ECHO ==========================================
ECHO  Build v2.6.1 Finalizado
rem End of build script
ECHO  Pressione qualquer tecla para fechar
ECHO  Pressione qualquer tecla para fechar
ECHO ==========================================
PAUSE >nul
EXIT /B

:COPY_INSTALLER
ECHO    -----------------------------------------
ECHO    [PROCESSAMENTO DE ARQUIVO]
ECHO    -----------------------------------------
ECHO    1. Verificando pasta de destino: site\public\downloads
if not exist "..\site\public\downloads" (
    mkdir "..\site\public\downloads"
    ECHO       - Pasta criada.
) else (
    ECHO       - Pasta ja existe.
)

ECHO    2. Removendo versoes antigas...
if exist "..\site\public\downloads\*.exe" (
    del /q "..\site\public\downloads\*.exe"
    ECHO       - Arquivos antigos removidos.
) else (
    ECHO       - Pasta ja estava limpa.
)

ECHO    3. Copiando: %SETUP_NAME%
ECHO       Destino: ..\site\public\downloads\Iris-Setup.exe
copy /y "dist\%SETUP_NAME%" "..\site\public\downloads\Iris-Setup.exe" >nul

IF %ERRORLEVEL% EQU 0 (
    ECHO       [SUCESSO] Arquivo copiado e pronto!
) ELSE (
    ECHO       [ERRO] Falha na copia. Verifique permissoes.
)
ECHO.
GOTO :EOF
