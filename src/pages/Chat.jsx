import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  Plus, 
  Settings, 
  Bot, 
  User, 
  RefreshCw,
  Paperclip,
  X,
  Sun,
  Moon,
  LogOut,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

export default function Chat() {
  const navigate = useNavigate();
  const { currentUser, userData, logout } = useAuth();

  const [pergunta, setPergunta] = useState('');
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [arquivosSelecionados, setArquivosSelecionados] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(() => Date.now().toString());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sincronizar o Dark Mode no HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Carregar histórico do Firebase quando entrar no chat
  useEffect(() => {
    const loadHistory = async () => {
      if (!currentUser) return;
      
      try {
        const chatsRef = collection(db, 'users', currentUser.uid, 'chats');
        const q = query(chatsRef, orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const loadedChats = [];
        querySnapshot.forEach((doc) => {
          loadedChats.push({ id: doc.id, ...doc.data() });
        });
        
        setChatHistory(loadedChats);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
    };
    
    loadHistory();
  }, [currentUser]);

  // Salvar no Firebase sempre que as mensagens atualizarem
  useEffect(() => {
    if (mensagens.length === 0 || !currentUser) return;
    
    const saveChat = async () => {
      const title = mensagens[0]?.content.substring(0, 30) + (mensagens[0]?.content.length > 30 ? '...' : '');
      
      const chatData = {
        difyConversationId: conversationId,
        messages: mensagens,
        title: title || 'Novo Chat',
        updatedAt: serverTimestamp()
      };

      try {
        const chatRef = doc(db, 'users', currentUser.uid, 'chats', currentChatId);
        await setDoc(chatRef, chatData, { merge: true });
        
        // Atualizar lista local
        setChatHistory(prev => {
          const existingChatIndex = prev.findIndex(c => c.id === currentChatId);
          if (existingChatIndex >= 0) {
            const newHistory = [...prev];
            newHistory[existingChatIndex] = { ...newHistory[existingChatIndex], ...chatData };
            return newHistory;
          } else {
            return [{ id: currentChatId, ...chatData }, ...prev];
          }
        });
      } catch (error) {
        console.error("Erro ao salvar chat:", error);
      }
    };
    
    saveChat();
  }, [mensagens, conversationId, currentChatId, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens, carregando]);

  const iniciarNovoChat = () => {
    if (mensagens.length === 0) return;
    setMensagens([]);
    setConversationId('');
    setArquivosSelecionados([]);
    setCurrentChatId(Date.now().toString());
  };

  const selecionarChat = (id) => {
    if (carregando) return;
    const chat = chatHistory.find(c => c.id === id);
    if (chat) {
      setCurrentChatId(id);
      setMensagens(chat.messages || []);
      setConversationId(chat.difyConversationId || '');
      setArquivosSelecionados([]);
    }
  };

  const excluirChat = async (e, id) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'chats', id));
      setChatHistory(prev => prev.filter(c => c.id !== id));
      
      if (currentChatId === id) {
        iniciarNovoChat();
      }
    } catch (error) {
      console.error("Erro ao excluir chat:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setArquivosSelecionados(prev => [...prev, ...Array.from(e.target.files)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (indexToRemove) => {
    setArquivosSelecionados(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const enviarPergunta = async (e) => {
    e.preventDefault();
    if ((!pergunta.trim() && arquivosSelecionados.length === 0) || carregando) return;

    const mensagemUser = pergunta;
    const arquivosEnviados = [...arquivosSelecionados];

    const novasMensagens = [...mensagens, { 
      role: 'user', 
      content: mensagemUser,
      files: arquivosEnviados.map(file => file.name)
    }];
    
    setMensagens(novasMensagens);
    setPergunta('');
    setArquivosSelecionados([]);
    setCarregando(true);

    try {
      const fileIds = [];

      if (arquivosEnviados.length > 0) {
        for (const arquivo of arquivosEnviados) {
          const formData = new FormData();
          formData.append('file', arquivo);
          formData.append('user', currentUser.uid);

          const endpointDify = import.meta.env.VITE_ENDPOINT_DIFY || '/api/dify';
          const uploadUrl = endpointDify.endsWith('/') ? `${endpointDify}files/upload` : `${endpointDify}/files/upload`;

          const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_API_DIFY}`
            },
            body: formData
          });

          if (!uploadRes.ok) throw new Error(`Erro ao fazer upload do arquivo ${arquivo.name}.`);
          
          const uploadData = await uploadRes.json();
          fileIds.push(uploadData.id);
        }
      }

      const endpointDify = import.meta.env.VITE_ENDPOINT_DIFY || '/api/dify';
      const url = endpointDify.endsWith('/') ? `${endpointDify}chat-messages` : `${endpointDify}/chat-messages`;
      
      const bodyParams = {
        inputs: {},
        query: mensagemUser,
        response_mode: "streaming",
        user: currentUser.uid
      };

      if (fileIds.length > 0) {
        bodyParams.files = fileIds.map(id => ({
          type: "document",
          transfer_method: "local_file",
          upload_file_id: id
        }));
      }

      if (conversationId) {
        bodyParams.conversation_id = conversationId;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_API_DIFY}`
        },
        body: JSON.stringify(bodyParams)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Erro de comunicação com o servidor.");
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partialAnswer = "";
      
      setMensagens([...novasMensagens, { role: 'assistant', content: partialAnswer }]);
      
      let newConversationId = conversationId;
      let buffer = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.startsWith('data: ')) {
            try {
              const dataStr = line.slice(6);
              const dataJson = JSON.parse(dataStr);
              
              if (dataJson.conversation_id && !newConversationId) {
                newConversationId = dataJson.conversation_id;
                setConversationId(newConversationId);
              }

              if (dataJson.event === 'agent_message' || dataJson.event === 'message') {
                partialAnswer += dataJson.answer;
                setMensagens([...novasMensagens, { role: 'assistant', content: partialAnswer }]);
              } else if (dataJson.event === 'error') {
                throw new Error(dataJson.message || "Erro no agente");
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error("Erro na API Dify:", err);
      setMensagens([...novasMensagens, { role: 'assistant', content: '❌ Erro ao consultar agente.' }]);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarPergunta(e);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <aside className="w-[260px] bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300">
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border cursor-pointer hover:bg-sidebar-accent/50 transition-colors group" onClick={() => navigate('/profile')}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 shrink-0 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
              {userData?.nome ? userData.nome.charAt(0).toUpperCase() : 'S'}
            </div>
            <span className="font-semibold text-sidebar-foreground truncate">
              {userData?.nome || currentUser?.email?.split('@')[0]}
            </span>
          </div>
          <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" title="Ver Perfil">
            <Settings size={16} />
          </button>
        </div>
        
        <button 
          className="m-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 font-medium hover:bg-primary/90 transition-colors"
          onClick={iniciarNovoChat}
        >
          <Plus size={18} />
          <span>Novo Chat</span>
        </button>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {chatHistory.map((chat) => (
            <div 
              key={chat.id} 
              className={`px-3 py-2.5 rounded-md flex items-center justify-between text-sm cursor-pointer transition-colors group ${currentChatId === chat.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}`}
              onClick={() => selecionarChat(chat.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate whitespace-nowrap">
                  {chat.title}
                </span>
              </div>
              <button 
                onClick={(e) => excluirChat(e, chat.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1"
                title="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-background">
        <header className="h-[60px] border-b border-border flex items-center px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10 justify-between">
          <div className="font-semibold flex items-center gap-2">
            <Bot size={24} className="text-primary" />
            <span>Agente Soraya</span>
          </div>
          <div className="flex gap-3">
            <button className="p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" onClick={toggleDarkMode} title="Alternar Tema">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" onClick={iniciarNovoChat} title="Limpar Conversa">
              <RefreshCw size={20} />
            </button>
            <button 
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors" 
              title="Sair"
              onClick={handleLogout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {mensagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
              <Bot size={64} className="text-primary opacity-80 mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">Como posso ajudar?</h2>
              <p className="max-w-[400px]">Faça uma pergunta sobre a estratégia do processo ou com base em seus documentos e eu encontrarei a resposta para você.</p>
            </div>
          ) : (
            <div className="max-w-[800px] w-full mx-auto flex flex-col gap-6 pb-5">
              {mensagens.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-emerald-500 text-white'}`}>
                    {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className={`max-w-[75%] px-4 py-3 rounded-xl text-[15px] leading-relaxed whitespace-pre-wrap break-words ${msg.role === 'assistant' ? 'bg-card text-card-foreground border border-border rounded-tl-sm' : 'bg-muted text-card-foreground rounded-tr-sm'}`}>
                    {msg.files && msg.files.length > 0 && (
                      <div className="flex flex-col gap-1 mb-2">
                        {msg.files.map((fileName, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-sm text-primary-foreground px-2.5 py-1.5 bg-primary/80 rounded-md self-start">
                            <Paperclip size={14} />
                            <span>{fileName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="prose dark:prose-invert max-w-none text-current">{msg.content}</span>
                  </div>
                </div>
              ))}
              
              {carregando && (
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
                    <Bot size={20} />
                  </div>
                  <div className="max-w-[75%] px-4 py-3 rounded-xl bg-card border border-border rounded-tl-sm">
                    <div className="flex gap-1 items-center h-6">
                      <span className="w-1.5 h-1.5 bg-card-foreground/50 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
                      <span className="w-1.5 h-1.5 bg-card-foreground/50 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
                      <span className="w-1.5 h-1.5 bg-card-foreground/50 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="px-6 py-5 bg-gradient-to-t from-background via-background/90 to-transparent">
          <form onSubmit={enviarPergunta} className="max-w-[800px] mx-auto relative bg-background border border-input rounded-xl p-3 flex flex-col items-stretch shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            
            {arquivosSelecionados.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {arquivosSelecionados.map((arquivo, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 bg-primary/10 rounded-lg text-[13px] text-primary">
                    <Paperclip size={14} />
                    <span>{arquivo.name}</span>
                    <button type="button" onClick={() => removeFile(idx)} className="p-0.5 hover:bg-primary/20 rounded text-inherit transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3 w-full">
              <button 
                type="button" 
                className="p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors mb-1" 
                onClick={() => fileInputRef.current?.click()}
                disabled={carregando}
                title="Anexar Documento"
              >
                <Paperclip size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple
              />

              <textarea
                className="flex-1 bg-transparent border-0 outline-none resize-none min-h-[24px] max-h-[200px] py-1 text-[15px] leading-relaxed"
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte algo sobre os documentos..."
                disabled={carregando}
                rows={1}
              />
              <button 
                type="submit" 
                className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors shrink-0 mb-1"
                disabled={carregando || (!pergunta.trim() && arquivosSelecionados.length === 0)}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
          <div className="text-center text-xs text-muted-foreground mt-3">
            IA pode cometer erros. Considere verificar as informações importantes.
          </div>
        </div>
      </main>
    </div>
  );
}
