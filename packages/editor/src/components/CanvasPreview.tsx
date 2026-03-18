import {
  forwardRef,
  useMemo,
  useRef,
  type ForwardedRef,
  type MutableRefObject,
  type PointerEvent,
} from 'react';
import { useRugStore } from '../store/useRugStore';
import './CanvasPreview.css';

interface CanvasPreviewProps {
  className?: string;
}

interface DragState {
  textId: string;
  offsetX: number;
  offsetY: number;
}

function setMergedRef(
  node: HTMLCanvasElement | null,
  externalRef: ForwardedRef<HTMLCanvasElement>,
  localRef: MutableRefObject<HTMLCanvasElement | null>
) {
  localRef.current = node;
  if (typeof externalRef === 'function') {
    externalRef(node);
  } else if (externalRef) {
    externalRef.current = node;
  }
}

const CanvasPreview = forwardRef<HTMLCanvasElement, CanvasPreviewProps>(
  ({ className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const dragRef = useRef<DragState | null>(null);

    const config = useRugStore((state) => state.config);
    const selectText = useRugStore((state) => state.selectText);
    const updateText = useRugStore((state) => state.updateText);
    const clearBoundaryWarning = useRugStore((state) => state.clearBoundaryWarning);

    const safetyMarginPreviewPx = useMemo(() => {
      const ratio = config.production.exportDPI / config.production.weaveDPI;
      return Math.round(config.size.safetyMarginPx / ratio);
    }, [config.production.exportDPI, config.production.weaveDPI, config.size.safetyMarginPx]);

    const toCanvasPoint = (event: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    };

    const measureText = (text: (typeof config.texts)[number]) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) {
        const letterSpacing = text.letterSpacing || 0;
        return {
          width:
            text.content.length * text.size * 0.55 +
            Math.max(0, text.content.length - 1) * letterSpacing,
          height: text.size,
        };
      }

      ctx.save();
      ctx.font = `${text.size}px ${text.font}`;
      const baseWidth = ctx.measureText(text.content).width;
      ctx.restore();
      return {
        width:
          baseWidth +
          Math.max(0, text.content.length - 1) * (text.letterSpacing || 0),
        height: text.size,
      };
    };

    const hitTest = (x: number, y: number) => {
      for (let i = config.texts.length - 1; i >= 0; i--) {
        const text = config.texts[i];
        const box = measureText(text);
        if (
          x >= text.position.x &&
          x <= text.position.x + box.width &&
          y >= text.position.y &&
          y <= text.position.y + box.height
        ) {
          return { text, box };
        }
      }
      return null;
    };

    const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
      const point = toCanvasPoint(event);
      if (!point) return;

      clearBoundaryWarning();
      const hit = hitTest(point.x, point.y);
      if (!hit) {
        selectText(null);
        dragRef.current = null;
        return;
      }

      selectText(hit.text.id);
      dragRef.current = {
        textId: hit.text.id,
        offsetX: point.x - hit.text.position.x,
        offsetY: point.y - hit.text.position.y,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
      const dragging = dragRef.current;
      if (!dragging) return;

      const point = toCanvasPoint(event);
      if (!point) return;

      updateText(dragging.textId, {
        position: {
          x: point.x - dragging.offsetX,
          y: point.y - dragging.offsetY,
        },
      });
    };

    const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    };

    return (
      <div className={`canvas-preview ${className}`}>
        <div className="canvas-container">
          <canvas
            ref={(node) => setMergedRef(node, ref, canvasRef)}
            className="rug-canvas"
            width={510}
            height={582}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>
        <div className="canvas-info">
          <span>
            安全边界: 2cm (预览约 {safetyMarginPreviewPx}px)。
            可拖拽文字，系统会自动拦截越界。
          </span>
        </div>
      </div>
    );
  }
);

CanvasPreview.displayName = 'CanvasPreview';

export default CanvasPreview;
