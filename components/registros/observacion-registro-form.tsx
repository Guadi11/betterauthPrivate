"use client"

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export default function FormularioObservacion(){
    return(
        <div className="grid w-full gap-2">
            <Label htmlFor="message-2">Observación</Label>
            <Textarea placeholder="Observacion, TODO" disabled className="bg-yellow-100"/>
            <Button>Guardar observación</Button>
        </div>
    );
} 