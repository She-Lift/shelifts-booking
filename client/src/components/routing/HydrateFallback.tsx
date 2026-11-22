import Spinner from '@src/components/generic/Spinner';

export default function HydrateFallback() {
  return (
    <main className="hero is-fullheight">
      <div className="hero-body is-justify-content-center">
        <Spinner label="Laddar..." size="large" />
      </div>
    </main>
  );
}
