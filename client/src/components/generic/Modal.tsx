import { useEffect, useEffectEvent, useId, type ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Modal({ isOpen, title, onClose, footer, children }: ModalProps) {
  const titleId = useId();
  const handleClose = useEffectEvent(onClose);

  useEffect(() => {
    if (!isOpen) return;

    document.documentElement.classList.add('is-clipped');

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.documentElement.classList.remove('is-clipped');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`modal px-3 ${isOpen ? 'is-active' : ''}`}>
      <div className="modal-background" onClick={onClose} />
      <div className="modal-card">
        <header className="modal-card-head py-4 px-5">
          <p id={titleId} className="modal-card-title is-size-6 has-text-weight-bold">
            {title}
          </p>
          <button type="button" className="delete" aria-label="Stäng" onClick={onClose} />
        </header>

        <section className="modal-card-body py-4 px-5">{children}</section>

        {footer && <footer className="modal-card-foot py-3 px-5 is-justify-content-space-between">{footer}</footer>}
      </div>
    </div>
  );
}
