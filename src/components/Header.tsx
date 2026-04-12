declare const __APP_VERSION__: string;

export function Header() {
  return (
    <header>
      <h1>Cardio Dashboard</h1>
      <span className="version">v{__APP_VERSION__}</span>
    </header>
  );
}
