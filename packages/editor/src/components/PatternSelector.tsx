import type { Pattern } from '@shared/types';
import { useRugStore } from '../store/useRugStore';
import './PatternSelector.css';

interface PatternSelectorProps {
  patterns: Pattern[];
}

function PatternSelector({ patterns }: PatternSelectorProps) {
  const pattern = useRugStore((state) => state.config.pattern);
  const setPattern = useRugStore((state) => state.setPattern);
  const setPatternScale = useRugStore((state) => state.setPatternScale);
  const setPatternPosition = useRugStore((state) => state.setPatternPosition);

  return (
    <div className="control-panel pattern-selector">
      <h2>选择图案</h2>

      <div className="pattern-grid">
        {patterns.map((patternItem) => (
          <button
            key={patternItem.id}
            className={`pattern-item ${pattern.id === patternItem.id ? 'selected' : ''}`}
            onClick={() => setPattern(patternItem.id)}
            title={patternItem.name}
          >
            <div className="pattern-thumbnail">
              <div className="pattern-placeholder">{patternItem.name.slice(0, 1)}</div>
            </div>
            <span className="pattern-name">{patternItem.name}</span>
          </button>
        ))}
      </div>

      <div className="scale-control">
        <label htmlFor="pattern-scale">图案缩放: {pattern.scale.toFixed(1)}x</label>
        <input
          id="pattern-scale"
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={pattern.scale}
          onChange={(e) => setPatternScale(parseFloat(e.target.value))}
        />
      </div>

      <div className="position-control">
        <label htmlFor="pattern-offset-x">图案水平偏移: {Math.round(pattern.position.x)} px</label>
        <input
          id="pattern-offset-x"
          type="range"
          min="-200"
          max="200"
          step="1"
          value={pattern.position.x}
          onChange={(e) =>
            setPatternPosition({
              ...pattern.position,
              x: parseInt(e.target.value, 10),
            })
          }
        />
      </div>

      <div className="position-control">
        <label htmlFor="pattern-offset-y">图案垂直偏移: {Math.round(pattern.position.y)} px</label>
        <input
          id="pattern-offset-y"
          type="range"
          min="-200"
          max="200"
          step="1"
          value={pattern.position.y}
          onChange={(e) =>
            setPatternPosition({
              ...pattern.position,
              y: parseInt(e.target.value, 10),
            })
          }
        />
      </div>
    </div>
  );
}

export default PatternSelector;
