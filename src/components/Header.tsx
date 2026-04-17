declare const __APP_VERSION__: string;

/** App header with title and version badge. */
export function Header() {
  return (
    <header>
      <h1>Cardio Dashboard</h1>
      <span className="version">v{__APP_VERSION__}</span>
    </header>
  );
}
