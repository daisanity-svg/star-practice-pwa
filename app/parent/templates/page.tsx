import Link from 'next/link';
import type { Route } from 'next';
import { KidTopBar } from '@/components/KidTopBar';
import { createQuestionTemplate } from '@/lib/actions/learning';
import { getQuestionTemplates } from '@/lib/data/templates';

const cardClass = 'kid-card';

export default async function ParentTemplatesPage() {
  const templates = await getQuestionTemplates();
  return (
    <div className="safe-screen">
      <KidTopBar title="題型模板" backHref="/parent/dashboard" />
      <main className="kid-shell">
        <section className={cardClass}>
          <p className="kid-card-label">Template</p>
          <h1 className="kid-card-title">自動出題句型</h1>
          <p className="kid-card-subtitle">建立模板後，系統會自動把學習素材組成題目。</p>
        </section>

        <section className={`${cardClass} kid-create-panel`}>
          <h2 className="kid-section-title">新增模板</h2>
          <form action={createQuestionTemplate} className="kid-stack">
            <div className="kid-grid-2">
              <label className="kid-field">
                <span className="kid-field-label">類型</span>
                <select name="type" className="kid-input" defaultValue="bopomofo">
                  <option value="bopomofo">注音</option>
                  <option value="english">英文</option>
                  <option value="all">通用</option>
                </select>
              </label>
              <label className="kid-field">
                <span className="kid-field-label">題型</span>
                <select name="practice_mode" className="kid-input" defaultValue="choice">
                  <option value="intro">認識題</option>
                  <option value="choice">選擇題</option>
                  <option value="listening">聽音題</option>
                  <option value="tracing">描寫題</option>
                  <option value="recall">回想題</option>
                  <option value="sorting">分類題</option>
                </select>
              </label>
            </div>

            <label className="kid-field">
              <span className="kid-field-label">模板文字</span>
              <input name="template_text" className="kid-input" placeholder="{keyword} 的 {content} 在哪裡？" required />
            </label>
            <label className="kid-field">
              <span className="kid-field-label">語音提示文字</span>
              <input name="instruction_audio_text" className="kid-input" placeholder="找找看，{keyword} 的 {content}" />
            </label>

            <div className="kid-grid-2">
              <label className="kid-field">
                <span className="kid-field-label">難度 1-5</span>
                <input name="difficulty_level" className="kid-input" type="number" min="1" max="5" defaultValue="1" />
              </label>
            </div>

            <button className="kid-cta" type="submit">
              新增模板
            </button>
          </form>
        </section>

        <section className="kid-stack">
          {templates.map((template) => (
            <div key={template.id} className={cardClass}>
              <div className="kid-status-row">
                <div>
                  <p className="kid-card-label">
                    {template.type}｜{template.practice_mode}
                  </p>
                  <h2 className="kid-card-title" style={{ marginTop: 6 }}>{template.template_text}</h2>
                </div>
                <span className="kid-pill kid-pill-info">Lv.{template.difficulty_level}</span>
              </div>
              {template.instruction_audio_text ? (
                <p className="kid-meta" style={{ marginTop: 10 }}>
                  語音：{template.instruction_audio_text}
                </p>
              ) : null}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
