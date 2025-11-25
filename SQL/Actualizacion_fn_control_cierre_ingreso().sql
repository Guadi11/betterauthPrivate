CREATE OR REPLACE FUNCTION public.fn_control_cierre_ingreso()
    RETURNS trigger
    LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    duracion_visita interval;
    tiempo_desde_apertura interval;
BEGIN
    -- Solo ejecutamos lógica si se está definiendo una fecha de egreso (Cierre)
    IF NEW.fecha_egreso IS NOT NULL THEN

        -- Asegurar que cerrado_en tenga valor
        IF NEW.cerrado_en IS NULL THEN
            NEW.cerrado_en := NOW();
        END IF;

        -- Validación básica: Egreso no puede ser anterior al Ingreso
        IF NEW.fecha_egreso < NEW.fecha_ingreso THEN
            RAISE EXCEPTION 'La fecha de egreso no puede ser anterior a la fecha de ingreso.';
        END IF;

        -- Calculamos los dos tiempos:
        -- 1. Cuánto duró la visita según lo que escribió el operador
        duracion_visita := NEW.fecha_egreso - NEW.fecha_ingreso;
        
        -- 2. Cuánto tiempo real pasó desde que se abrió el registro hasta HOY (momento de la operación)
        tiempo_desde_apertura := NOW() - NEW.fecha_ingreso;

        -- Lógica de 24 Horas (Aplica si la visita fue larga O SI EL CIERRE ES TARDÍO operativamente)
        IF duracion_visita > interval '24 hours' OR tiempo_desde_apertura > interval '24 hours' THEN
            
            -- Marcar automáticamente el flag de excepción
            NEW.cierre_fuera_de_tiempo := TRUE;

            -- Validar que exista motivo y tenga longitud mínima
            IF NEW.motivo_cierre_fuera_de_termino IS NULL OR length(trim(NEW.motivo_cierre_fuera_de_termino)) < 10 THEN
                RAISE EXCEPTION 'El ingreso se abrió hace más de 24hs. Es obligatorio indicar un motivo (ej: "Olvido de cierre").';
            END IF;
        ELSE
            -- Si ambos tiempos son menores a 24h, todo normal
            NEW.cierre_fuera_de_tiempo := FALSE;
        END IF;

    END IF;

    RETURN NEW;
END;
$BODY$;