import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const STUDY_WORDS = [
  "Study", "Focus", "Notes", "Quiz", "Review", "Flashcards", "Deadline",
  "Schedule", "Assignments", "Productivity", "Learning", "Exams", "Research",
  "Projects", "Reading", "Pomodoro", "Goals", "Progress", "Collaboration",
  "Study Plan", "Time Management", "To-Do List", "Class Notes", "Group Study"
];

const COLORS = [
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
];

export const StudyBoxPhysicsBackground = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Runner, Events } = Matter;

    const engine = Engine.create();
    const world = engine.world;
    
    // Lower gravity to make them fall down slower
    engine.gravity.y = 0.4;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        wireframes: false,
        pixelRatio: window.devicePixelRatio
      }
    });

    const createBoundaries = (width, height) => {
      const wallOptions = { isStatic: true, render: { visible: false } };
      return [
        Bodies.rectangle(width / 2, height + 25, width * 2, 50, wallOptions),
        Bodies.rectangle(-25, height / 2, 50, height * 2, wallOptions),
        Bodies.rectangle(width + 25, height / 2, 50, height * 2, wallOptions),
      ];
    };

    let boundaries = createBoundaries(window.innerWidth, window.innerHeight);
    World.add(world, boundaries);

    const boxes = STUDY_WORDS.map((word, index) => {
      // Made the boxes noticeably bigger
      const w = word.length * 16 + 50; 
      const h = 70;
      const x = Math.random() * (window.innerWidth - 100) + 50;
      const y = -Math.random() * 3000 - 100; // Stagger fall from top
      const color = COLORS[index % COLORS.length];

      return Bodies.rectangle(x, y, w, h, {
        friction: 0.3,
        frictionAir: 0.02, // Adds a bit of resistance so they float down smoothly
        restitution: 0.4,
        render: { fillStyle: color },
        plugin: { text: word.toUpperCase() } // Make text uppercase
      });
    });

    World.add(world, boxes);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    World.add(world, mouseConstraint);

    render.mouse = mouse;

    Events.on(render, 'afterRender', () => {
      const context = render.context;
      // Increased font size and changed to Google Sans
      context.font = "bold 22px 'Google Sans', sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#ffffff";
      
      for (const body of boxes) {
        if (body.plugin && body.plugin.text) {
          const { x, y } = body.position;
          context.translate(x, y);
          context.rotate(body.angle);
          context.fillText(body.plugin.text, 0, 1);
          context.rotate(-body.angle);
          context.translate(-x, -y);
        }
      }
    });

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      render.canvas.width = width;
      render.canvas.height = height;
      render.options.width = width;
      render.options.height = height;
      World.remove(world, boundaries);
      boundaries = createBoundaries(width, height);
      World.add(world, boundaries);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas) render.canvas.remove();
      World.clear(world);
      Engine.clear(engine);
    };
  }, []);

  return <div ref={sceneRef} className="absolute inset-0 z-0 overflow-hidden cursor-grab active:cursor-grabbing" />;
};