'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { PhoneFrame } from '@/components/PhoneFrame';
import { KidBottomNav } from '@/components/KidBottomNav';
import { CompanionBar } from '@/components/CompanionBar';
import { KidButton } from '@/components/KidButton';
import { getMapProgress, completeAdventureNode, completeBossNode, MapProgress } from '@/lib/actions/map';

const NODE_COUNT = 10;
const BOSS_NODES = new Set([2, 5, 8]); // 0-based: nodes 3, 6, 9

function nodeLabel(index: number) {
  if (index === 0) return '出發點';
  if (index === NODE_COUNT - 1) return '終點';
  return `第 ${index + 1} 關`;
}

function isBoss(index: number) {
  return BOSS_NODES.has(index);
}

type NodeStatus = 'locked' | 'active' | 'done' | 'boss';

function getNodeStatus(index: number, progress: MapProgress): NodeStatus {
  if (progress.completed.includes(index)) return 'done';
  if (progress.current === index) return isBoss(index) ? 'boss' : 'active';
  if (progress.current > index) return 'done';
  return 'locked';
}

function getInitialProgress(): MapProgress {
  return getMapProgress();
}

export default function AdventurePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<MapProgress>(getInitialProgress);

  const nodes = Array.from({ length: NODE_COUNT }, (_, i) => i);

  return (
    <PhoneFrame>
      <CompanionBar title="冒險地圖" backHref="/" backLabel="首頁" rightLabel={`${progress.completed.length} / ${NODE_COUNT}`} />
      <section className="adventure-stage">
        <div className="adventure-header">
          <h1 className="adventure-title">冒險地圖</h1>
          <p className="adventure-sub">完成 10 個節點，打敗 Boss</p>
        </div>

        <div className="adventure-route">
          <div className="adventure-route-line" aria-hidden="true" />
          <div className="adventure-nodes">
            {nodes.map((index) => {
              const status = getNodeStatus(index, progress);
              const isCurrent = progress.current === index;
              const isBossNode = isBoss(index);
              const bossHref = `/boss?nodeIndex=${index}` as Route;

              return (
                <div key={index} className={`adventure-node ${status}`}>
                  <div className="adventure-node-pin">
                    {status === 'done' ? (
                      <span className="adventure-node-check" aria-hidden="true" />
                    ) : (
                      <span className="adventure-node-num">{index + 1}</span>
                    )}
                  </div>
                  <div className="adventure-node-info">
                    <span className="adventure-node-label">
                      {nodeLabel(index)}
                      {isBossNode ? <span className="boss-crown-icon" aria-hidden="true" /> : ''}
                    </span>
                    <span className="adventure-node-status">
                      {status === 'done'
                        ? '已完成'
                        : status === 'boss'
                          ? 'Boss'
                          : status === 'active'
                            ? '目前關卡'
                            : '未解鎖'}
                    </span>
                  </div>
                  {isCurrent ? (
                    <div className="adventure-node-cta">
                      {isBossNode ? (
                        <Link href={bossHref} className="kid-cta adventure-cta">
                          挑戰 Boss
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const next = completeAdventureNode(progress.current);
                            setProgress(next);
                            router.push('/practice');
                          }}
                          className="kid-cta adventure-cta"
                        >
                          前往第 {index + 1} 關
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="adventure-footer">
          <KidButton href="/" tone="white">
            回首頁
          </KidButton>
        </div>
      </section>
      <KidBottomNav />
    </PhoneFrame>
  );
}
