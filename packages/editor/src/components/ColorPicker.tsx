import type { ColorOption, ColorScheme } from '@shared/types';
import { useRugStore } from '../store/useRugStore';
import './ColorPicker.css';

interface ColorPickerProps {
  colorOptions: ColorOption[];
  colorSchemes: ColorScheme[];
}

function ColorPicker({ colorOptions, colorSchemes }: ColorPickerProps) {
  const colors = useRugStore((state) => state.config.colors);
  const setBackgroundColor = useRugStore((state) => state.setBackgroundColor);
  const setPrimaryColor = useRugStore((state) => state.setPrimaryColor);
  const setSecondaryColor = useRugStore((state) => state.setSecondaryColor);

  return (
    <div className="control-panel color-picker">
      <h2>配色方案</h2>

      <div className="scheme-list">
        {colorSchemes.map((scheme) => (
          <button
            key={scheme.id}
            className="scheme-item"
            onClick={() => {
              setBackgroundColor(scheme.background);
              setPrimaryColor(scheme.primary);
              setSecondaryColor(scheme.secondary);
            }}
            title={scheme.name}
          >
            <span>{scheme.name}</span>
            <div className="scheme-swatches">
              <i style={{ backgroundColor: scheme.background }} />
              <i style={{ backgroundColor: scheme.primary }} />
              <i style={{ backgroundColor: scheme.secondary || scheme.primary }} />
            </div>
          </button>
        ))}
      </div>

      <div className="color-section">
        <label>背景区</label>
        <div className="color-grid">
          {colorOptions.map((color) => (
            <button
              key={`bg-${color.id}`}
              className={`color-button ${colors.background === color.value ? 'selected' : ''}`}
              style={{ backgroundColor: color.value }}
              onClick={() => setBackgroundColor(color.value)}
              title={color.name}
              aria-label={`选择 ${color.name} 作为背景色`}
            />
          ))}
        </div>
      </div>

      <div className="color-section">
        <label>图案主区</label>
        <div className="color-grid">
          {colorOptions.map((color) => (
            <button
              key={`primary-${color.id}`}
              className={`color-button ${colors.primary === color.value ? 'selected' : ''}`}
              style={{ backgroundColor: color.value }}
              onClick={() => setPrimaryColor(color.value)}
              title={color.name}
              aria-label={`选择 ${color.name} 作为主色`}
            />
          ))}
        </div>
      </div>

      <div className="color-section">
        <label>图案辅区（可选）</label>
        <div className="color-grid">
          <button
            className={`color-button clear-button ${!colors.secondary ? 'selected' : ''}`}
            onClick={() => setSecondaryColor(undefined)}
            title="不使用辅色"
          >
            无
          </button>
          {colorOptions.map((color) => (
            <button
              key={`secondary-${color.id}`}
              className={`color-button ${colors.secondary === color.value ? 'selected' : ''}`}
              style={{ backgroundColor: color.value }}
              onClick={() => setSecondaryColor(color.value)}
              title={color.name}
              aria-label={`选择 ${color.name} 作为辅色`}
            />
          ))}
        </div>
      </div>

      <div className="color-preview">
        <div className="preview-box" style={{ backgroundColor: colors.background }} title="背景色预览" />
        <div className="preview-box" style={{ backgroundColor: colors.primary }} title="主色预览" />
        <div
          className="preview-box"
          style={{ backgroundColor: colors.secondary || 'transparent' }}
          title="辅色预览"
        />
      </div>
    </div>
  );
}

export default ColorPicker;
