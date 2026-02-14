import { useEffect, useRef } from "react";

interface StockChartAnimationProps {
  className?: string;
  width?: number;
  height?: number;
}

interface LineData {
  path: SVGPathElement;
  points: { x: number; y: number }[];
  color: string;
  currentIndex: number;
  speed: number;
  volatility: number;
  trend: number;
  targetLineX: number;
  currentLineX: number;
  maxLineX: number;
  isInitialized: boolean;
}

// Function to create smooth curved paths using quadratic Bézier curves
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  
  let path = `M ${points[0].x},${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const current = points[i];
    const previous = points[i - 1];
    
    if (i === 1) {
      // First curve, use simple quadratic
      const midX = (previous.x + current.x) / 2;
      const midY = (previous.y + current.y) / 2;
      path += ` Q ${previous.x},${previous.y} ${midX},${midY}`;
    } else {
      // Smooth curves using control points
      const next = points[i + 1] || current;
      const controlX = current.x;
      const controlY = current.y;
      
      if (i === points.length - 1) {
        // Last point
        path += ` Q ${controlX},${controlY} ${current.x},${current.y}`;
      } else {
        // Middle points - smooth curve
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        path += ` Q ${controlX},${controlY} ${midX},${midY}`;
      }
    }
  }
  
  return path;
}

export function StockChartAnimation({ className = "", width = 800, height = 400 }: StockChartAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);
  const linesRef = useRef<LineData[]>([]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const numLines = 5;
    const colors = ['#dc2626', '#2563eb', '#059669', '#ea580c', '#7c3aed']; // red-600, blue-600, green-600, orange-600, violet-600   
    // Clear any existing content
    svg.innerHTML = '';
    linesRef.current = [];

    // Create mask for left and right edge fade
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'fadeGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('y2', '0%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'white');
    stop1.setAttribute('stop-opacity', '0');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '20%');
    stop2.setAttribute('stop-color', 'white');
    stop2.setAttribute('stop-opacity', '1');
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '80%');
    stop3.setAttribute('stop-color', 'white');
    stop3.setAttribute('stop-opacity', '1');
    
    const stop4 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop4.setAttribute('offset', '100%');
    stop4.setAttribute('stop-color', 'white');
    stop4.setAttribute('stop-opacity', '0');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    gradient.appendChild(stop4);
    
    const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
    mask.setAttribute('id', 'leftRightFadeMask');
    
    const maskRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    maskRect.setAttribute('x', '0');
    maskRect.setAttribute('y', '0');
    maskRect.setAttribute('width', '100%');
    maskRect.setAttribute('height', '100%');
    maskRect.setAttribute('fill', 'url(#fadeGradient)');
    
    mask.appendChild(maskRect);
    defs.appendChild(gradient);
    defs.appendChild(mask);
    svg.appendChild(defs);


    // Define line lengths as percentages: 50%, 62.5%, 75%, 87.5%, 100%
    const linePercentages = [0.5, 0.625, 0.75, 0.875, 1.0];
    
    // Shuffle the percentages to randomize which line gets which length
    const shuffledPercentages = [...linePercentages].sort(() => Math.random() - 0.5);
    
    // Create racing lines
    for (let i = 0; i < numLines; i++) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', colors[i]);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', '0.8');
      path.setAttribute('mask', 'url(#leftRightFadeMask)');
      svg.appendChild(path);

      // Remove dots - just using lines

      // Initialize line data
      const startY = height * (0.3 + (i * 0.08)); // Spread starting Y positions
      const targetX = i * (width / 8) + 180 + 220; // Target X positions moved forward by 220px more
      
      // Calculate max length based on assigned percentage
      const maxX = width * shuffledPercentages[i];
      
      // Pre-populate line with points from start to max length with high randomness
      const prePopulatedPoints = [];
      let currentY = startY;
      let currentTrend = (Math.random() - 0.5) * 0.5; // Random initial trend
      
      for (let x = 0; x <= maxX; x += 4) {
        // Random walk with good volatility for natural movement
        const volatility = 0.7 + Math.random() * 0.6; // Moderate volatility (0.7-1.3)
        const randomWalk = (Math.random() - 0.5) * volatility * 10;
        
        // Trend component for smoother curves
        const trendComponent = currentTrend * 1.5;
        
        // Apply movement
        currentY += randomWalk + trendComponent;
        
        // Keep within bounds with more breathing room
        currentY = Math.max(height * 0.1, Math.min(height * 0.9, currentY));
        
        // Change trend occasionally for varied paths
        if (Math.random() < 0.03) {
          currentTrend = (Math.random() - 0.5) * 0.7; // New random trend
        }
        
        // Only apply gentle correction if lines get very extreme (not aggressive centering)
        if (currentY < height * 0.15) {
          currentTrend += 0.1; // Slight upward bias
        } else if (currentY > height * 0.85) {
          currentTrend -= 0.1; // Slight downward bias
        }
        
        prePopulatedPoints.push({ x, y: currentY });
      }

      const lineData: LineData = {
        path,
        points: prePopulatedPoints, // Start with full line already built
        color: colors[i],
        currentIndex: 0,
        speed: 0.8 + Math.random() * 0.4, // Random speed between 0.8-1.2
        volatility: 0.5 + Math.random() * 0.5, // Random volatility
        trend: (Math.random() - 0.5) * 0.3, // Random initial trend
        targetLineX: targetX,
        currentLineX: maxX, // Already at max length
        maxLineX: maxX, // Line goes to its assigned percentage of width
        isInitialized: true // Skip build phase - go straight to scrolling
      };

      linesRef.current.push(lineData);
    }

    // Start the racing animation
    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      linesRef.current.forEach((line) => {
        // Only scrolling phase: full flowing motion within boundary
        line.points = line.points.map(p => ({ x: p.x - line.speed, y: p.y }));
        line.points = line.points.filter(p => p.x > -50);
        
        // Add new point on the right - continue from where the line actually ends
        const lastPoint = line.points[line.points.length - 1];
        if (lastPoint) {
          const newX = lastPoint.x + line.speed * 2; // Continue building rightward
          
          const randomWalk = (Math.random() - 0.5) * line.volatility * 12;
          const trendComponent = line.trend * 2.5;
          let newY = lastPoint.y + randomWalk + trendComponent;
          newY = Math.max(height * 0.1, Math.min(height * 0.9, newY));
          
          if (Math.random() < 0.02) {
            line.trend = (Math.random() - 0.5) * 0.6;
          }
          
          // Only gentle correction at very extremes
          if (newY < height * 0.15) {
            line.trend += 0.08; // Slight upward bias
          } else if (newY > height * 0.85) {
            line.trend -= 0.08; // Slight downward bias
          }
          
          line.points.push({ x: newX, y: newY });
        }
        
        // Update path - only show points within the line's boundary
        const visiblePoints = line.points.filter(p => p.x <= line.maxLineX && p.x >= 0);
        if (visiblePoints.length > 1) {
          const pathData = createSmoothPath(visiblePoints);
          line.path.setAttribute('d', pathData);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };


    // Start animation after a brief delay
    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 500);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height]);

  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="overflow-visible max-w-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Content will be dynamically added by the effect */}
      </svg>
    </div>
  );
}
