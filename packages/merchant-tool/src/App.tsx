import { useEffect, useRef, useState } from 'react';
import type { RugConfig, RuntimeConfig } from '@shared/types';
import type { PCXEncodeReport } from '@shared/pcx';
import { createRenderer } from '@shared/canvas';
import {
  deserializeConfig,
  pasteFromClipboard,
  FALLBACK_RUNTIME_CONFIG,
  loadRuntimeConfig,
} from '@shared/utils';
import { exportCanvasToPCXWithReport, downloadPCX } from '@shared/pcx';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createRenderer> | null>(null);

  const [configCode, setConfigCode] = useState('');
  const [config, setConfig] = useState<RugConfig | null>(null);
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig>(
    FALLBACK_RUNTIME_CONFIG
  );
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [lastReport, setLastReport] = useState<PCXEncodeReport | null>(null);
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = createRenderer(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    let disposed = false;

    const loadConfigFile = async () => {
      const loaded = await loadRuntimeConfig('/config.json');
      if (!disposed) {
        setRuntimeConfig(loaded);
      }
    };

    void loadConfigFile();
    return () => {
      disposed = true;
    };
  }, []);

  const renderPreview = (nextConfig: RugConfig) => {
    if (!rendererRef.current || !canvasRef.current) return;
    rendererRef.current.render(nextConfig, {
      dpiMode: 'weave',
      showSafetyBoundary: false,
      canvas: canvasRef.current,
    });
  };

  const handlePaste = async () => {
    const text = await pasteFromClipboard();
    if (!text) {
      setError('剪贴板为空或浏览器不允许读取');
      return;
    }

    setConfigCode(text);
    parseConfig(text);
  };

  const parseConfig = (code: string) => {
    setError('');
    setLastReport(null);
    setParseStatus('idle');
    const parsed = deserializeConfig(code);

    if (!parsed) {
      setError('配置代码无效，请确认复制完整。');
      setParseStatus('error');
      setConfig(null);
      return;
    }

    setConfig(parsed);
    setParseStatus('success');
    renderPreview(parsed);
  };

  const handleExportPCX = async () => {
    if (!config || !canvasRef.current || !rendererRef.current) return;

    setIsExporting(true);
    try {
      rendererRef.current.render(config, {
        dpiMode: 'weave',
        showSafetyBoundary: false,
        canvas: canvasRef.current,
      });

      const { blob, report } = await exportCanvasToPCXWithReport(canvasRef.current, {
        hDpi: config.production.weaveDPI,
        vDpi: config.production.weaveDPI,
        maxColors: 12,
        alphaThreshold: 112,
        solidifyEdges: true,
        matteColor: [255, 255, 255],
      });

      if (report.outputColorCount > 12) {
        throw new Error(`颜色数量超限：${report.outputColorCount} > 12`);
      }

      setLastReport(report);
      downloadPCX(blob, `rug-design-${Date.now()}-25dpi-12c.pcx`);

      renderPreview(config);
      setError('');
    } catch (err) {
      console.error('PCX export failed:', err);
      setError('导出失败：请确认颜色数量、图案边缘与配置代码是否有效。');
    } finally {
      setIsExporting(false);
    }
  };

  const patternName =
    config &&
    runtimeConfig.patterns.find((item) => item.id === config.pattern.id)?.name;

  return (
    <div className="app">
      <header className="header">
        <div className="line-banner">
          <span className="line-pill">X</span>
          <span className="line-text">NYC SUBWAY STYLE · PRODUCTION CONTROL</span>
        </div>
        <h1>商家离线生产工具</h1>
        <p className="subtitle">流程：Parse → Validate → Preview → Export</p>
      </header>

      <main className="main">
        <section className="input-section">
          <div className="section-heading">
            <span className="section-code">P</span>
            <h2>解析区 / Parse</h2>
          </div>

          <div className="input-group">
            <label htmlFor="config-code">配置代码</label>
            <textarea
              id="config-code"
              className="code-textarea"
              placeholder="粘贴客户提供的 Base64 配置代码..."
              value={configCode}
              onChange={(event) => setConfigCode(event.target.value)}
            />
          </div>

          <div className="button-group">
            <button className="btn btn-secondary" onClick={handlePaste}>
              从剪贴板粘贴
            </button>
            <button
              className="btn btn-primary"
              onClick={() => parseConfig(configCode)}
              disabled={!configCode.trim()}
            >
              解析配置
            </button>
          </div>

          {parseStatus === 'success' && (
            <div className="status-message status-success">
              配置解析成功，可进入生产校验与导出。
            </div>
          )}

          {parseStatus === 'error' && (
            <div className="status-message status-error">配置解析失败，请检查代码完整性。</div>
          )}

          {error && <div className="status-message status-error">{error}</div>}

          {config && (
            <div className="config-info validation-panel">
              <div className="section-heading compact">
                <span className="section-code">V</span>
                <h3>生产校验 / Validate</h3>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">尺寸:</span>
                  <span className="value">
                    {config.size.widthCm} x {config.size.heightCm} cm
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">材质:</span>
                  <span className="value">{config.production.materialType}</span>
                </div>
                <div className="info-item">
                  <span className="label">图案:</span>
                  <span className="value">{patternName || config.pattern.id || '未选择'}</span>
                </div>
                <div className="info-item">
                  <span className="label">文字数量:</span>
                  <span className="value">{config.texts.length}</span>
                </div>
                <div className="info-item">
                  <span className="label">生产 DPI:</span>
                  <span className="value">{config.production.weaveDPI}</span>
                </div>
                <div className="info-item">
                  <span className="label">颜色上限:</span>
                  <span className="value">12</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="preview-section">
          <div className="section-heading">
            <span className="section-code">R</span>
            <h2>预览区 / Preview</h2>
          </div>

          <div className="canvas-container">
            <canvas ref={canvasRef} className="preview-canvas" width={510} height={582} />
            {!config && <div className="placeholder">解析配置后显示生产预览</div>}
          </div>

          {config && (
            <div className="export-actions console-export">
              <div className="section-heading compact">
                <span className="section-code">E</span>
                <h3>导出区 / Export</h3>
              </div>
              <button
                className="btn btn-export"
                onClick={handleExportPCX}
                disabled={isExporting}
              >
                {isExporting ? '导出中...' : '导出 PCX 文件 (25 DPI / ≤12色)'}
              </button>
            </div>
          )}

          {lastReport && (
            <div className="config-info report-panel">
              <div className="status-message status-success">
                导出完成：符合工厂约束（25 DPI，≤12 色）。
              </div>
              <h3>导出报告</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">原始颜色桶:</span>
                  <span className="value">{lastReport.sourceColorCount}</span>
                </div>
                <div className="info-item">
                  <span className="label">导出颜色数:</span>
                  <span className="value">{lastReport.outputColorCount}</span>
                </div>
                <div className="info-item">
                  <span className="label">导出像素:</span>
                  <span className="value">
                    {lastReport.width} x {lastReport.height}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">头部 DPI:</span>
                  <span className="value">{lastReport.dpi.h}</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>PRODUCTION ONLY · FACTORY OUTPUT MODE ENABLED</p>
      </footer>
    </div>
  );
}

export default App;
