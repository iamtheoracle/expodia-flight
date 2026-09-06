type OperationalPageProps = {
  title: string;
  description: string;
  status: string;
};

export function OperationalPage({ title, description, status }: OperationalPageProps) {
  return (
    <main className="content">
      <div className="pageIntro">
        <div>
          <h1>{title}</h1>
          <p className="subtitle">{description}</p>
        </div>
      </div>
      <section className="card" aria-live="polite">
        <div className="panelHeader">
          <h2 className="panelTitle">Operational status</h2>
        </div>
        <div className="empty">{status}</div>
      </section>
    </main>
  );
}
