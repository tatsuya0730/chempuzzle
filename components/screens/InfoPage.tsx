type InfoCard = {
  title: string;
  body: string;
};

export function InfoPage({ title, description, cards }: { title: string; description: string; cards: InfoCard[] }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">{description}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
            <h2 className="text-lg font-black text-slate-950">{card.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{card.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
