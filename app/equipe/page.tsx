"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function GestaoEquipe() {
  const { user, cargo, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && cargo !== 'admin') {
      router.push("/");
    }
  }, [cargo, authLoading, router]);

  useEffect(() => {
    if (cargo === 'admin') {
      carregarEquipe();
    }
  }, [cargo]);

  const carregarEquipe = async () => {
    setLoading(true);
    try {
      // Busca todos os documentos da coleção 'usuarios'
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const lista = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
      setUsuarios(lista);
    } catch (error) {
      console.error("Erro ao buscar equipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const alterarCargo = async (uid: string, novoCargo: "admin" | "secretaria") => {
    if (!confirm(`Tem certeza que deseja mudar o cargo para ${novoCargo}?`)) return;

    try {
      const userRef = doc(db, "usuarios", uid);
      await updateDoc(userRef, { cargo: novoCargo });
      alert("Cargo atualizado!");
      carregarEquipe(); // Recarrega a lista
    } catch (error) {
      alert("Erro ao atualizar.");
    }
  };

  const removerAcesso = async (uid: string) => {
    if (!confirm("Isso irá BLOQUEAR o acesso deste usuário ao sistema. O login continuará existindo, mas ele não verá nada. Continuar?")) return;

    try {
      await deleteDoc(doc(db, "usuarios", uid));
      alert("Acesso removido!");
      carregarEquipe();
    } catch (error) {
      alert("Erro ao remover.");
    }
  };

  if (authLoading || cargo !== 'admin') return null;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Gestão de Equipe</h1>
        <button onClick={() => router.push("/")} style={styles.backButton}>Voltar ao Painel</button>
      </header>

      <div style={styles.card}>
        <p style={{ marginBottom: '20px', color: '#aaa' }}>
          <strong>Dica:</strong> Para adicionar um novo funcionário, abra uma
          <span style={{ color: '#fff', fontWeight: 'bold' }}> Janela Anônima</span>,
          acesse o sistema e crie a conta dele. Depois, volte aqui para definir o cargo.
        </p>

        <table style={styles.table}>
          <thead>
            <tr style={styles.trHeader}>
              <th style={styles.th}>Email (ID)</th>
              <th style={styles.th}>Cargo Atual</th>
              <th style={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.uid} style={styles.tr}>
                <td style={styles.td}>
                  {/* Se tiver email salvo mostra, senão mostra o UID */}
                  {u.email || <span style={{ fontSize: '12px', color: '#666' }}>ID: {u.uid}</span>}
                  {u.uid === user?.uid && <span style={styles.badgeEu}>Você</span>}
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: u.cargo === 'admin' ? '#4caf50' : '#ff9800'
                  }}>
                    {u.cargo ? u.cargo.toUpperCase() : 'SEM CARGO'}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {u.cargo !== 'admin' && (
                      <button onClick={() => alterarCargo(u.uid, 'admin')} style={styles.btnPromover}>
                        Promover a Admin
                      </button>
                    )}
                    {u.cargo !== 'secretaria' && (
                      <button onClick={() => alterarCargo(u.uid, 'secretaria')} style={styles.btnRebaixar}>
                        Tornar Secretária
                      </button>
                    )}
                    {u.uid !== user?.uid && ( // Não pode se deletar
                      <button onClick={() => removerAcesso(u.uid)} style={styles.btnDelete}>
                        Remover Acesso
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#121212", color: "#e0e0e0", padding: "40px 20px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", maxWidth: "900px", margin: "0 auto" },
  title: { fontSize: "28px", margin: 0, color: "#fff" },
  backButton: { background: "none", border: "1px solid #666", color: "#888", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" },
  card: { backgroundColor: "#1e1e1e", padding: "30px", borderRadius: "10px", maxWidth: "900px", margin: "0 auto", border: "1px solid #333" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  trHeader: { backgroundColor: "#2c2c2c", textAlign: "left" as const },
  th: { padding: "15px", color: "#aaa", fontSize: "14px", fontWeight: "normal" },
  tr: { borderBottom: "1px solid #333" },
  td: { padding: "15px", fontSize: "15px" },
  badge: { padding: "4px 8px", borderRadius: "4px", fontSize: "10px", color: "#fff", fontWeight: "bold" },
  badgeEu: { marginLeft: '10px', backgroundColor: '#2196f3', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#fff' },
  btnPromover: { padding: "5px 10px", backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "12px" },
  btnRebaixar: { padding: "5px 10px", backgroundColor: "#ff9800", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "12px" },
  btnDelete: { padding: "5px 10px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }
};