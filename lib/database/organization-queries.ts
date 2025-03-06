import { query } from '@/lib/database/db';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  // Otros campos del usuario
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  // Otros campos de organización
}

interface UserOrganization {
  nombre: string;
  username: string;
  organization: string;
  role: string;
}

// Obtener todas las organizaciones de un usuario
export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const queryText = `
    SELECT o.* 
    FROM organization o
    JOIN member m ON o.id = m.organizationId
    WHERE m.userId = $1
  `;
  
  const result = await query(queryText, [userId]);
  return result.rows;
}

// Obtener detalles de una organización específica
export async function getOrganizationById(organizationId: string): Promise<Organization | null> {
  const queryText = 'SELECT * FROM organization WHERE id = $1';
  const result = await query(queryText, [organizationId]);
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Obtener miembros de una organización
export async function getOrganizationMembersByOrganizationId(organizationId: string): Promise<User[]> {
  const queryText = `
    SELECT u.* 
    FROM "user" u
    JOIN member m ON u.id = m.userId
    WHERE m.organizationId = $1
  `;
  
  const result = await query(queryText, [organizationId]);
  return result.rows;
}

// Obtener el rol de un usuario en una organización
export async function getUserRoleInOrganization(userId: string, organizationId: string): Promise<string | null> {
  const queryText = 'SELECT role FROM member WHERE userId = $1 AND organizationId = $2';
  const result = await query(queryText, [userId, organizationId]);
  
  return result.rows.length > 0 ? result.rows[0].role : null;
}

export async function getOrganizationMembers(): Promise<UserOrganization[]>{
  const queryText = `
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
  `;

  const result = await query(queryText);
  return result.rows;
}