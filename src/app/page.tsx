'use client'

import { useState, useEffect } from 'react'
import { Plus, Bell, X, Calendar, Clock, Save, Trash2, ExternalLink } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  alarmDate?: Date
  alarmTime?: string
  isAlarmActive: boolean
}

interface Ad {
  id: string
  title: string
  description: string
  link: string
  image?: string
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    alarmDate: '',
    alarmTime: ''
  })

  // Ads discretas para o rodapé
  const ads: Ad[] = [
    {
      id: '1',
      title: 'Organize sua vida!',
      description: 'Descubra o melhor app de produtividade',
      link: 'https://example.com/productivity'
    },
    {
      id: '2', 
      title: 'Cursos Online',
      description: 'Aprenda novas habilidades hoje mesmo',
      link: 'https://example.com/courses'
    },
    {
      id: '3',
      title: 'Backup na Nuvem',
      description: 'Nunca perca suas anotações importantes',
      link: 'https://example.com/backup'
    }
  ]

  const [currentAdIndex, setCurrentAdIndex] = useState(0)

  // Carregar notas do localStorage com tratamento de erro aprimorado
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('floating-notes')
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          alarmDate: note.alarmDate ? new Date(note.alarmDate) : undefined
        }))
        setNotes(parsedNotes)
      }
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
      localStorage.removeItem('floating-notes')
    }
  }, [])

  // Salvar notas no localStorage com tratamento de erro
  useEffect(() => {
    try {
      if (notes.length >= 0) {
        localStorage.setItem('floating-notes', JSON.stringify(notes))
      }
    } catch (error) {
      console.error('Erro ao salvar notas:', error)
    }
  }, [notes])

  // Rotacionar anúncios a cada 15 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % ads.length)
    }, 15000)
    return () => clearInterval(interval)
  }, [ads.length])

  // Verificar alarmes
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date()
      notes.forEach(note => {
        if (note.isAlarmActive && note.alarmDate && note.alarmTime) {
          const [hours, minutes] = note.alarmTime.split(':')
          const alarmDateTime = new Date(note.alarmDate)
          alarmDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          
          if (now >= alarmDateTime && now.getTime() - alarmDateTime.getTime() < 60000) {
            // Mostrar notificação
            if (Notification.permission === 'granted') {
              new Notification(`Lembrete: ${note.title}`, {
                body: note.content,
                icon: '/icon.svg'
              })
            }
            // Desativar alarme após disparar
            setNotes(prev => prev.map(n => 
              n.id === note.id ? { ...n, isAlarmActive: false } : n
            ))
          }
        }
      })
    }

    const interval = setInterval(checkAlarms, 30000) // Verificar a cada 30 segundos
    return () => clearInterval(interval)
  }, [notes])

  // Solicitar permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const createNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return

    // Verificar se já existe uma nota com o mesmo conteúdo
    const duplicateNote = notes.find(note => 
      note.title.trim().toLowerCase() === newNote.title.trim().toLowerCase() && 
      note.content.trim().toLowerCase() === newNote.content.trim().toLowerCase()
    )

    if (duplicateNote) {
      alert('Já existe uma nota com o mesmo título e conteúdo!')
      return
    }

    const note: Note = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID mais único
      title: newNote.title || 'Nota sem título',
      content: newNote.content,
      createdAt: new Date(),
      alarmDate: newNote.alarmDate ? new Date(newNote.alarmDate) : undefined,
      alarmTime: newNote.alarmTime || undefined,
      isAlarmActive: !!(newNote.alarmDate && newNote.alarmTime)
    }

    setNotes(prev => [note, ...prev])
    setNewNote({ title: '', content: '', alarmDate: '', alarmTime: '' })
    setIsCreating(false)
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
  }

  const toggleAlarm = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isAlarmActive: !note.isAlarmActive } : note
    ))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 pb-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Notas Flutuantes
          </h1>
          <p className="text-gray-600 text-lg">
            Suas anotações com alarmes inteligentes
          </p>
        </div>

        {/* Botão Criar Nota */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-3 text-lg font-semibold"
          >
            <Plus className="w-6 h-6" />
            Nova Nota
          </button>
        </div>

        {/* Modal de Criação */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 transform animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Nova Nota</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Título da nota..."
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />

                <textarea
                  placeholder="Escreva sua nota aqui..."
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none"
                />

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Configurar Alarme (Opcional)
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Data</label>
                      <input
                        type="date"
                        value={newNote.alarmDate}
                        onChange={(e) => setNewNote(prev => ({ ...prev, alarmDate: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Hora</label>
                      <input
                        type="time"
                        value={newNote.alarmTime}
                        onChange={(e) => setNewNote(prev => ({ ...prev, alarmTime: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={createNote}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid de Notas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map((note, index) => (
            <div
              key={note.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20 animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-800 text-lg leading-tight">
                  {note.title}
                </h3>
                <div className="flex gap-1">
                  {note.alarmDate && note.alarmTime && (
                    <button
                      onClick={() => toggleAlarm(note.id)}
                      className={`p-2 rounded-full transition-colors ${
                        note.isAlarmActive 
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={note.isAlarmActive ? 'Alarme ativo' : 'Alarme inativo'}
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Excluir nota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
                {note.content}
              </p>

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Criada em {formatDate(note.createdAt)} às {formatTime(note.createdAt)}
                </div>
                
                {note.alarmDate && note.alarmTime && (
                  <div className={`flex items-center gap-2 ${note.isAlarmActive ? 'text-yellow-600' : 'text-gray-400'}`}>
                    <Clock className="w-3 h-3" />
                    Alarme: {formatDate(note.alarmDate)} às {note.alarmTime}
                    {note.isAlarmActive && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        Ativo
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Estado Vazio */}
        {notes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Nenhuma nota ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Crie sua primeira nota flutuante com alarme personalizado
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Criar primeira nota
            </button>
          </div>
        )}
      </div>

      {/* Banner de Propaganda Discreto - Fixo na parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-800 truncate">
                  {ads[currentAdIndex].title}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {ads[currentAdIndex].description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <a 
                href={ads[currentAdIndex].link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:shadow-md transition-all flex items-center gap-1 font-medium"
              >
                Ver
                <ExternalLink className="w-3 h-3" />
              </a>
              
              {/* Indicadores de navegação */}
              <div className="flex gap-1 ml-2">
                {ads.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAdIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentAdIndex 
                        ? 'bg-cyan-500' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}