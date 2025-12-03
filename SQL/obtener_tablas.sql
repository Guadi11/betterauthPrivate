SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable 
FROM 
    information_schema.columns 
WHERE 
    table_name IN ('log_impresion_pat')
ORDER BY 
    table_name, ordinal_position;