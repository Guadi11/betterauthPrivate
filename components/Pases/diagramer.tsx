"use client"

import { useEffect, useRef } from 'react';

const DiagramEditor = () => {
  const iframeRef = useRef(null);
  
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.event === 'init') {
        // El editor está listo para recibir comandos
        console.log('Editor inicializado');
      }
      
      if (event.data && event.data.event === 'save') {
        // Guardar el diagrama
        console.log('Diagrama guardado:', event.data.xml);
        // Aquí podrías guardar event.data.xml en tu base de datos
      }
      
      if (event.data && event.data.event === 'exit') {
        // El usuario cerró el editor
        console.log('Editor cerrado');
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  const loadDiagram = (xml) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          action: 'load',
          xml: xml
        },
        '*'
      );
    }
  };

  return (
    <div className="w-full h-screen relative">
      <button 
        className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => loadDiagram('<mxGraphModel>...</mxGraphModel>')}
      >
        Cargar Plantilla
      </button>
      
      <iframe
        ref={iframeRef}
        src="https://embed.diagrams.net/?embed=1&ui=atlas&spin=1&proto=json"
        className="w-full h-full border-0"
      />
    </div>
  );
};

export default DiagramEditor;