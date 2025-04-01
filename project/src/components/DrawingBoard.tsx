import React, { useRef, useEffect, useState } from 'react';
import { toPng } from 'html-to-image';

interface DrawingBoardProps {
  tool: string;
  color: string;
  size: number;
  fillShape: boolean;
}

export const DrawingBoard: React.FC<DrawingBoardProps> = ({ tool, color, size, fillShape }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempImageData, setTempImageData] = useState<ImageData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const scale = window.devicePixelRatio;
      const width = container.clientWidth;
      const height = container.clientHeight;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(height * scale);

      context.scale(scale, scale);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;

      // Only save initial state if canvas has valid dimensions
      if (canvas.width > 0 && canvas.height > 0) {
        const initialState = context.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialState]);
        setHistoryIndex(0);
      }
    };

    // Initial size update
    updateCanvasSize();

    // Handle window resize
    const handleResize = () => {
      requestAnimationFrame(updateCanvasSize);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const saveState = () => {
    if (!contextRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const currentState = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const canvas = canvasRef.current;
      if (!canvas || !contextRef.current) return;
      contextRef.current.putImageData(history[newIndex], 0, 0);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const canvas = canvasRef.current;
      if (!canvas || !contextRef.current) return;
      contextRef.current.putImageData(history[newIndex], 0, 0);
    }
  };

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setIsDrawing(true);
    setStartPos({ x, y });

    if (tool === 'brush' || tool === 'eraser') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
    } else {
      // Save the current canvas state for shape preview
      setTempImageData(contextRef.current.getImageData(0, 0, canvas.width, canvas.height));
    }
  };

  const drawShape = (context: CanvasRenderingContext2D, shape: string, x: number, y: number) => {
    context.beginPath();
    switch (shape) {
      case 'square':
        const size = Math.abs(x - startPos.x);
        context.rect(startPos.x, startPos.y, size, size);
        break;
      case 'rectangle':
        context.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        context.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        break;
      case 'triangle':
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(x, y);
        context.lineTo(startPos.x - (x - startPos.x), y);
        context.closePath();
        break;
      case 'pentagon':
        const sides = 5;
        const radius2 = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        context.moveTo(startPos.x + radius2 * Math.cos(0), startPos.y + radius2 * Math.sin(0));
        for (let i = 1; i <= sides; i++) {
          const angle = (i * 2 * Math.PI) / sides;
          context.lineTo(
            startPos.x + radius2 * Math.cos(angle),
            startPos.y + radius2 * Math.sin(angle)
          );
        }
        context.closePath();
        break;
      case 'hexagon':
        const sides2 = 6;
        const radius3 = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        context.moveTo(startPos.x + radius3 * Math.cos(0), startPos.y + radius3 * Math.sin(0));
        for (let i = 1; i <= sides2; i++) {
          const angle = (i * 2 * Math.PI) / sides2;
          context.lineTo(
            startPos.x + radius3 * Math.cos(angle),
            startPos.y + radius3 * Math.sin(angle)
          );
        }
        context.closePath();
        break;
      case 'arrow':
        const angle = Math.atan2(y - startPos.y, x - startPos.x);
        const length = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        const headLength = Math.min(length * 0.3, 20);
        const headAngle = Math.PI / 6;

        // Draw the main line
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(x, y);

        // Draw the arrowhead
        context.moveTo(x, y);
        context.lineTo(
          x - headLength * Math.cos(angle - headAngle),
          y - headLength * Math.sin(angle - headAngle)
        );
        context.moveTo(x, y);
        context.lineTo(
          x - headLength * Math.cos(angle + headAngle),
          y - headLength * Math.sin(angle + headAngle)
        );
        break;
      case 'line':
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(x, y);
        break;
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const context = contextRef.current;
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    context.fillStyle = color;
    context.lineWidth = size;

    if (tool === 'brush' || tool === 'eraser') {
      context.lineTo(x, y);
      context.stroke();
    } else if (tempImageData) {
      // Restore the canvas state before drawing the preview
      context.putImageData(tempImageData, 0, 0);
      drawShape(context, tool, x, y);
      
      if (fillShape) {
        context.fill();
      }
      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (contextRef.current) {
        contextRef.current.closePath();
        if (tool !== 'brush' && tool !== 'eraser') {
          // Save the final shape to history
          saveState();
        } else {
          saveState();
        }
      }
      setTempImageData(null);
    }
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveState();
  };

  const saveCanvas = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current);
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error saving canvas:', err);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[600px] bg-white rounded-lg border border-gray-200">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-full cursor-crosshair"
      />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Redo
        </button>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={saveCanvas}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};
