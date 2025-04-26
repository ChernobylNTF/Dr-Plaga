// app/api/verify/route.ts
import { NextResponse } from 'next/server';
import { verifyCloudProof, VerificationLevel } from '@worldcoin/minikit-js';

// Define la estructura esperada del cuerpo de la solicitud
interface VerifyRequestPayload {
  proof: string;
  merkle_root: string;
  nullifier_hash: string;
  verification_level: VerificationLevel;
  signal?: string;
  action: string;          // Action ID que envía el frontend
  app_id: `app_${string}`; // App ID que envía el frontend
}

export async function POST(request: Request) {
  try {
    // Extrae los datos del cuerpo JSON de la solicitud
    const { proof, merkle_root, nullifier_hash, verification_level, signal, action, app_id } = (await request.json()) as VerifyRequestPayload;

    console.log("Backend: Received verification request", { action, signal, app_id, nullifier_hash });

    // *** LEER el App ID esperado desde variables de entorno del SERVIDOR ***
    const expectedAppId = process.env.NEXT_PUBLIC_WLD_APP_ID;

    // Validar que la variable de entorno esté configurada en el servidor
    if (!expectedAppId) {
        console.error("CRITICAL SERVER ERROR: NEXT_PUBLIC_WLD_APP_ID environment variable not set.");
        // No dar detalles específicos del error al cliente por seguridad
        return NextResponse.json({ success: false, error: 'Server configuration error.' }, { status: 500 });
    }

    // Validar que el app_id recibido del frontend coincida con el esperado en el backend
     if (app_id !== expectedAppId) {
        console.warn(`Backend: Mismatched App ID. Expected ${expectedAppId}, Received ${app_id}`);
        return NextResponse.json({ success: false, error: 'Invalid App ID provided.' }, { status: 400 });
     }

    // Asegurarse que los campos requeridos de la prueba estén presentes
    if (!proof || !merkle_root || !nullifier_hash || !action) {
        return NextResponse.json({ success: false, error: 'Missing required fields in request body' }, { status: 400 });
    }

    // Construir el payload para la función de verificación de Worldcoin
    const proofPayload = {
        proof,
        merkle_root,
        nullifier_hash,
        verification_level
    };

    // Llamar a la API de Worldcoin para verificar la prueba en la nube
    // Usa el app_id (validado) y el action recibidos
    const verifyRes = await verifyCloudProof(proofPayload, app_id, action, signal ?? ""); // Usa "" si signal es undefined

    console.log("Backend: Cloud verification response", verifyRes);

    // Comprobar el resultado de la verificación
    if (verifyRes.success) {
      // ¡Verificación exitosa!
      // Aquí podrías realizar acciones adicionales en tu backend si es necesario
      // (ej. marcar al usuario como verificado en tu base de datos usando el nullifier_hash)
      console.log(`Backend: Verification success for action "${action}" and nullifier "${nullifier_hash}"`);
      // Devolver éxito y el nullifier_hash al frontend
      return NextResponse.json({ success: true, nullifier_hash: nullifier_hash }, { status: 200 });
    } else {
      // Verificación fallida
       console.error(`Backend: Verification failed: ${verifyRes.detail || 'Unknown reason'}`);
       // Devolver error al frontend
      return NextResponse.json({ success: false, error: `Proof verification failed: ${verifyRes.detail || 'Unknown reason'}` }, { status: 400 });
    }
  } catch (error: any) {
     // Manejar errores inesperados durante el proceso
     console.error("Backend: Internal server error during verification", error);
    return NextResponse.json({ success: false, error: `Internal server error: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
