import './App.css'
import { useEffect, useRef, useState} from 'react'

function App() { 
  const canvasRef = useRef<HTMLCanvasElement>(null); 
  const history = useRef<ImageData[]>([]);
  const isDrawing = useRef(false); 

  type Drawing = {
    image: string;
    x: number;
    y: number;
  };
 
const [drawings, setDrawings] = useState<Drawing[]>([]);

  function startDrawing(event: React.MouseEvent<HTMLCanvasElement>) { 
    const canvas = canvasRef.current; 
    if (!canvas) return; 
    const ctx = canvas.getContext('2d'); 
    if (!ctx) return; 
    history.current.push(
      ctx.getImageData(0, 0, canvas.width, canvas.height)
    )
    const rect = canvas.getBoundingClientRect(); 
    const x = event.clientX - rect.left; 
    const y = event.clientY - rect.top; 
    ctx.beginPath(); 
    ctx.moveTo(x, y); 

    ctx.lineWidth = 3; 
    ctx.strokeStyle = 'black'; 
    ctx.lineCap = 'round'; 
    ctx.lineTo(x, y); 
    ctx.stroke(); 

    isDrawing.current = true; 

  }

  function draw(event: React.MouseEvent<HTMLCanvasElement>) { 
    if (!isDrawing.current) return; 
    const canvas = canvasRef.current; 
    if(!canvas) return; 
    const ctx = canvas.getContext('2d'); 
    if (!ctx) return; 
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left; 
    const y = event.clientY - rect.top; 
    ctx.lineWidth = 3; 
    ctx.strokeStyle = 'black'; 
    ctx.lineCap = 'round'; 
    ctx.lineTo(x, y); 
    ctx.stroke(); 
  }

  function stopDrawing() { 
    isDrawing.current = false; 
  }

function undo() { 
  const canvas = canvasRef.current; 
  if (!canvas) return; 
  const ctx = canvas.getContext('2d'); 
  if (!ctx) return; 
  const previousDrawing = history.current.pop(); 
  if (previousDrawing) { 
    ctx.putImageData(previousDrawing, 0, 0)
  }
}

function submitDrawing () { 
  const canvas = canvasRef.current; 
  if (!canvas) return; 
  const ctx = canvas.getContext('2d'); 
  if (!ctx) return; 
  const image = canvas.toDataURL('image/png'); 
  const size = 80;
  const universeWidth = 650;
  const universeHeight = 500;
  const padding = 15;

  let x = 0;
  let y = 0;
  let positionFound = false;

  for (let attempt = 0; attempt < 100; attempt++) {
    const newX = padding + Math.random() *
      (universeWidth - size - 2 * padding);

    const newY = padding + Math.random() *
      (universeHeight - size - 2 * padding);

    const overlaps = drawings.some(drawing =>
      newX < drawing.x + size + padding &&
      newX + size + padding > drawing.x &&
      newY < drawing.y + size + padding &&
      newY + size + padding > drawing.y
    );

    if (!overlaps) {
      x = newX;
      y = newY;
      positionFound = true;
      break;
    }
  }

  if (!positionFound) {
    alert('The universe is full!');
    return;
  }

  setDrawings(previous => [...previous, { image, x, y }]);
  ctx.clearRect(0, 0, canvas.width, canvas.height ); 
  history.current = []; 
  isDrawing.current = false;
}

useEffect(() => { 
  function handleKeyDown(event: KeyboardEvent) { 
    if ( 
       (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'z' &&
        !event.shiftKey
      ) {
        // Don't interfere with undo inside text fields
        const target = event.target;
        if (
          target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.closest('input, textarea, select'))
        ) {
          return;
        }

        event?.preventDefault(); 
        undo(); 
      } 
  }

  window.addEventListener('keydown', handleKeyDown); 
  return () => { 
    window.removeEventListener('keydown', handleKeyDown); 
  }; 
}, []); 

  return ( 
    <main> 
      <h1> Solar Systems </h1> 
      <p> Draw something to add to OUR universe !</p>

      <canvas 

        ref={canvasRef}
        width={500}
        height={400}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      /> 
    <section> 
      <div className="controls"> 
        <button onClick={undo}>Undo</button>
        <button onClick={submitDrawing}>Submit</button>
      </div> 
    </section> 

    <section> 
      <h2>Universe!</h2> 
      <div className="universe"> 
        {drawings.map((drawing, index) => (
          <img 
            key={index} 
            src={drawing.image} 
            alt={'Drawing ${index+1}'} 
            className="submitted-drawing" 
          /> 
        ))}
      </div>
      </section>
    </main> 
  ); 
}

export default App

