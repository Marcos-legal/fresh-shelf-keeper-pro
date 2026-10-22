import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import { PageLayout } from './src/components/PageLayout';
import { ContagemEstoqueForm } from './src/components/ContagemEstoqueForm';
import { ResponsaveisProvider } from './src/contexts/ResponsaveisContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './src/components/ui/dialog';
import { Button } from './src/components/ui/button';
import { ExportarEstoque } from './src/components/ExportarEstoque';
const produtos = Array.from({length: 250}, (_, i) => ({id: `p-${i}`, nome: `Produto ${String(i).padStart(3, '0')} nome comprido para verificar quebra`, quantidade_por_unidade: 1, unidade_conteudo: 'porções', unidade_medida: 'caixa'}));
function Check() {
 const [open,setOpen]=useState(false); const [actions,setActions]=useState(true); const [saved,setSaved]=useState('');
 return <ResponsaveisProvider><PageLayout title="Contagem de Estoque" headerActions={<div className="flex w-full min-w-0 flex-col gap-2 lg:w-auto"><Button className="h-11 self-end text-xs lg:hidden" onClick={()=>setActions(!actions)}>Ações</Button><div className={`${actions?'flex':'hidden lg:flex'} min-w-0 flex-wrap gap-2 [&>button]:h-11 [&>button]:flex-1 [&>button]:basis-[calc(50%-0.25rem)] lg:[&>button]:h-9 lg:[&>button]:flex-none lg:[&>button]:basis-auto`}><Button>Migrar</Button><ExportarEstoque produtos={produtos} contagens={[]} getEstoqueAtual={()=>0}/><Button>Produto</Button><Button onClick={()=>setOpen(true)}>Contagem</Button></div></div>}><p>{saved}</p><Dialog open={open} onOpenChange={setOpen}><DialogContent className="w-[calc(100vw-1rem)] max-w-2xl max-h-[calc(100dvh-1rem)] overflow-x-hidden overflow-y-auto overscroll-contain p-4 sm:max-h-[calc(100dvh-2rem)] sm:p-6"><DialogHeader className="pr-9"><DialogTitle>Nova Contagem de Estoque</DialogTitle></DialogHeader><ContagemEstoqueForm produtos={produtos} onSubmit={data=>setSaved(`Enviado: ${data.produto_id}`)} onClose={()=>setOpen(false)}/></DialogContent></Dialog></PageLayout></ResponsaveisProvider>
}
const root=document.getElementById('root'); if(root) createRoot(root).render(<Check/>);
