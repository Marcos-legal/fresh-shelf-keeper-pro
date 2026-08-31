import { ArrowRight, CheckCircle2, Clock3, Package, QrCode, ShieldCheck, Tag, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Clock3, title: "Controle de validade", text: "Veja rapidamente o que está válido, vencendo e vencido." },
  { icon: Tag, title: "Etiquetas prontas", text: "Gere etiquetas para organizar os produtos do seu estabelecimento." },
  { icon: QrCode, title: "QR Code", text: "Consulte e dê baixa nas etiquetas de forma rápida." },
  { icon: Package, title: "Estoque organizado", text: "Controle produtos por ambiente, câmara fria e armazenamento." },
  { icon: BarChart3, title: "Dashboard", text: "Tenha uma visão clara das prioridades do estoque." },
  { icon: ShieldCheck, title: "Acesso por usuários", text: "Organize a equipe com diferentes níveis de acesso." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 font-bold tracking-tight">
            <img src="/logo-valicontrol.png" alt="ValiControl" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-xl">ValiControl</span>
          </button>
          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <a href="#recursos" className="hover:text-white">Recursos</a>
            <a href="#como-funciona" className="hover:text-white">Como funciona</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <Button onClick={() => navigate("/auth")} variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">Entrar</Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(37,99,235,.25),transparent_40%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
            <div>
              <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">Controle inteligente para seu estoque</span>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Controle as validades do seu estoque sem complicação.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">O ValiControl ajuda restaurantes e estabelecimentos a reduzir perdas, organizar produtos e saber exatamente o que precisa da sua atenção.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate("/auth")} className="bg-blue-600 hover:bg-blue-500">Começar agora <ArrowRight /></Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" })} className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">Conhecer recursos</Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" />Dashboard de validades</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" />Etiquetas e QR Code</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" />Controle de equipe</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-2xl">
              <div className="rounded-xl bg-slate-100 p-4 text-slate-900 shadow-inner">
                <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Resumo do estoque</p><h2 className="text-xl font-semibold">Olá! Aqui está o que precisa da sua atenção.</h2></div><div className="rounded-lg bg-blue-50 p-2 text-blue-600"><BarChart3 className="h-5 w-5" /></div></div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[['Produtos','248'],['Válidos','214'],['Vencendo','21'],['Vencidos','13']].map(([label,value],i)=><div key={label} className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-xs text-slate-500">{label}</p><p className={`mt-2 text-2xl font-bold ${i===3?'text-red-600':i===2?'text-amber-600':'text-slate-900'}`}>{value}</p></div>)}
                </div>
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4"><p className="text-sm font-semibold">O que precisa da sua atenção</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{['Produtos vencidos','Vencem nesta semana','Vencem em 30 dias'].map((x,i)=><div key={x} className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">{x}</p><p className="mt-1 font-semibold">{[13,7,21][i]} produtos</p></div>)}</div></div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="bg-white py-20 text-slate-900">
          <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Tudo em um só lugar</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Mais controle. Menos desperdício.</h2><p className="mt-4 text-slate-600">Uma plataforma pensada para a rotina real de quem precisa controlar validade e estoque todos os dias.</p></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{features.map(({icon:Icon,title,text})=><div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-6"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon className="h-5 w-5" /></div><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}</div></div>
        </section>

        <section id="como-funciona" className="bg-slate-50 py-20 text-slate-900"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="text-center"><p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Simples de usar</p><h2 className="mt-2 text-3xl font-bold">Comece em poucos passos</h2></div><div className="mt-10 grid gap-6 md:grid-cols-3">{[['01','Cadastre seus produtos','Registre produtos e informações de validade.'],['02','Organize seu estoque','Use as categorias e o dashboard para acompanhar tudo.'],['03','Aja no momento certo','Gere etiquetas, consulte QR Codes e evite perdas.']].map(([n,t,d])=><div key={n} className="rounded-xl bg-white p-7 shadow-sm"><span className="text-sm font-bold text-blue-600">{n}</span><h3 className="mt-3 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p></div>)}</div></div></section>

        <section id="faq" className="bg-white py-20 text-slate-900"><div className="mx-auto max-w-3xl px-5 lg:px-8"><h2 className="text-center text-3xl font-bold">Perguntas frequentes</h2><div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">{[['O ValiControl funciona no celular e no PC?','Sim. A interface foi pensada para funcionar em telas grandes e também em dispositivos móveis.'],['Posso cadastrar mais de um usuário?','Sim. O sistema possui controle de membros e diferentes níveis de acesso por empresa.'],['O sistema gera etiquetas?','Sim. O ValiControl possui fluxo próprio para geração e impressão de etiquetas.'],['Posso testar antes de contratar?','A condição de teste e os planos podem ser configurados conforme a oferta comercial da plataforma.']].map(([q,a])=><details key={q} className="group py-5"><summary className="cursor-pointer list-none font-semibold">{q}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{a}</p></details>)}</div></div></section>

        <section className="bg-blue-600 py-16"><div className="mx-auto max-w-5xl px-5 text-center"><h2 className="text-3xl font-bold sm:text-4xl">Pronto para ter mais controle do seu estoque?</h2><p className="mx-auto mt-4 max-w-2xl text-blue-100">Comece a organizar suas validades e transforme o controle de estoque em uma rotina simples.</p><Button size="lg" onClick={() => navigate("/auth")} className="mt-7 bg-white text-blue-700 hover:bg-blue-50">Começar agora <ArrowRight /></Button></div></section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950 py-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© {new Date().getFullYear()} ValiControl</span><span>Controle de Validades</span></div></footer>
    </div>
  );
}
