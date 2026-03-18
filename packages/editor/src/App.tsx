import { useEffect, useRef, useState } from 'react';
import type { RuntimeConfig } from '@shared/types';
import { createRenderer } from '@shared/canvas';
import {
  serializeConfig,
  copyToClipboard,
  FALLBACK_RUNTIME_CONFIG,
  loadRuntimeConfig,
} from '@shared/utils';
import { useRugStore } from './store/useRugStore';
import CanvasPreview from './components/CanvasPreview';
import PatternSelector from './components/PatternSelector';
import ColorPicker from './components/ColorPicker';
import TextEditor from './components/TextEditor';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createRenderer> | null>(null);

  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig>(
    FALLBACK_RUNTIME_CONFIG
  );
  const [generatedCode, setGeneratedCode] = useState('');
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  const config = useRugStore((state) => state.config);
  const showSafetyBoundary = useRugStore((state) => state.showSafetyBoundary);
  const boundaryWarning = useRugStore((state) => state.boundaryWarning);
  const initializeFromRuntime = useRugStore((state) => state.initializeFromRuntime);
  const setSize = useRugStore((state) => state.setSize);
  const toggleSafetyBoundary = useRugStore((state) => state.toggleSafetyBoundary);
  const reset = useRugStore((state) => state.reset);

  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = createRenderer(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    let disposed = false;

    const loadConfig = async () => {
      const loadedConfig = await loadRuntimeConfig('/config.json');
      if (disposed) return;

      setRuntimeConfig(loadedConfig);
      initializeFromRuntime(loadedConfig);
      setIsConfigLoaded(true);
    };

    void loadConfig();

    return () => {
      disposed = true;
    };
  }, [initializeFromRuntime]);

  useEffect(() => {
    if (rendererRef.current && canvasRef.current) {
      rendererRef.current.render(config, {
        dpiMode: 'weave',
        showSafetyBoundary,
        canvas: canvasRef.current,
      });
    }
  }, [config, showSafetyBoundary]);

  const handleGenerateCode = async () => {
    const code = serializeConfig(config);
    setGeneratedCode(code);

    const success = await copyToClipboard(code);
    if (success) {
      alert('配置代码已复制，请粘贴到 Etsy 订单备注。');
    } else {
      alert('自动复制失败，请手动复制下方配置代码。');
    }
  };

  const handleReset = () => {
    if (confirm('确定要重置当前设计吗？')) {
      reset();
      initializeFromRuntime(runtimeConfig);
      setGeneratedCode('');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="line-banner">
          <span className="line-pill">R</span>
          <span className="line-text">NYC SUBWAY STYLE · CUSTOMER DESIGN STATION</span>
        </div>
        <h1>地毯定制在线编辑器</h1>
        <p className="subtitle">流程：设计 → 校验安全区 → 生成代码（不提供文件下载）</p>
      </header>

      <main className="app-main">
        <section className="canvas-section">
          <div className="section-heading">
            <span className="section-code">W</span>
            <h2>工作区 / Work Area</h2>
          </div>

          <CanvasPreview ref={canvasRef} />

          <div className="canvas-actions">
            <button className="btn btn-primary" onClick={handleGenerateCode}>
              生成并复制配置代码
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              重置设计
            </button>
          </div>

          <div className="canvas-actions compact">
            <label className="switch">
              <input
                type="checkbox"
                checked={showSafetyBoundary}
                onChange={toggleSafetyBoundary}
              />
              <span>显示 2cm 安全虚线框</span>
            </label>
          </div>

          {showSafetyBoundary && (
            <div className="status-message status-warning">
              红色虚线框内为可打印区，四周 2cm 为不可打印边框。
            </div>
          )}

          {boundaryWarning && (
            <div className="status-message status-error">{boundaryWarning}</div>
          )}

          {generatedCode && (
            <div className="code-panel">
              <label htmlFor="generated-code">配置代码（提交给 Etsy 订单备注）</label>
              <textarea id="generated-code" value={generatedCode} readOnly />
            </div>
          )}
        </section>

        <section className="controls-section">
          <div className="section-heading">
            <span className="section-code">C</span>
            <h2>控制区 / Control Panel</h2>
          </div>

          <div className="control-panel size-panel">
            <h3>尺寸设定</h3>
            <select
              className="size-select"
              value={config.size.id}
              onChange={(event) => {
                const selected = runtimeConfig.sizes.find(
                  (item) => item.id === event.target.value
                );
                if (selected) {
                  setSize(selected);
                }
              }}
              disabled={!isConfigLoaded}
            >
              {runtimeConfig.sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </select>
            <p className="size-info">
              织机预览: {config.size.pixels25dpi.width} x {config.size.pixels25dpi.height}px
            </p>
          </div>

          <PatternSelector patterns={runtimeConfig.patterns} />
          <ColorPicker
            colorOptions={runtimeConfig.colorOptions}
            colorSchemes={runtimeConfig.colorSchemes}
          />
          <TextEditor
            fonts={runtimeConfig.fonts}
            colorOptions={runtimeConfig.colorOptions}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>CUSTOMER FLOW · DESIGN / VALIDATE / COPY CODE / ORDER NOTE</p>
      </footer>
    </div>
  );
}

export default App;
