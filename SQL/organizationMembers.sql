SELECT 
    u.name AS nombre_usuario,
    u.username,
    o.name AS nombre_organizacion,
    m.role AS rol
FROM 
    "user" u
JOIN 
    member m ON u.id = m."userId"
JOIN 
    organization o ON m."organizationId" = o.id
ORDER BY 
    o.name, u.name;