import { useEffect, useRef, useState } from "react";
import { Pen, Eraser, Square, Circle, Minus, ArrowRight, Type, Trash2, Hand, Move } from "lucide-react";

function DiagramCanvas({ questionId, onAnswerChange }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState("pen");
    const [color, setColor] = useState("#000000");
    const [lineWidth, setLineWidth] = useState(2);
    const [startPos, setStartPos] = useState(null);
    const [tempCanvas, setTempCanvas] = useState(null);
    const [text, setText] = useState("");
    const [textPos, setTextPos] = useState(null);
    const [showTextInput, setShowTextInput] = useState(false);
    
    // Selection state
    const [selection, setSelection] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [moveStart, setMoveStart] = useState(null);
    const [shapes, setShapes] = useState([]);
    const [selectedShapeId, setSelectedShapeId] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || canvas.dataset.initialized) return;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Create temporary canvas for shape preview
        const temp = document.createElement("canvas");
        temp.width = canvas.width;
        temp.height = canvas.height;
        setTempCanvas(temp);

        canvas.dataset.initialized = "true";
    }, []);

    const getCanvasCoordinates = (canvas, e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const saveCanvasState = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataURL = canvas.toDataURL();
            onAnswerChange(questionId, dataURL);
        }
    };

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        
        // Clear canvas
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Redraw all shapes
        shapes.forEach(shape => {
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = shape.lineWidth;
            ctx.fillStyle = shape.color;

            if (shape.type === "pen") {
                ctx.beginPath();
                shape.points.forEach((point, index) => {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.stroke();
            } else if (shape.type === "square") {
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                ctx.beginPath();
                ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (shape.type === "line") {
                ctx.beginPath();
                ctx.moveTo(shape.x1, shape.y1);
                ctx.lineTo(shape.x2, shape.y2);
                ctx.stroke();
            } else if (shape.type === "arrow") {
                drawArrow(ctx, shape.x1, shape.y1, shape.x2, shape.y2);
            } else if (shape.type === "text") {
                ctx.fillStyle = shape.color;
                ctx.font = `${shape.lineWidth * 8}px Arial`;
                ctx.fillText(shape.text, shape.x, shape.y);
            }
        });

        // Draw selection rectangle if a shape is selected
        if (selectedShapeId) {
            const shape = shapes.find(s => s.id === selectedShapeId);
            if (shape) {
                drawSelection(ctx, shape);
            }
        }
    };

    const drawSelection = (ctx, shape) => {
        let bounds;
        
        if (shape.type === "pen") {
            bounds = getFreehandBounds(shape.points);
        } else if (shape.type === "square") {
            bounds = {
                x: shape.x - 5,
                y: shape.y - 5,
                width: shape.width + 10,
                height: shape.height + 10
            };
        } else if (shape.type === "circle") {
            bounds = {
                x: shape.x - shape.radius - 5,
                y: shape.y - shape.radius - 5,
                width: (shape.radius * 2) + 10,
                height: (shape.radius * 2) + 10
            };
        } else if (shape.type === "line" || shape.type === "arrow") {
            const minX = Math.min(shape.x1, shape.x2);
            const minY = Math.min(shape.y1, shape.y2);
            const maxX = Math.max(shape.x1, shape.x2);
            const maxY = Math.max(shape.y1, shape.y2);
            bounds = {
                x: minX - 5,
                y: minY - 5,
                width: (maxX - minX) + 10,
                height: (maxY - minY) + 10
            };
        } else if (shape.type === "text") {
            ctx.font = `${shape.lineWidth * 8}px Arial`;
            const metrics = ctx.measureText(shape.text);
            bounds = {
                x: shape.x - 5,
                y: shape.y - metrics.actualBoundingBoxAscent - 5,
                width: metrics.width + 10,
                height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 10
            };
        }

        if (bounds) {
            ctx.strokeStyle = "#5c8374";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            ctx.setLineDash([]);
        }
    };

    const getFreehandBounds = (points) => {
        if (points.length === 0) return null;
        
        let minX = points[0].x;
        let minY = points[0].y;
        let maxX = points[0].x;
        let maxY = points[0].y;

        points.forEach(point => {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        });

        return {
            x: minX - 5,
            y: minY - 5,
            width: (maxX - minX) + 10,
            height: (maxY - minY) + 10
        };
    };

    const findShapeAtPoint = (x, y) => {
        // Check shapes in reverse order (most recent first)
        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            let bounds;

            if (shape.type === "pen") {
                bounds = getFreehandBounds(shape.points);
            } else if (shape.type === "square") {
                bounds = {
                    x: shape.x,
                    y: shape.y,
                    width: shape.width,
                    height: shape.height
                };
            } else if (shape.type === "circle") {
                const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
                if (distance <= shape.radius) return shape;
                continue;
            } else if (shape.type === "line" || shape.type === "arrow") {
                // Simple line hit detection
                const distance = pointToLineDistance(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
                if (distance < 10) return shape;
                continue;
            } else if (shape.type === "text") {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                ctx.font = `${shape.lineWidth * 8}px Arial`;
                const metrics = ctx.measureText(shape.text);
                bounds = {
                    x: shape.x,
                    y: shape.y - metrics.actualBoundingBoxAscent,
                    width: metrics.width,
                    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
                };
            }

            if (bounds && 
                x >= bounds.x && 
                x <= bounds.x + bounds.width && 
                y >= bounds.y && 
                y <= bounds.y + bounds.height) {
                return shape;
            }
        }
        return null;
    };

    const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasCoordinates(canvas, e);

        // Handle selection/move tool
        if (tool === "select") {
            const shape = findShapeAtPoint(x, y);
            if (shape) {
                setSelectedShapeId(shape.id);
                setIsMoving(true);
                setMoveStart({ x, y, shapeX: getShapePosition(shape).x, shapeY: getShapePosition(shape).y });
            } else {
                setSelectedShapeId(null);
            }
            return;
        }

        // Handle text tool
        if (tool === "text") {
            setTextPos({ x, y });
            setShowTextInput(true);
            return;
        }

        setIsDrawing(true);
        setStartPos({ x, y });

        // Start new shape
        if (tool === "pen") {
            const newShape = {
                id: Date.now().toString(),
                type: "pen",
                points: [{ x, y }],
                color,
                lineWidth
            };
            setShapes(prev => [...prev, newShape]);
        }
    };

    const getShapePosition = (shape) => {
        switch (shape.type) {
            case "square":
                return { x: shape.x, y: shape.y };
            case "circle":
                return { x: shape.x, y: shape.y };
            case "line":
            case "arrow":
                return { 
                    x: (shape.x1 + shape.x2) / 2, 
                    y: (shape.y1 + shape.y2) / 2 
                };
            case "text":
                return { x: shape.x, y: shape.y };
            case "pen":
                const bounds = getFreehandBounds(shape.points);
                return bounds ? { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 } : { x: 0, y: 0 };
            default:
                return { x: 0, y: 0 };
        }
    };

    const draw = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const { x, y } = getCanvasCoordinates(canvas, e);

        // Handle moving selected shape
        if (tool === "select" && isMoving && moveStart && selectedShapeId) {
            const dx = x - moveStart.x;
            const dy = y - moveStart.y;
            
            setShapes(prev => prev.map(shape => {
                if (shape.id === selectedShapeId) {
                    return moveShape(shape, dx, dy);
                }
                return shape;
            }));

            setMoveStart(prev => ({ ...prev, x, y }));
            redrawCanvas();
            return;
        }

        if (!isDrawing) return;

        // Clear and redraw
        redrawCanvas();

        // Draw current shape in progress
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.fillStyle = color;

        if (tool === "pen") {
            // Add point to current pen shape
            setShapes(prev => {
                const updated = [...prev];
                const currentShape = updated[updated.length - 1];
                if (currentShape && currentShape.type === "pen") {
                    currentShape.points.push({ x, y });
                }
                return updated;
            });
        } else if (tool === "eraser") {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            setStartPos({ x, y });
        } else if (["square", "circle", "line", "arrow"].includes(tool)) {
            const width = x - startPos.x;
            const height = y - startPos.y;

            if (tool === "square") {
                ctx.strokeRect(startPos.x, startPos.y, width, height);
            } else if (tool === "circle") {
                const radius = Math.sqrt(width * width + height * height);
                ctx.beginPath();
                ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (tool === "line") {
                ctx.beginPath();
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if (tool === "arrow") {
                drawArrow(ctx, startPos.x, startPos.y, x, y);
            }
        }
    };

    const moveShape = (shape, dx, dy) => {
        switch (shape.type) {
            case "pen":
                return {
                    ...shape,
                    points: shape.points.map(point => ({
                        x: point.x + dx,
                        y: point.y + dy
                    }))
                };
            case "square":
                return {
                    ...shape,
                    x: shape.x + dx,
                    y: shape.y + dy
                };
            case "circle":
                return {
                    ...shape,
                    x: shape.x + dx,
                    y: shape.y + dy
                };
            case "line":
            case "arrow":
                return {
                    ...shape,
                    x1: shape.x1 + dx,
                    y1: shape.y1 + dy,
                    x2: shape.x2 + dx,
                    y2: shape.y2 + dy
                };
            case "text":
                return {
                    ...shape,
                    x: shape.x + dx,
                    y: shape.y + dy
                };
            default:
                return shape;
        }
    };

    const drawArrow = (ctx, fromX, fromY, toX, toY) => {
        const headLength = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    };

    const stopDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Handle selection/move tool
        if (tool === "select" && isMoving) {
            setIsMoving(false);
            setMoveStart(null);
            saveCanvasState();
            return;
        }

        if (!isDrawing) return;

        const { x, y } = getCanvasCoordinates(canvas, e);

        // Finalize the shape
        if (["square", "circle", "line", "arrow"].includes(tool)) {
            const width = x - startPos.x;
            const height = y - startPos.y;

            let newShape;
            
            if (tool === "square") {
                newShape = {
                    id: Date.now().toString(),
                    type: "square",
                    x: startPos.x,
                    y: startPos.y,
                    width,
                    height,
                    color,
                    lineWidth
                };
            } else if (tool === "circle") {
                newShape = {
                    id: Date.now().toString(),
                    type: "circle",
                    x: startPos.x,
                    y: startPos.y,
                    radius: Math.sqrt(width * width + height * height),
                    color,
                    lineWidth
                };
            } else if (tool === "line") {
                newShape = {
                    id: Date.now().toString(),
                    type: "line",
                    x1: startPos.x,
                    y1: startPos.y,
                    x2: x,
                    y2: y,
                    color,
                    lineWidth
                };
            } else if (tool === "arrow") {
                newShape = {
                    id: Date.now().toString(),
                    type: "arrow",
                    x1: startPos.x,
                    y1: startPos.y,
                    x2: x,
                    y2: y,
                    color,
                    lineWidth
                };
            }

            if (newShape) {
                setShapes(prev => [...prev, newShape]);
            }
        }

        setIsDrawing(false);
        setStartPos(null);
        saveCanvasState();
    };

    const handleTextSubmit = () => {
        if (!text || !textPos) return;

        const newShape = {
            id: Date.now().toString(),
            type: "text",
            x: textPos.x,
            y: textPos.y,
            text,
            color,
            lineWidth
        };

        setShapes(prev => [...prev, newShape]);
        setText("");
        setTextPos(null);
        setShowTextInput(false);
        redrawCanvas();
        saveCanvasState();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setShapes([]);
        setSelectedShapeId(null);
        onAnswerChange(questionId, "");
    };

    const deleteSelectedShape = () => {
        if (selectedShapeId) {
            setShapes(prev => prev.filter(shape => shape.id !== selectedShapeId));
            setSelectedShapeId(null);
            redrawCanvas();
            saveCanvasState();
        }
    };

    const tools = [
        { id: "select", icon: Move, label: "Select" },
        { id: "pen", icon: Pen, label: "Pen" },
        { id: "eraser", icon: Eraser, label: "Eraser" },
        { id: "square", icon: Square, label: "Square" },
        { id: "circle", icon: Circle, label: "Circle" },
        { id: "line", icon: Minus, label: "Line" },
        { id: "arrow", icon: ArrowRight, label: "Arrow" },
        { id: "text", icon: Type, label: "Text" }
    ];

    // Redraw canvas when shapes change
    useEffect(() => {
        redrawCanvas();
    }, [shapes, selectedShapeId]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    {tools.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setTool(id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                tool === id
                                    ? "bg-[#f0f8f7] dark:bg-[#5c8374]/30 border-[#5c8374] text-[#5c8374] dark:text-[#9ec8b9]"
                                    : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Color:</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Width:</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={lineWidth}
                            onChange={(e) => setLineWidth(parseInt(e.target.value))}
                            className="w-24"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-6">{lineWidth}</span>
                    </div>
                    {selectedShapeId && (
                        <button
                            onClick={deleteSelectedShape}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    )}
                    <button
                        onClick={clearCanvas}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                </div>
            </div>

            {showTextInput && (
                <div className="flex items-center gap-2 p-3 bg-[#f0f8f7] dark:bg-[#5c8374]/20 border border-[#9ec8b9] dark:border-[#5c8374] rounded-lg">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        onKeyPress={(e) => {
                            if (e.key === "Enter") handleTextSubmit();
                        }}
                        autoFocus
                    />
                    <button
                        onClick={handleTextSubmit}
                        className="px-4 py-2 bg-[#5c8374] text-white rounded-lg hover:bg-[#1b4242] transition-colors"
                    >
                        Add Text
                    </button>
                    <button
                        onClick={() => {
                            setShowTextInput(false);
                            setText("");
                            setTextPos(null);
                        }}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        startDrawing(e.touches[0]);
                    }}
                    onTouchMove={(e) => {
                        e.preventDefault();
                        draw(e.touches[0]);
                    }}
                    onTouchEnd={stopDrawing}
                    className={`w-full touch-none ${
                        tool === "select" ? "cursor-pointer" : 
                        tool === "eraser" ? "cursor-cell" : "cursor-crosshair"
                    }`}
                />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                {tool === "select" 
                    ? "Click on any shape to select it, then drag to move. Selected shapes show a blue dashed border."
                    : "Draw your graph or diagram above. Use the Select tool to move individual shapes."}
            </p>
        </div>
    );
}

export default DiagramCanvas;