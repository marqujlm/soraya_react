import React, { useState } from 'react';
import { Bot, Mail, Lock, User, Phone, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    senha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await register(formData.email, formData.senha, {
        nome: formData.nome,
        telefone: formData.telefone,
        empresa: formData.empresa
      });
      
      setSuccess(`Usuário ${formData.nome} cadastrado com sucesso!`);
      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        empresa: '',
        senha: ''
      });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao cadastrar usuário. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4 relative overflow-y-auto">
      <div className="w-full max-w-[500px] bg-card text-card-foreground rounded-2xl shadow-xl border border-border overflow-hidden z-10">
        <div className="p-8 text-center pb-6 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Painel Admin - Cadastro</h1>
          <p className="text-muted-foreground text-sm">
            Crie licenças individuais preenchendo os dados do cliente.
          </p>
        </div>

        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 text-sm rounded-lg text-center">
                {success}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Nome Completo</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="nome"
                  className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
                  placeholder="Nome do cliente"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Email</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
                    placeholder="email@empresa.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Telefone</label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="telefone"
                    className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Empresa</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <Building2 size={18} />
                </div>
                <input
                  type="text"
                  name="empresa"
                  className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
                  placeholder="Nome da empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Senha de Acesso</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="senha"
                  className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm pl-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-4 py-2 w-full mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                'Cadastrar Usuário'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Lembre-se de enviar as credenciais para o cliente com segurança.
          </div>
        </div>
      </div>
      
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
