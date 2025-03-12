import { useEffect, useState } from 'react';

interface SideNavProps {
  children?: React.ReactNode;
}

export default function SideNav({ children }: SideNavProps) {
  

  return (
    <div className="sidenav">
      <div className="sidenav-header">
        <h1 className="app-title">Contra Inteligencia</h1>
        {userName && (
          <div className="user-info">
            <span>Bienvenido, {userName}</span>
          </div>
        )}
      </div>
      <div className="sidenav-content">
        {children}
      </div>
      
      <style jsx>{`
        .sidenav {
          width: 250px;
          height: 100vh;
          background-color: #1a1a2e;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
        }
        
        .sidenav-header {
          padding: 20px 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 20px;
        }
        
        .app-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 15px 0;
          color: #ffffff;
        }
        
        .user-info {
          font-size: 0.9rem;
          opacity: 0.8;
          padding-bottom: 5px;
        }
        
        .sidenav-content {
          flex: 1;
          padding: 0 15px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}