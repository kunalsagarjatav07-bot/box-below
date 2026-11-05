import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '../components/chat/BaseChat';
import { Chat } from '../components/chat/Chat.client';
import { Header } from '../components/header/Header';
import { MODEL_LIST } from '../utils/constants';

export const meta: MetaFunction = () => {
  return [{ title: 'Kodex.sbs' }, { name: 'description', content: 'Kodex.sbs — AI-powered development workspace by Kunal Sagar.' }];
};

export const loader = () => json({});

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <ClientOnly fallback={<BaseChat model={MODEL_LIST[0]?.name ?? ''} setModel={() => {}} />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
