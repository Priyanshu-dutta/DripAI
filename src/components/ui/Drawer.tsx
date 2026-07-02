import React from 'react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

/**
 * Slide-out bottom/side panel container representing the Trial Closet display tray.
 */
export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="drawer-close-btn">&times;</button>
        </div>
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Drawer;
