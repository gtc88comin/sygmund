"use client";

import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../../lib/firebase"; 
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth(app);
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Conta criada com sucesso!");
      router.push("/login"); // Manda o usuário para o login depois de cadastrar
    } catch (error: any) {
      console.error(error);
      alert("Erro ao criar conta: " + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Crie sua conta</h1>
      
      <form onSubmit={handleRegister} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <button type="submit" style={styles.button}>
          Cadastrar
        </button>
      </form>
    </div>
  );
}

// Mantendo o mesmo estilo visual do Login
const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  title: { marginBottom: "40px", fontSize: "24px", fontWeight: "normal" },
  form: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "30px", width: "100%", maxWidth: "300px" },
  inputGroup: { display: "flex", flexDirection: "column" as const, width: "100%", gap: "10px" },
  label: { color: "#888", fontSize: "14px" },
  input: { padding: "10px 0", backgroundColor: "transparent", border: "none", borderBottom: "1px solid #333", color: "#fff", outline: "none", fontSize: "16px" },
  button: { marginTop: "20px", padding: "10px 40px", backgroundColor: "transparent", border: "1px solid #333", color: "#fff", fontSize: "16px", cursor: "pointer", borderRadius: "5px" }
};