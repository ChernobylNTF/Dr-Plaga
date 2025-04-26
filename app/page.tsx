// Añadir "use client" porque usaremos hooks de React
"use client";

// Importaciones de React y Worldcoin
import React, { useState, useEffect } from 'react';
import { useMiniKit, VerificationLevel } from '@worldcoin/minikit-react';

// Importa tu componente de juego
import GameContainer from "@/components/game-container";

export default function Home() {
  // Estados para manejar la verificación
  const { isReady, Commands } = useMiniKit();
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Leer App ID y Action ID desde las variables de entorno
  const worldcoinAppId = process.env.NEXT_PUBLIC_WLD_APP_ID;
  const worldcoinActionId = process.env.NEXT_PUBLIC_WLD_ACTION_ID;

  // --- Lógica de verificación (handleVerify) ---
  const handleVerify = async () => {
    // Validar que AMBOS IDs estén configurados
    if (!worldcoinAppId || !worldcoinAppId.startsWith('app_')) {
        console.error("Error: Worldcoin App ID (NEXT_PUBLIC_WLD_APP_ID) inválido o no configurado.");
        setVerificationError("Error de configuración: Falta o es inválido el App ID.");
        return;
     }
    if (!worldcoinActionId) {
        console.error("Error: Worldcoin Action ID (NEXT_PUBLIC_WLD_ACTION_ID) no está configurado.");
        setVerificationError("Error de configuración: Falta el Action ID.");
        return;
    }

    if (!isReady) {
      console.error("MiniKit not ready");
      setVerificationError("World App connection not ready. Ensure you're running inside World App.");
      return;
    }
    setVerificationError(null);

    try {
      console.log("Initiating verification...");
      const verifyInput = {
        action: worldcoinActionId,
        signal: 'user-specific-signal', // Optional - considera si necesitas un valor único aquí
        verification_level: VerificationLevel.Orb,
      };

      const unsubscribe = Commands.verify.subscribe(async (response) => {
        console.log("Verification response received:", response);
        unsubscribe();

        if (response.status === 'success') {
          const backendResponse = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              action: verifyInput.action,
              signal: verifyInput.signal,
              app_id: worldcoinAppId as `app_${string}`
            }),
          });

          const verificationResult = await backendResponse.json();

          if (backendResponse.ok && verificationResult.success) {
            console.log("Backend verification successful!");
            setIsVerified(true); // <- Establece como verificado
          } else {
            console.error("Backend verification failed:", verificationResult.error || "Unknown error");
            setVerificationError(`Verification failed: ${verificationResult.error || 'Could not verify proof.'}`);
            setIsVerified(false);
          }
        } else {
          console.error("MiniKit verification error:", response);
          setVerificationError(`World App verification failed: ${response.error?.code || 'Unknown error'}`);
          setIsVerified(false);
        }
      });

      await Commands.verify.send(verifyInput);
      console.log("Verification command sent.");

    } catch (error) {
      console.error("Error initiating verification:", error);
      setVerificationError("An unexpected error occurred during verification.");
      setIsVerified(false);
    }
  };

  // --- Hooks useEffect para checks iniciales ---
   useEffect(() => {
    if (isReady) {
        console.log("MiniKit is ready.");
    } else {
        console.log("MiniKit not ready. May not be running in World App.");
    }
   }, [isReady]);

   useEffect(() => {
    let configError = null;
    if (!worldcoinAppId || !worldcoinAppId.startsWith('app_')) {
      configError = "App ID (NEXT_PUBLIC_WLD_APP_ID)";
    } else if (!worldcoinActionId) {
      configError = "Action ID (NEXT_PUBLIC_WLD_ACTION_ID)";
    }

    if(configError) {
      const errorMsg = `Error de configuración inicial: Falta o es inválido el ${configError}.`;
       console.error(`CRITICAL: ${errorMsg}`);
       setVerificationError(errorMsg);
    }
   }, [worldcoinAppId, worldcoinActionId]);

  // --- Renderizado Condicional ---
  return (
    // Mantienes tu 'main' como contenedor principal
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white">
      {!isVerified ? (
        // Si NO está verificado, muestra el mensaje y botón
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Dr Plagua</h1>
          <p>Por favor, verifica tu humanidad para jugar.</p>
          <button
            onClick={handleVerify}
            disabled={!isReady || !worldcoinAppId || !worldcoinAppId.startsWith('app_') || !worldcoinActionId}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verificar con World ID (Orb)
          </button>
          {!isReady && <p className="text-sm text-yellow-400">Esperando conexión con World App...</p>}
          {verificationError && <p className="text-sm text-red-500">Error: {verificationError}</p>}
        </div>
      ) : (
        // Si SÍ está verificado, muestra tu GameContainer
        <>
          <h1 className="text-2xl font-bold mb-4">Dr Plagua - Verificado</h1>
          <GameContainer />
        </>
      )}
    </main>
  );
}
