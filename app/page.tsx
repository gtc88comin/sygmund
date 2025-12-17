"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { app, db } from "../lib/firebase"; // Adicionado db
import { doc, updateDoc, setDoc } from "firebase/firestore"; // Adicionado setDoc
import { useAuth } from "./contexts/AuthContext";

export default function HomePage() {
  const { user, cargo, loading } = useAuth();
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handlePromoteToAdmin = async () => {
    if (!user) return;
    try {
      // Use setDoc com merge para criar o documento se ele não existir
      await setDoc(doc(db, "usuarios", user.uid), {
        cargo: "admin",
        email: user.email // Garante que o email fica salvo
      }, { merge: true });
      alert("Sucesso! Você agora é Admin. A página será recarregada.");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao promover", error);
      alert("Erro ao promover conta.");
    }
  };

  const getNomeUsuario = () => {
    if (!user || !user.email) return "Visitante";
    const parteNome = user.email.split('@')[0];
    return parteNome.charAt(0).toUpperCase() + parteNome.slice(1);
  };

  if (loading) return <div style={styles.container}>Verificando permissões...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Sygmund <span style={{ fontSize: '0.5em', color: '#888' }}>v2</span></h1>
        <div style={styles.userInfo}>
          <span style={styles.userEmail}>{user?.email} ({cargo === 'admin' ? 'Admin' : 'Equipe'})</span>
          <button onClick={handleLogout} style={styles.logoutLink}>Sair</button>
        </div>
      </header>

      <main style={styles.main}>
        <h2 style={styles.welcome}>Olá, {getNomeUsuario()}!</h2>
        <p style={styles.subtitle}>Painel de Gestão Clínica</p>

        {/* BOTÃO DE EMERGÊNCIA/DEV PARA VIRAR ADMIN */}
        {/* LÓGICA DE SEGURANÇA: Botão só aparece para os donos */}
        {user?.email && ['gtc88comin@gmail.com', 'gtcomin@yahoo.com.br'].includes(user.email) && cargo !== 'admin' && (
          <div style={{ marginBottom: '20px', padding: '10px', background: '#332b00', borderRadius: '5px', border: '1px solid #ffd700' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ffd700' }}>🔧 Modo Desenvolvedor: Você não é admin.</p>
            <button onClick={handlePromoteToAdmin} style={{ ...styles.cardButton, width: 'auto', background: '#ffd700', color: '#000' }}>
              Virar Admin Agora
            </button>
          </div>
        )}

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>👥 Pacientes</h3>
            <p style={styles.cardText}>Fichas, contatos e prontuários.</p>
            <button style={styles.cardButton} onClick={() => router.push('/pacientes')}>Acessar Lista</button>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📅 Agenda</h3>
            <p style={styles.cardText}>Marcar consultas e ver horários.</p>
            <button style={styles.cardButton} onClick={() => router.push('/agenda')}>Acessar</button>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🏥 Convênios</h3>
            <p style={styles.cardText}>Gerenciar planos de saúde aceitos.</p>
            <button style={styles.cardButton} onClick={() => router.push('/convenios')}>Gerenciar</button>
          </div>

          {/* 👇 SÓ MOSTRA SE FOR ADMIN */}
          {cargo === 'admin' && (
            <div style={{ ...styles.card, border: '1px solid #333' }}>
              <h3 style={{ ...styles.cardTitle, color: '#4caf50' }}>💰 Financeiro</h3>
              <p style={styles.cardText}>Histórico de atendimentos e caixa.</p>
              <button style={styles.cardButton} onClick={() => router.push('/atendimentos')}>
                Ver Caixa
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#121212", color: "#e0e0e0", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #333", backgroundColor: "#1e1e1e" },
  logo: { margin: 0, fontSize: "24px", color: "#fff" },
  userInfo: { display: "flex", gap: "20px", alignItems: "center" },
  userEmail: { fontSize: "14px", color: "#aaa" },
  logoutLink: { background: "none", border: "none", color: "#ff5f5f", cursor: "pointer", fontSize: "14px" },
  main: { padding: "40px", maxWidth: "1000px", margin: "0 auto" },
  welcome: { fontSize: "32px", marginBottom: "10px", color: "#fff" },
  subtitle: { fontSize: "16px", color: "#888", marginBottom: "40px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "8px", display: "flex", flexDirection: "column" as const, gap: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" },
  cardTitle: { margin: 0, fontSize: "18px", color: "#fff" },
  cardText: { fontSize: "13px", color: "#aaa", flexGrow: 1 },
  cardButton: { padding: "10px", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "10px", fontWeight: "bold", width: "100%" }
};