export const Footer = () => {
  return (
    <footer className="glass border-t [border-color:var(--color-border)/30%] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-[var(--color-text)]/60">
        © {new Date().getFullYear()} ResQLink. All rights reserved.
      </div>
    </footer>
  );
};