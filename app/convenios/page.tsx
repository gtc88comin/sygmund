"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function GestaoConvenios() {
  const [form, setForm] = useState({ nome: "", telefone: "", email: "" });
  const [listaPlanos, setListaPlanos] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    carregarPlanos();
  }, []);

  const carregarPlanos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "convenios"));
      const planosBanco = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setListaPlanos(planosBanco);
    } catch (e) {
      console.error("Erro ao carregar", e);
    }
  };

  const adicionarPlano = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.nome) return;

    try {
      await addDoc(collection(db, "convenios"), {
        ...form,
        ativo: true
      });
      setForm({ nome: "", telefone: "", email: "" });
      carregarPlanos();
    } catch (error) {
      console.error("Erro", error);
    }
  };

  const gerarDadosTeste = async () => {
    if (!confirm("Isso vai adicionar planos de exemplo. Quer continuar?")) return;

    const exemplos = [
      { nome: "Unimed (Autorização)", telefone: "0800 999 8888", email: "autorizacao@unimed.com.br" },
      { nome: "BRF Saúde", telefone: "0800 777 5555", email: "contato@brf.com" },
      { nome: "Teste Particular (Gustavo)", telefone: "54 9 81268754", email: "gustavo@teste.com" }
    ];

    for (const ex of exemplos) {
      await addDoc(collection(db, "convenios"), { ...ex, ativo: true });
    }
    carregarPlanos();
  };

  const excluirPlano = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este plano?")) {
      await deleteDoc(doc(db, "convenios", id));
      carregarPlanos();
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Lista Telefônica de Convênios</h1>
        <button onClick={gerarDadosTeste} style={styles.seedButton}>⚡ Gerar Exemplos</button>
      </header>

      {/* Formulário */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Novo Contato</h3>
        <form onSubmit={adicionarPlano} style={styles.formGrid}>
          <input
            style={styles.input}
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Nome (Ex: Unimed)"
            required
          />
          <input
            style={styles.input}
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            placeholder="Telefone / URA"
          />
          <input
            style={styles.input}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email (Opcional)"
          />
          <button type="submit" style={styles.addButton}>Salvar</button>
        </form>
      </div>

      {/* Lista */}
      <div style={styles.listContainer}>
        {listaPlanos.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>Nenhum contato salvo.</p>}

        {listaPlanos.map((plano) => (
          <div key={plano.id} style={styles.listItem}>
            <div style={styles.infoArea}>
              <strong style={styles.planoName}>{plano.nome}</strong>
              <div style={styles.contactRow}>
                {plano.telefone && <span style={styles.contactItem}>📞 {plano.telefone}</span>}
                {plano.email && <span style={styles.contactItem}>📧 {plano.email}</span>}
              </div>
            </div>
            <div style={styles.actions}>
              {plano.telefone && (
                <button
                  onClick={() => window.open(`https://wa.me/55${plano.telefone.replace(/\D/g, '')}`, '_blank')}
                  style={styles.actionButton}
                  title="Chamar no WhatsApp"
                >
                  💬 Zap
                </button>
              )}
              <button onClick={() => excluirPlano(plano.id)} style={styles.deleteButton}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => router.push("/")} style={styles.backButton}>Voltar ao Início</button>
    </div>
  );
}

const styles = {
  container: { padding: "40px 20px", maxWidth: "800px", margin: "0 auto", color: "#e0e0e0", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: { margin: 0, fontSize: "24px" },
  seedButton: { padding: "8px 16px", backgroundColor: "#333", color: "#ffd700", border: "1px solid #555", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
  card: { backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", marginBottom: "30px", border: "1px solid #333" },
  cardTitle: { marginTop: 0, marginBottom: "15px", fontSize: "16px", color: "#aaa" },
  formGrid: { display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr auto", gap: "10px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#2c2c2c", color: "#fff", outline: "none" },
  addButton: { padding: "10px 20px", backgroundColor: "#2196f3", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
  listContainer: { display: "flex", flexDirection: "column" as const, gap: "10px" },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", backgroundColor: "#1e1e1e", borderRadius: "5px", borderLeft: "4px solid #444" },
  infoArea: { display: "flex", flexDirection: "column" as const, gap: "5px" },
  planoName: { fontSize: "16px", color: "#fff" },
  contactRow: { display: "flex", gap: "15px", fontSize: "13px", color: "#888" },
  contactItem: { display: "flex", alignItems: "center", gap: "5px" },
  actions: { display: "flex", gap: "10px" },
  actionButton: { padding: "5px 10px", backgroundColor: "#25D366", color: "#000", border: "none", borderRadius: "3px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" },
  deleteButton: { backgroundColor: "transparent", color: "#ff4444", border: "1px solid #ff4444", padding: "5px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "12px" },
  backButton: { display: "block", marginTop: "40px", background: "none", border: "none", color: "#888", cursor: "pointer", textDecoration: "underline", width: "100%" }
};