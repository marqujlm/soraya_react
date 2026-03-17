import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building2, ArrowLeft, Bot, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { currentUser, userData, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: userData?.nome || '',
    telefone: userData?.telefone || '',
    empresa: userData?.empresa || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!currentUser) return null;

  const handleEditClick = () => {
    setIsEditing(true);
    setFormData({
      nome: userData?.nome || '',
      telefone: userData?.telefone || '',
      empresa: userData?.empresa || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile({
        nome: formData.nome,
        telefone: formData.telefone,
        empresa: formData.empresa
      });
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center">
      <div className="w-full max-w-[600px] mt-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          <span>Voltar para o Chat</span>
        </button>

        <div className="bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-sm">
          {/* Cabeçalho do Perfil */}
          <div className="bg-primary/10 p-8 flex flex-col items-center border-b border-border relative">
            {!isEditing && (
              <button 
                onClick={handleEditClick}
                className="absolute top-4 right-4 p-2 bg-background/50 hover:bg-background rounded-full text-muted-foreground hover:text-foreground transition-all"
                title="Editar Perfil"
              >
                <Edit2 size={18} />
              </button>
            )}

            <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-lg ring-4 ring-background">
              {userData?.nome ? userData.nome.charAt(0).toUpperCase() : <User size={40} />}
            </div>
            <h1 className="text-2xl font-bold">{userData?.nome || 'Usuário'}</h1>
            <p className="text-muted-foreground">{userData?.role === 'admin' ? 'Administrador' : 'Usuário Padrão'}</p>
          </div>

          {/* Dados do Perfil */}
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
              <h2 className="text-lg font-semibold">Informações da Conta</h2>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCancelClick}
                    disabled={isSaving}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    title="Cancelar"
                  >
                    <X size={18} />
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-1.5 text-primary hover:text-primary-foreground hover:bg-primary rounded-md transition-colors"
                    title="Salvar"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                  </button>
                </div>
              )}
            </div>
            
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

            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-lg text-muted-foreground mt-1">
                <User size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium mb-1">Nome Completo</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="nome"
                    value={formData.nome} 
                    onChange={handleChange}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                ) : (
                  <p className="text-foreground pt-1">{userData?.nome || 'Não informado'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-lg text-muted-foreground mt-1">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium mb-1">Endereço de E-mail</p>
                <p className="text-muted-foreground pt-1">{currentUser.email} <span className="text-xs ml-2 opacity-70">(Não alterável)</span></p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-lg text-muted-foreground mt-1">
                <Phone size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium mb-1">Telefone</p>
                {isEditing ? (
                  <input 
                    type="tel" 
                    name="telefone"
                    value={formData.telefone} 
                    onChange={handleChange}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                ) : (
                  <p className="text-foreground pt-1">{userData?.telefone || 'Não informado'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-lg text-muted-foreground mt-1">
                <Building2 size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium mb-1">Empresa</p>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="empresa"
                    value={formData.empresa} 
                    onChange={handleChange}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                ) : (
                  <p className="text-foreground pt-1">{userData?.empresa || 'Não informado'}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-lg text-muted-foreground mt-1">
                <Bot size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium mb-1">Status da Licença</p>
                <p className="text-emerald-500 font-medium pt-1">Ativa</p>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-border mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
