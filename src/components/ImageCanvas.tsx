import React, { useRef, useState, useEffect } from "react";

interface Point {
    x: number;
    y: number;
}

interface Drawing {
    points: Point[];
    color: string;
}

interface ImageCanvasProps {
    exportImage: () => void;
}
const ImageCanvas: React.FC<ImageCanvasProps> = ({ exportImage }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null); // the reference to the main canvas
    const fileInputRef = useRef<HTMLInputElement>(null); // image file

    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [currentDrawing, setCurrentDrawing] = useState<Drawing>({ points: [], color: "#ff9a00" });

    const [image, setImage] = useState<HTMLImageElement | null>(null);

    // useEffect(() => {
    //     const canvas = canvasRef.current;
    //     if (canvas && image) {
    //         const ctx = canvas.getContext("2d");
    //         if (ctx) {
    //             ctx.clearRect(0, 0, canvas.width, canvas.height);
    //             ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    //             drawings.forEach((draw) => drawLines(ctx, draw.points, draw.color));
    //             drawLines(ctx, currentDrawing.points, currentDrawing.color);
    //         }
    //     }
    // }, [image, drawings, currentDrawing]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && image) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                drawings.forEach((draw) => {
                    drawLines(ctx, draw.points, draw.color);
                    draw.points.forEach((point) => drawDot(ctx, point, draw.color)); // Draw dots for finalized drawings
                });
                drawLines(ctx, currentDrawing.points, currentDrawing.color);
                currentDrawing.points.forEach((point) => drawDot(ctx, point, currentDrawing.color)); // Draw dots for the current drawing
            }
        }
    }, [image, drawings, currentDrawing]);

    // initial loading of the default image
    useEffect(() => {
        const loadImage = () => {
            const img = new Image();
            img.src = process.env.PUBLIC_URL + "/example-img.png"; // Path to the default image
            img.onload = () => {
                setImage(img);
            };
        };
        loadImage();
    }, []);

    /**
     * this method draws lines connecting the points on the canvas.
     * @param ctx - the 2D rendering context of the canvas
     */
    const drawLines = (ctx: CanvasRenderingContext2D, points: Point[], color: string) => {
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach((point) => ctx.lineTo(point.x, point.y));
        if (points[0]) {
            ctx.lineTo(points[0].x, points[0].y); //closing the shape here
        }
        ctx.lineWidth = 3; // setting the line width to 3px
        ctx.strokeStyle = color; // custom color
        ctx.stroke();
    };

    /**
     * also render dots on the edges of the lines
     * this could be optional
     */
    const drawDot = (ctx: CanvasRenderingContext2D, point: Point, color: string) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 100 * Math.PI); // Draw a small circle (dot)
        ctx.fillStyle = color; // Fill color same as the drawing color
        ctx.fill();
    };

    /**
     * this method is called when the user clicks on the canvas.
     * It adds a new point to the list of points.
     */
    const handleMouseClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const newPoint = { x, y };

            setCurrentDrawing((prevDrawing) => ({
                ...prevDrawing,
                points: [...prevDrawing.points, newPoint],
            }));
        }
    };

    /**
     * to add new drawing in the same image
     * this is responsible for creating separate multiple drawings
     */
    const handleAddNewDrawing = () => {
        if (currentDrawing.points.length > 0) {
            setDrawings([...drawings, currentDrawing]);

            setCurrentDrawing((value) => ({
                ...value,
                points: [],
            }));
        }
    };

    /**
     * method to clear all the drawings
     */
    const resetCanvas = () => {
        setDrawings([]);
        setCurrentDrawing({ points: [], color: "#ff9a00" });
        const canvas = canvasRef.current;
        if (canvas && image) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            }
        }
    };

    /**
     * method called when the user selects an image file to upload.
     * @param e - object containing info about the file input
     */
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                setImage(img);
                resetCanvas(); // also reset the canvas when a new image is uploaded
            };
        }
    };

    /**
     * This function is called when the "Upload Image" button is clicked.
     * It programmatically clicks the file input element to open the file picker.
     * This allows the user to select an image file to upload.
     */
    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="main-container">
            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    width={1000}
                    height={500}
                    style={{ border: "2px solid black", borderRadius: 12 }}
                    onClick={handleMouseClick}
                />

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                />
            </div>

            <div className="action-buttons-container">
                <button onClick={handleUploadButtonClick}>Upload Image</button>

                {image && (
                    <>
                        <button onClick={handleAddNewDrawing}>Add Drawing</button>

                        <div className="color-input-container">
                            <input
                                className="color-input"
                                type="color"
                                id="color"
                                value={currentDrawing.color}
                                onChange={(e) =>
                                    setCurrentDrawing((value) => ({
                                        ...value,
                                        color: e.target.value,
                                    }))
                                }
                            />

                            <label htmlFor="color">Drawing Color</label>
                        </div>

                        <button onClick={exportImage}>Export Image</button>

                        {/* if there is drawing */}
                        {(drawings.length > 0 || currentDrawing.points.length > 0) && (
                            <button onClick={resetCanvas} className="reset-button">
                                Reset Drawing
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageCanvas;
