import { useState } from 'react';
import type { ColorOption, FontOption, TextElement } from '@shared/types';
import { useRugStore } from '../store/useRugStore';
import './TextEditor.css';

interface TextEditorProps {
  fonts: FontOption[];
  colorOptions: ColorOption[];
}

function TextEditor({ fonts, colorOptions }: TextEditorProps) {
  const texts = useRugStore((state) => state.config.texts);
  const selectedTextId = useRugStore((state) => state.selectedTextId);
  const addText = useRugStore((state) => state.addText);
  const updateText = useRugStore((state) => state.updateText);
  const deleteText = useRugStore((state) => state.deleteText);
  const selectText = useRugStore((state) => state.selectText);

  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const selectedText = texts.find((item) => item.id === selectedTextId);

  const defaultFont = fonts[0]?.value || "'Playfair Display', serif";
  const defaultColor = colorOptions[1]?.value || '#1A1A1A';

  const handleAddText = () => {
    if (!newText.trim()) return;

    addText({
      content: newText.trim(),
      font: defaultFont,
      size: 38,
      color: defaultColor,
      letterSpacing: 0,
      position: { x: 120, y: 120 },
      rotation: 0,
    });

    setNewText('');
    setIsAdding(false);
  };

  const handleUpdateText = (updates: Partial<TextElement>) => {
    if (!selectedTextId) return;
    updateText(selectedTextId, updates);
  };

  return (
    <div className="control-panel text-editor">
      <div className="panel-header">
        <h2>文字编辑</h2>
        <button
          className="btn-add"
          onClick={() => setIsAdding((prev) => !prev)}
          aria-label="添加文字"
        >
          {isAdding ? '取消' : '+ 添加'}
        </button>
      </div>

      {isAdding && (
        <div className="add-text-form">
          <input
            type="text"
            value={newText}
            onChange={(event) => setNewText(event.target.value)}
            placeholder="输入文字内容..."
            className="text-input"
            maxLength={50}
          />
          <button
            className="btn btn-primary btn-small"
            onClick={handleAddText}
            disabled={!newText.trim()}
          >
            确定
          </button>
        </div>
      )}

      {texts.length === 0 && !isAdding && (
        <p className="empty-hint">暂无文字，点击"添加"创建。可直接在画布拖拽排版。</p>
      )}

      {texts.length > 0 && (
        <div className="text-list">
          {texts.map((text) => (
            <div
              key={text.id}
              className={`text-item ${text.id === selectedTextId ? 'selected' : ''}`}
              onClick={() => selectText(text.id)}
            >
              <span className="text-preview">{text.content}</span>
              <button
                className="btn-delete"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteText(text.id);
                }}
                aria-label="删除文字"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedText && (
        <div className="text-properties">
          <h3>文字属性</h3>

          <div className="property-group">
            <label>内容</label>
            <input
              type="text"
              value={selectedText.content}
              onChange={(event) => handleUpdateText({ content: event.target.value })}
              className="text-input"
            />
          </div>

          <div className="property-group">
            <label>字体</label>
            <select
              value={selectedText.font}
              onChange={(event) => handleUpdateText({ font: event.target.value })}
              className="select-input"
            >
              {fonts.map((font) => (
                <option key={font.id} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div className="property-group">
            <label>字号: {selectedText.size}px</label>
            <input
              type="range"
              min="16"
              max="140"
              value={selectedText.size}
              onChange={(event) =>
                handleUpdateText({ size: parseInt(event.target.value, 10) })
              }
              className="range-input"
            />
          </div>

          <div className="property-group">
            <label>字间距: {Math.round(selectedText.letterSpacing || 0)}px</label>
            <input
              type="range"
              min="-8"
              max="40"
              value={selectedText.letterSpacing || 0}
              onChange={(event) =>
                handleUpdateText({
                  letterSpacing: parseInt(event.target.value, 10),
                })
              }
              className="range-input"
            />
          </div>

          <div className="property-group">
            <label>颜色</label>
            <div className="color-grid">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  className={`color-button ${selectedText.color === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleUpdateText({ color: color.value })}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="property-group">
            <label>旋转: {Math.round(selectedText.rotation || 0)}°</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={selectedText.rotation || 0}
              onChange={(event) =>
                handleUpdateText({ rotation: parseInt(event.target.value, 10) })
              }
              className="range-input"
            />
          </div>

          <div className="property-group">
            <label>位置</label>
            <div className="position-inputs">
              <div>
                <span>X:</span>
                <input
                  type="number"
                  value={Math.round(selectedText.position.x)}
                  onChange={(event) =>
                    handleUpdateText({
                      position: {
                        ...selectedText.position,
                        x: Number(event.target.value) || 0,
                      },
                    })
                  }
                  className="number-input"
                />
              </div>
              <div>
                <span>Y:</span>
                <input
                  type="number"
                  value={Math.round(selectedText.position.y)}
                  onChange={(event) =>
                    handleUpdateText({
                      position: {
                        ...selectedText.position,
                        y: Number(event.target.value) || 0,
                      },
                    })
                  }
                  className="number-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TextEditor;
