import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { API } from '../config/api-endpoints';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ImagePicker from '@/components/ImagePicker';
import ImageViewerModal from '@/components/ImageViewerModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { DialogDto, MessageDto, ListingDto } from '@/types/dto';
import CoverImage from '@/components/CoverImage';
import ListingSelector from '@/components/ListingSelector';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import ComplaintModal from "@/components/ComplaintModal.tsx";


const DialogsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDialogId = Number(searchParams.get('dialogId'));
  const [dialogs, setDialogs] = useState<DialogDto[]>([]);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const [messageText, setMessageText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [viewer, setViewer] = useState<{ images: string[]; index: number } | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<ListingDto | null>(null);

  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintTargetId, setComplaintTargetId] = useState<number | null>(null);

  const navigate = useNavigate();

  const selectedDialog = dialogs.find(d => d.dialogId === selectedDialogId);
  const [selectedTab, setSelectedTab] = useState<'incoming' | 'outgoing'>('outgoing');

  const incomingDialogs = dialogs.filter(d => d.listingOwnerId === user?.id);
  const outgoingDialogs = dialogs.filter(d => d.listingOwnerId !== user?.id);
  const visibleDialogs = selectedTab === 'incoming' ? incomingDialogs : outgoingDialogs;

  const isOwner = selectedDialog?.listingOwnerId === user?.id;
  // const otherUser = isOwner ? messages.find(m => m.authorId !== user?.id) : null;
  const otherUser = messages.find(m => m.authorId !== user?.id);
  console.log({messages, otherUser})

  const handleApproveExchange = async (exchangeId: number) => {
    try {
      await api.patch(`/api/exchange/${exchangeId}/approve`);
      loadMessages(0, true);
    } catch {
      alert('Не удалось принять обмен');
    }
  };

  const handleRejectExchange = async (exchangeId: number) => {
    try {
      await api.patch(`/api/exchange/${exchangeId}/reject`);
      loadMessages(0, true);
    } catch {
      alert('Не удалось отклонить обмен');
    }
  };

  useEffect(() => {
    api.get(API.MESSAGES.USER_DIALOGS)
      .then(res => setDialogs(res.data))
      .catch(() => alert('Не удалось загрузить список диалогов'));
  }, []);

  useEffect(() => {
    if (!selectedDialogId) return;
    setMessages([]);
    setPage(0);
    setHasMore(true);
    loadMessages(0, true);
  }, [selectedDialogId]);

  const loadMessages = async (p: number, replace = false) => {
    if (!selectedDialogId) return;
    setLoadingMore(true);
    try {
      const res = await api.get(`${API.MESSAGES.DIALOG_MESSAGES(selectedDialogId)}?page=${p}&size=20`);
      setMessages(prev => replace ? res.data : [...res.data, ...prev]);
      setHasMore(res.data.length === 20);
      setPage(p + 1);
    } catch {
      alert('Не удалось загрузить сообщения');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    if (!selectedDialog || selectedDialog.listingId == null) {
      alert('Не удалось определить объявление');
      return;
    }

    if (selectedOffer) {
      try {
        await api.post(API.MESSAGES.PROPOSE_EXCHANGE(selectedDialog.listingId, selectedOffer.id));
        setSelectedOffer(null);
        loadMessages(0, true);
      } catch (err: any) {
        if (err?.response?.status === 409) {
          alert('Одна из книг уже участвует в другом обмене');
        } else {
          alert('Не удалось предложить книгу для обмена');
        }
      }
      return;
    }

    if (!messageText.trim() && images.length === 0) {
      alert('Сообщение пустое');
      return;
    }

    const form = new FormData();
    form.append('content', messageText);
    images.forEach(img => form.append('images', img));

    try {
      await api.post(API.MESSAGES.SEND(selectedDialog.listingId), form);
      setMessageText('');
      setImages([]);
      loadMessages(0, true);
    } catch {
      alert('Не удалось отправить сообщение');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-1/3 border-r overflow-y-auto p-4">
        <h2 className="text-xl font-semibold mb-2">Чаты</h2>
        <div className="flex gap-2 mb-4">
          <Button variant={selectedTab === 'outgoing' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTab('outgoing')}>Исходящие</Button>
          <Button variant={selectedTab === 'incoming' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTab('incoming')}>Мои объявления</Button>
        </div>

        {visibleDialogs.length === 0 ? (
          <div className="text-muted-foreground">Пусто</div>
        ) : (
          <ul className="space-y-4">
            {visibleDialogs.map(dialog => (
              <li
                key={dialog.dialogId ?? `dialog-${Math.random()}`}
                onClick={() => {
                  if (dialog.dialogId != null) {
                    setSearchParams({ dialogId: dialog.dialogId.toString() });
                  }
                }}
                className={`cursor-pointer p-2 rounded hover:bg-muted ${dialog.dialogId === selectedDialogId ? 'bg-muted font-semibold' : ''}`}
              >
                <div className="text-sm">{dialog.bookTitle} — {dialog.bookAuthor}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {dialog.lastMessageAuthor}: {dialog.lastMessageContent}
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className="w-2/3 flex flex-col">
        {selectedDialog ? (
          <>
            <div className="border-b p-4 flex justify-between items-start gap-4">
              <div className="flex gap-4">
                <CoverImage src={selectedDialog.bookImageUrl} className="w-20 h-28 rounded" />
                <div className="space-y-1 mt-1">
                  <div className="font-semibold">{selectedDialog.bookTitle}</div>
                  <div className="text-sm text-muted-foreground">{selectedDialog.bookAuthor}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="text-right mr-2">
                  <div className="font-medium">
                    {isOwner ? otherUser?.authorName : selectedDialog.listingOwnerName}
                  </div>
                </div>
                <img
                  src={selectedDialog.listingOwnerAvatar || '/default-avatar.jpg'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <DropdownMenu
                  trigger={<Button size="icon" variant="ghost">⋮</Button>}
                  align="right"
                >
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/profile/${otherUser?.authorId}?tab=reviews&listingId=${selectedDialog.listingId}`)
                      }
                    >
                      Оставить отзыв
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setComplaintTargetId(otherUser?.authorId || null);
                        setComplaintOpen(true);
                      }}
                    >
                      Пожаловаться
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col-reverse p-4 gap-4" onScroll={e => {
              const top = (e.target as HTMLElement).scrollTop;
              if (top === 0 && hasMore && !loadingMore) {
                loadMessages(page);
              }
            }}>
              {messages.map(msg => {
                const isExchange = msg.isExchangeProposal && msg.exchange;
                const isApproved = msg.exchange?.status === 'APPROVED';
                const targetListing = isOwner
                  ? msg.exchange?.offeredListing
                  : msg.exchange?.selectedListing;

                return (
                  <div key={msg.messageId} className={`max-w-[75%] p-2 rounded-lg ${msg.authorId === user?.id ? 'ml-auto bg-blue-100' : 'mr-auto bg-gray-100'}`}>
                    {isExchange ? (
                      <>
                        <div onClick={() => navigate(`/books/${msg.exchange.offeredListing.id}`)} className="cursor-pointer">
                          <CoverImage src={msg.exchange.offeredListing.book.imageUrl || ''} className="w-24 h-32 rounded" />
                          <div className="font-semibold">{msg.exchange.offeredListing.book.title}</div>
                          <div className="text-sm text-muted-foreground">{msg.exchange.offeredListing.book.author}</div>
                        </div>

                        {msg.exchange.status === 'PENDING' && isOwner && (
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" variant="default" onClick={() => handleApproveExchange(msg.exchange.id)}>
                              Принять
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectExchange(msg.exchange.id)}>
                              Отклонить
                            </Button>
                          </div>
                        )}

                        {isApproved && targetListing && (
                          <div className="mt-4 border rounded p-3 bg-gray-50 text-sm space-y-2">
                            <div className="flex items-center gap-3">
                              <CoverImage src={targetListing.book.imageUrl} className="w-10 h-14 rounded" />
                              <div>
                                <div className="font-medium">
                                  <a href={`/books/${targetListing.id}`} className="hover:underline">
                                    {targetListing.book.title}
                                  </a>
                                </div>
                                <div className="text-muted-foreground">{targetListing.book.author}</div>
                              </div>
                            </div>
                            <div>Обмен уже завершился? Поделитесь впечатлениями.</div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  navigate(`/profile/${otherUser?.authorId}?tab=reviews&listingId=${targetListing.id}`)
                                }
                              >
                                Да, оставить отзыв
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/books/${targetListing.id}/complaint`)}
                              >
                                Нет, написать жалобу
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                        {Array.isArray(msg.imageUrls) && msg.imageUrls.length > 0 && (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {msg.imageUrls.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt="msg-img"
                                className="w-24 h-24 object-cover rounded cursor-pointer"
                                onClick={() => setViewer({ images: msg.imageUrls!, index: idx })}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              {loadingMore && <div className="text-center text-muted-foreground text-sm py-4">Загрузка...</div>}
            </div>

            <div className="border-t p-4 space-y-2">
              {selectedOffer && (
                <div className="flex items-center gap-4 border rounded p-2">
                  <CoverImage src={selectedOffer.book.imageUrl || ''} className="w-16 h-24 rounded" />
                  <div>
                    <div className="font-semibold">{selectedOffer.book.title}</div>
                    <div className="text-sm text-muted-foreground">{selectedOffer.book.author}</div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setSelectedOffer(null)}>✕</Button>
                </div>
              )}

              <Textarea
                placeholder="Напишите сообщение..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <ImagePicker images={images} setImages={setImages} />

              <div className="flex gap-2 justify-between">
                {selectedDialog?.listingOwnerId !== user?.id && (
                  <Button variant="secondary" onClick={() => setShowSelector(true)}>
                    Предложить книгу для обмена
                  </Button>
                )}
                <Button onClick={handleSend}>Отправить</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}
      </main>

      {viewer && (
        <ImageViewerModal
          open
          images={viewer.images}
          initialIndex={viewer.index}
          onClose={() => setViewer(null)}
        />
      )}

      {showSelector && (
        <ListingSelector
          open={true}
          onClose={() => setShowSelector(false)}
          userId={user!.id}
          onSelect={(listing) => {
            setSelectedOffer(listing);
            setShowSelector(false);
          }}
        />
      )}

      {complaintTargetId && (
        <ComplaintModal
          open={complaintOpen}
          onClose={() => setComplaintOpen(false)}
          userId={complaintTargetId}
        />
      )}

    </div>
  );
};

export default DialogsPage;
