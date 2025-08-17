"use client";

import { useState } from 'react';

interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'main' | 'side' | 'personal' | 'guild';
  status: 'open' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: {
    current: number;
    total: number;
    description?: string;
  };
  rewards?: string[];
  location?: string;
  giver?: string;
  timeLimit?: number; // in game hours
  note?: string;
}

interface QuestsTabProps {
  quests?: { title: string; status: 'open' | 'done'; note?: string }[];
}

export default function QuestsTab({ quests: gameQuests = [] }: QuestsTabProps) {
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'main' | 'side' | 'personal' | 'guild'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Enhanced quest data (this would come from a more comprehensive quest system)
  const enhancedQuests: Quest[] = [
    // Convert game quests to enhanced format
    ...gameQuests.map((quest, index) => ({
      id: `quest-${index}`,
      title: quest.title,
      description: quest.note || 'Eine wichtige Aufgabe wartet auf Erledigung.',
      category: 'main' as const,
      status: quest.status === 'done' ? 'completed' as const : 'in-progress' as const,
      priority: 'medium' as const,
      progress: {
        current: quest.status === 'done' ? 1 : 0,
        total: 1,
        description: quest.status === 'done' ? 'Abgeschlossen' : 'In Bearbeitung'
      },
      note: quest.note
    })),
    
    // Additional sample quests for demonstration
    {
      id: 'main-1',
      title: 'Das verschollene Artefakt',
      description: 'Findet das mächtige Kristall der Ewigkeit, das tief in den Ruinen von Aethermoor verborgen liegt.',
      category: 'main',
      status: 'in-progress',
      priority: 'high',
      progress: { current: 2, total: 4, description: 'Ruinen entdeckt, Schlüssel gefunden' },
      rewards: ['5000 XP', 'Kristall der Ewigkeit', 'Goldener Ring'],
      location: 'Ruinen von Aethermoor',
      giver: 'Erzmagier Theron'
    },
    {
      id: 'side-1',
      title: 'Der verlorene Hund',
      description: 'Helft der alten Dame beim Marktplatz, ihren entlaufenen Hund Bello zu finden.',
      category: 'side',
      status: 'open',
      priority: 'low',
      progress: { current: 0, total: 1, description: 'Noch nicht begonnen' },
      rewards: ['50 Goldstücke', 'Hundeleckerli (5x)'],
      location: 'Marktplatz',
      giver: 'Alte Greta'
    },
    {
      id: 'personal-1',
      title: 'Familienehre wiederherstellen',
      description: 'Entlarvt den wahren Verräter, der eure Familie in Ungnade fallen ließ.',
      category: 'personal',
      status: 'in-progress',
      priority: 'high',
      progress: { current: 1, total: 3, description: 'Erste Hinweise gesammelt' },
      rewards: ['Familienwappen', 'Adelstitel', '2000 XP'],
      giver: 'Persönliche Vendetta'
    }
  ];

  const getQuestsByFilter = () => {
    return enhancedQuests.filter(quest => {
      const categoryMatch = activeFilter === 'all' || quest.category === activeFilter;
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'active' && ['open', 'in-progress'].includes(quest.status)) ||
        (statusFilter === 'completed' && quest.status === 'completed');
      return categoryMatch && statusMatch;
    });
  };

  const getQuestCategoryColor = (category: Quest['category']) => {
    const colors = {
      main: 'bg-red-100 text-red-800 border-red-200',
      side: 'bg-blue-100 text-blue-800 border-blue-200',
      personal: 'bg-purple-100 text-purple-800 border-purple-200',
      guild: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[category];
  };

  const getQuestStatusColor = (status: Quest['status']) => {
    const colors = {
      open: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Quest['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority];
  };

  const getProgressPercentage = (quest: Quest) => {
    return Math.round((quest.progress.current / quest.progress.total) * 100);
  };

  const filteredQuests = getQuestsByFilter();
  const completedCount = enhancedQuests.filter(q => q.status === 'completed').length;
  const activeCount = enhancedQuests.filter(q => ['open', 'in-progress'].includes(q.status)).length;

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto scroll-fantasy pr-2">
      {/* Quest Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-amber-700">{activeCount}</div>
            <div className="text-xs text-amber-600">Aktive Quests</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-700">{completedCount}</div>
            <div className="text-xs text-green-600">Abgeschlossen</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'main', 'side', 'personal', 'guild'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              {filter === 'all' ? 'Alle' :
               filter === 'main' ? 'Haupt' :
               filter === 'side' ? 'Neben' :
               filter === 'personal' ? 'Persönlich' :
               'Gilde'}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                statusFilter === filter
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {filter === 'all' ? 'Alle' :
               filter === 'active' ? 'Aktiv' :
               'Abgeschlossen'}
            </button>
          ))}
        </div>
      </div>

      {/* Quest List */}
      {filteredQuests.length > 0 ? (
        <div className="space-y-3">
          {filteredQuests.map((quest) => (
            <div
              key={quest.id}
              className={`border rounded-lg transition-all cursor-pointer ${
                selectedQuest === quest.id
                  ? 'border-amber-400 bg-amber-50 shadow-md'
                  : 'border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
              }`}
              onClick={() => setSelectedQuest(selectedQuest === quest.id ? null : quest.id)}
            >
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-1">{quest.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded border ${getQuestCategoryColor(quest.category)}`}>
                        {quest.category === 'main' ? 'Hauptquest' :
                         quest.category === 'side' ? 'Nebenquest' :
                         quest.category === 'personal' ? 'Persönlich' :
                         'Gildenquest'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getQuestStatusColor(quest.status)}`}>
                        {quest.status === 'open' ? 'Offen' :
                         quest.status === 'in-progress' ? 'Laufend' :
                         quest.status === 'completed' ? 'Abgeschlossen' :
                         'Fehlgeschlagen'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(quest.priority)}`}>
                        {quest.priority === 'low' ? 'Niedrig' :
                         quest.priority === 'medium' ? 'Mittel' :
                         quest.priority === 'high' ? 'Hoch' :
                         'Dringend'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-amber-600 mb-1">
                    <span>Fortschritt</span>
                    <span>{quest.progress.current}/{quest.progress.total} ({getProgressPercentage(quest)}%)</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${getProgressPercentage(quest)}%` }}
                    />
                  </div>
                  {quest.progress.description && (
                    <div className="text-xs text-amber-600 mt-1">{quest.progress.description}</div>
                  )}
                </div>

                <p className="text-xs text-amber-700">{quest.description}</p>

                {/* Expanded Details */}
                {selectedQuest === quest.id && (
                  <div className="border-t border-amber-200 pt-3 mt-3 space-y-2">
                    {quest.location && (
                      <div className="flex items-center gap-2 text-xs">
                        <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-amber-600">Ort:</span>
                        <span className="text-amber-800">{quest.location}</span>
                      </div>
                    )}
                    
                    {quest.giver && (
                      <div className="flex items-center gap-2 text-xs">
                        <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-amber-600">Auftraggeber:</span>
                        <span className="text-amber-800">{quest.giver}</span>
                      </div>
                    )}

                    {quest.timeLimit && (
                      <div className="flex items-center gap-2 text-xs">
                        <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-amber-600">Zeitlimit:</span>
                        <span className="text-amber-800">{quest.timeLimit} Stunden</span>
                      </div>
                    )}

                    {quest.rewards && quest.rewards.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="text-amber-600 font-medium">Belohnungen:</span>
                        </div>
                        <div className="ml-5 space-y-1">
                          {quest.rewards.map((reward, i) => (
                            <div key={i} className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                              {reward}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {quest.note && (
                      <div className="bg-blue-50 rounded p-2 border border-blue-200">
                        <div className="text-xs font-medium text-blue-800 mb-1">Notizen:</div>
                        <div className="text-xs text-blue-700">{quest.note}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-amber-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-amber-600 mb-2">Keine Quests gefunden</p>
          <p className="text-xs text-amber-500">Ändert die Filter oder startet ein neues Abenteuer</p>
        </div>
      )}
    </div>
  );
}