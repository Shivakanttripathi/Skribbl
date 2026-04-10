import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Socket } from 'socket.io-client';
import { DrawData } from '../types'; 

interface CanvasProps {
  socket: Socket;
  isDrawing: boolean;
  onClear?: () => void;
}

export interface CanvasHandle {
  clear: () => void;
  undo: () => void;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(({ socket, isDrawing }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('#ffffff');
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  
  // Undo history
  const historyRef = useRef<ImageData[]>([]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        socket.emit('clear_canvas');
      }
    },
    undo: () => {
      // Basic undo implementation could be here
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      setCtx(context);
    }

    const handleRemoteDraw = (data: DrawData) => {
      if (!context) return;
      context.strokeStyle = data.tool === 'eraser' ? '#1e293b' : data.color;
      context.lineWidth = data.size;
      context.beginPath();
      context.moveTo(data.prevX, data.prevY);
      context.lineTo(data.x, data.y);
      context.stroke();
    };

    const handleRemoteClear = () => {
      if (context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    socket.on('draw_data', handleRemoteDraw);
    socket.on('clear_canvas', handleRemoteClear);

    return () => {
      socket.off('draw_data', handleRemoteDraw);
      socket.off('clear_canvas', handleRemoteClear);
    };
  }, [socket]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    setIsMousePressed(true);
    const pos = getCoordinates(e);
    setPrevPos(pos);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isMousePressed || !ctx) return;
    
    const pos = getCoordinates(e);
    const drawData: DrawData = {
      x: pos.x,
      y: pos.y,
      prevX: prevPos.x,
      prevY: prevPos.y,
      color: color,
      size: size,
      tool: tool
    };

    ctx.strokeStyle = tool === 'eraser' ? '#1e293b' : color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(prevPos.x, prevPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    socket.emit('draw_data', drawData);
    setPrevPos(pos);
  };

  const endDrawing = () => {
    setIsMousePressed(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full relative">
      {isDrawing && (
        <div className="absolute top-4 left-4 z-10 flex gap-2 glass p-2 rounded-lg">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 border-none bg-transparent cursor-pointer"
          />
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs">Size</span>
            <input 
              type="range" min="1" max="50" 
              value={size} 
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
          <button 
            onClick={() => setTool('brush')}
            className={`px-3 py-1 rounded ${tool === 'brush' ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            Brush
          </button>
          <button 
            onClick={() => setTool('eraser')}
            className={`px-3 py-1 rounded ${tool === 'eraser' ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            Eraser
          </button>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        className="w-full h-full bg-[#1e293b] rounded-xl cursor-crosshair touch-none overflow-hidden"
      />
    </div>
  );
});

export default Canvas;
