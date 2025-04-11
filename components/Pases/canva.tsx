"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export default function EditorTarjeta() {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.fabric && !fabricCanvasRef.current) {
      const canvas = new window.fabric.Canvas("canvas-tarjeta", {
        width: 500,
        height: 300,
        backgroundColor: "#f3f3f3",
      });

      const nombre = new window.fabric.Text("Tarjeta", {
        left: 50,
        top: 50,
        fontSize: 20,
        fill: "#000",
      });

      const apellido = new window.fabric.Text("Acceso BNBPB", {
        left: 50,
        top: 80,
        fontSize: 20,
        fill: "#000",
      });

      canvas.add(nombre);
      canvas.add(apellido);
      fabricCanvasRef.current = canvas;
    }
  }, []);

  const handleAgregarNumero = () => {
    const numero = inputRef.current.value.trim();
    if (!numero || !fabricCanvasRef.current) return;

    const numeroText = new window.fabric.Text(`N°: ${numero}`, {
      left: 50,
      top: 110,
      fontSize: 20,
      fill: "#000",
    });

    fabricCanvasRef.current.add(numeroText);
    inputRef.current.value = "";
  };

  const handleGuardar = () => {
    if (!fabricCanvasRef.current) return;
    const json = fabricCanvasRef.current.toJSON();
    console.log("Diseño guardado:", json);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <Script src="https://cdn.jsdelivr.net/npm/fabric@latest/dist/fabric.min.js" strategy="beforeInteractive" />

      <h1 className="text-2xl font-bold">Editor de Tarjeta</h1>

      <canvas id="canvas-tarjeta" ref={canvasRef} className="border" />

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ingrese N° de tarjeta"
          className="border p-2 rounded"
        />
        <button
          onClick={handleAgregarNumero}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Agregar Número
        </button>
      </div>

      <button
        onClick={handleGuardar}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        Guardar Diseño
      </button>
    </div>
  );
}
