"use client"; // Necessário para funcionar os inputs e botões no Next.js

import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { app, db } from "../../lib/firebase"; // Importamos o db também para salvar no banco
import { doc, setDoc } from "firebase/firestore"; // Ferramentas para salvar dados
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Login e Cadastro
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth(app);
    
    try {
      if (isLogin) {
        // --- MODO LOGIN (Entrar) ---
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/"); 
      } else {
        // --- MODO CADASTRO (Criar Conta) ---
        // 1. Cria o usuário no sistema de autenticação
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. O PULO DO GATO: Salva automaticamente no banco de dados como 'secretaria'
        await setDoc(doc(db, "usuarios", user.uid), {
          email: user.email,
          cargo: "secretaria", // Define o padrão. Depois você promove se quiser.
          criadoEm: new Date().toISOString()
        });

        alert("Conta criada com sucesso!");
        router.push("/");
      }

    } catch (error: any) {
      console.error(error);
      // Tratamento de erros comuns para facilitar
      if (error.code === 'auth/email-already-in-use') {
        alert("Este e-mail já está cadastrado.");
      } else if (error.code === 'auth/weak-password') {
        alert("A senha deve ter pelo menos 6 caracteres.");
      } else {
        alert("Erro: Verifique os dados e tente novamente.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {isLogin ? "Acesse sua conta" : "Criar nova conta"}
      </h1>
      
      <form onSubmit={handleAuth} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="exemplo@email.com"
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
            placeholder="********"
            required
          />
        </div>

        <button type="submit" style={styles.button}>
          {isLogin ? "Entrar" : "Confirmar Cadastro"}
        </button>

        {/* Botão para trocar entre Login e Cadastro */}
        <p style={{marginTop: '20px', fontSize: '14px', color: '#888'}}>
          {isLogin ? "Ainda não tem conta?" : "Já tem acesso?"}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={styles.linkToggle}
          >
            {isLogin ? " Criar agora" : " Fazer login"}
          </span>
        </p>

      </form>
    </div>
  );
}

// Estilos (Mantive o seu estilo Dark e adicionei o linkToggle)
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
  title: {
    marginBottom: "40px",
    fontSize: "24px",
    fontWeight: "normal",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "30px",
    width: "100%",
    maxWidth: "300px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    width: "100%",
    gap: "10px",
  },
  label: {
    color: "#888",
    fontSize: "14px",
  },
  input: {
    padding: "10px 0",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid #333",
    color: "#fff",
    outline: "none",
    fontSize: "16px",
  },
  button: {
    marginTop: "20px",
    padding: "10px 40px",
    backgroundColor: "transparent",
    border: "1px solid #333",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "5px",
    width: "100%", // Deixei full width para ficar mais bonito
  },
  linkToggle: {
    color: "#fff",
    cursor: "pointer",
    textDecoration: "underline",
    marginLeft: "5px",
    fontWeight: "bold" as const
  }
};